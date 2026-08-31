import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({ url: z.string().url().max(2048) });

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

/** Deterministic id so the same URL always maps to the same source id. */
async function idFromUrl(url: string) {
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(url)
  );
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export const Route = createFileRoute("/api/public/download-sources")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json(
            { error: "Invalid body: { url } is required" },
            { status: 400, headers: cors }
          );
        }

        const upstream = await fetch(parsed.url, {
          headers: { accept: "application/json" },
        }).catch(() => null);

        if (!upstream || !upstream.ok) {
          return Response.json(
            { error: "Could not fetch the download source URL" },
            { status: 422, headers: cors }
          );
        }

        let json: { name?: string; downloads?: unknown[] };
        try {
          json = (await upstream.json()) as typeof json;
        } catch {
          return Response.json(
            { error: "Download source is not valid JSON" },
            { status: 422, headers: cors }
          );
        }

        if (!Array.isArray(json.downloads)) {
          return Response.json(
            { error: "Download source is missing a 'downloads' array" },
            { status: 422, headers: cors }
          );
        }

        const name =
          typeof json.name === "string" && json.name.trim()
            ? json.name.trim()
            : new URL(parsed.url).pathname.split("/").pop() || "Download Source";

        return Response.json(
          {
            id: await idFromUrl(parsed.url),
            name,
            url: parsed.url,
            status: "MATCHED",
            downloadCount: json.downloads.length,
            createdAt: new Date().toISOString(),
          },
          { headers: cors }
        );
      },
    },
  },
});
