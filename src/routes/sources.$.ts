import { createFileRoute } from "@tanstack/react-router";
import fitgirlAsset from "@/assets/fitgirl.json.asset.json";

/**
 * Serves download-source JSON files at /sources/<name>.json
 * Small files live in public/sources and are served statically;
 * this handler covers externally hosted (large) sources and normalizes names.
 */
const externalSources: Record<string, string> = {
  "fitgirl.json": fitgirlAsset.url,
  fitgirl: fitgirlAsset.url,
};

const staticSources = ["steamrip.json", "onlinefix.json", "gog.json"];

export const Route = createFileRoute("/sources/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const raw = (params as { _splat?: string })._splat ?? "";
        const name = raw.replace(/^\/+/, "").toLowerCase();

        const origin = new URL(request.url).origin;

        const external = externalSources[name];
        if (external) {
          const upstream = await fetch(
            external.startsWith("http") ? external : `${origin}${external}`
          );
          return new Response(upstream.body, {
            status: upstream.status,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "access-control-allow-origin": "*",
              "cache-control": "public, max-age=3600",
            },
          });
        }

        const withExt = name.endsWith(".json") ? name : `${name}.json`;
        if (staticSources.includes(withExt)) {
          const upstream = await fetch(`${origin}/sources/${withExt}`);
          return new Response(upstream.body, {
            status: upstream.status,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "access-control-allow-origin": "*",
              "cache-control": "public, max-age=3600",
            },
          });
        }

        return Response.json(
          { error: "Source not found" },
          { status: 404, headers: { "access-control-allow-origin": "*" } }
        );
      },
    },
  },
});
