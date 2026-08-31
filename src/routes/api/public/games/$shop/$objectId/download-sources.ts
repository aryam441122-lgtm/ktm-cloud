import { createFileRoute } from "@tanstack/react-router";
import { json, options204, getSteamTitle } from "@/lib/steam-catalogue";
import { findRepacks } from "@/lib/repack-index";

export const Route = createFileRoute(
  "/api/public/games/$shop/$objectId/download-sources"
)({
  server: {
    handlers: {
      OPTIONS: async () => options204(),
      GET: async ({ request, params }) => {
        const url = new URL(request.url);
        const take = Number(url.searchParams.get("take") ?? 100) || 100;
        const skip = Number(url.searchParams.get("skip") ?? 0) || 0;
        const titleParam = url.searchParams.get("title");

        const title = titleParam || (await getSteamTitle(params.objectId));
        if (!title) return json([]);

        try {
          const repacks = await findRepacks(url.origin, title, take, skip);
          return json(repacks);
        } catch {
          return json([]);
        }
      },
    },
  },
});
