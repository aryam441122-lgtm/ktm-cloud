import { createFileRoute } from "@tanstack/react-router";
import { json, options204 } from "@/lib/steam-catalogue";

export const Route = createFileRoute("/api/public/hosters/availability")({
  server: {
    handlers: {
      OPTIONS: async () => options204(),
      POST: async ({ request }) => {
        let urls: string[] = [];
        try {
          const body = (await request.json()) as { urls?: unknown };
          if (Array.isArray(body?.urls)) {
            urls = body.urls.filter((u): u is string => typeof u === "string").slice(0, 200);
          }
        } catch {
          urls = [];
        }

        return json({ results: urls.map((url) => ({ url, available: true })) });
      },
    },
  },
});
