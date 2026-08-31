import { createFileRoute } from "@tanstack/react-router";
import { buildSteamAssets, json, options204 } from "@/lib/steam-catalogue";

export const Route = createFileRoute("/api/public/games/$shop/$objectId/assets")({
  server: {
    handlers: {
      OPTIONS: async () => options204(),
      GET: async ({ params }) => {
        const { shop, objectId } = params;

        if (shop !== "steam" || !/^\d+$/.test(objectId)) {
          return json(null);
        }

        let title = "";
        try {
          const res = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${objectId}&l=en&filters=basic`
          );
          if (res.ok) {
            const body = (await res.json()) as Record<
              string,
              { success?: boolean; data?: { name?: string } }
            >;
            title = body?.[objectId]?.data?.name ?? "";
          }
        } catch {
          title = "";
        }

        return json(buildSteamAssets(objectId, title));
      },
    },
  },
});
