import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ResyncCoordinator } from "./resync-coordinator.ts";

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe("ResyncCoordinator", () => {
  it("coalesces bursts and serializes work", async () => {
    const runs: string[][] = [];
    const resolvers: Array<() => void> = [];
    const coordinator = new ResyncCoordinator<"profile" | "notifications">(
      (scopes) =>
        new Promise<void>((resolve) => {
          runs.push([...scopes]);
          resolvers.push(resolve);
        })
    );
    const signal = new AbortController().signal;

    const first = coordinator.request(["profile"], signal);
    const second = coordinator.request(["notifications"], signal);
    await tick();
    assert.deepEqual(runs, [["profile", "notifications"]]);

    const third = coordinator.request(["profile"], signal);
    await tick();
    assert.equal(runs.length, 1);
    resolvers[0]();
    await tick();
    assert.deepEqual(runs, [["profile", "notifications"], ["profile"]]);
    resolvers[1]();
    await Promise.all([first, second, third]);
  });

  it("aborts shared work only after every requester aborts", async () => {
    let runSignal: AbortSignal | undefined;
    const coordinator = new ResyncCoordinator<"notifications">(
      async (_scopes, signal) => {
        runSignal = signal;
        await new Promise<void>((resolve) => {
          signal.addEventListener("abort", () => resolve(), { once: true });
        });
      }
    );
    const first = new AbortController();
    const second = new AbortController();

    const requests = [
      coordinator.request(["notifications"], first.signal),
      coordinator.request(["notifications"], second.signal),
    ];
    await tick();
    first.abort();
    assert.equal(runSignal?.aborted, false);
    second.abort();
    assert.equal(runSignal?.aborted, true);
    await Promise.all(requests);
  });
});
