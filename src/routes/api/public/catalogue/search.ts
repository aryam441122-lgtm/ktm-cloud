import { createFileRoute } from "@tanstack/react-router";
import {
  buildSteamAssets,
  getFeatured,
  json,
  options204,
  searchSteam,
} from "@/lib/steam-catalogue";

export const Route = createFileRoute("/api/public/catalogue/search")({
  server: {
    handlers: {
      OPTIONS: async () => options204(),
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }

        const title = typeof body.title === "string" ? body.title.trim() : "";
        const take = Math.min(Number(body.take ?? 24) || 24, 60);
        const skip = Math.max(Number(body.skip ?? 0) || 0, 0);

        try {
          let items: { id: number; name: string }[] = [];

          if (title.length > 0) {
            items = await searchSteam(title);
          } else {
            const featured = await getFeatured();
            const seen = new Set<number>();
            for (const key of ["top_sellers", "new_releases", "specials", "coming_soon"]) {
              for (const item of featured[key] ?? []) {
                if (seen.has(item.id)) continue;
                seen.add(item.id);
                items.push(item);
              }
            }
          }

          const page = items.slice(skip, skip + take);

          return json({
            count: items.length,
            edges: page.map((item) => {
              const assets = buildSteamAssets(String(item.id), item.name);
              return {
                id: `steam:${item.id}`,
                objectId: String(item.id),
                title: item.name,
                shop: "steam",
                genres: [],
                releaseYear: null,
                libraryImageUrl: assets.libraryImageUrl,
                downloadSources: [],
              };
            }),
          });
        } catch {
          return json({ count: 0, edges: [] });
        }
      },
    },
  },
});
