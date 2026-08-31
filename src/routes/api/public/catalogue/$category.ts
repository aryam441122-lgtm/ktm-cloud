import { createFileRoute } from "@tanstack/react-router";
import {
  buildSteamAssets,
  getFeatured,
  json,
  options204,
} from "@/lib/steam-catalogue";

const CATEGORY_MAP: Record<string, string[]> = {
  hot: ["top_sellers", "specials", "new_releases"],
  weekly: ["specials", "new_releases", "top_sellers"],
  achievements: ["new_releases", "top_sellers", "specials"],
};

export const Route = createFileRoute("/api/public/catalogue/$category")({
  server: {
    handlers: {
      OPTIONS: async () => options204(),
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const take = Math.min(Number(url.searchParams.get("take") ?? 12) || 12, 50);
        const skip = Math.max(Number(url.searchParams.get("skip") ?? 0) || 0, 0);

        const keys = CATEGORY_MAP[params.category] ?? CATEGORY_MAP.hot;

        try {
          const featured = await getFeatured();
          const seen = new Set<number>();
          const items: { id: number; name: string }[] = [];

          for (const key of keys) {
            for (const item of featured[key] ?? []) {
              if (seen.has(item.id)) continue;
              seen.add(item.id);
              items.push(item);
            }
          }

          return json(
            items
              .slice(skip, skip + take)
              .map((item) => buildSteamAssets(String(item.id), item.name))
          );
        } catch {
          return json([]);
        }
      },
    },
  },
});
