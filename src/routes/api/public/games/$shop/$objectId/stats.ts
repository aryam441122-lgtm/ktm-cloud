import { createFileRoute } from "@tanstack/react-router";
import { json, options204 } from "@/lib/steam-catalogue";

export const Route = createFileRoute("/api/public/games/$shop/$objectId/stats")({
  server: {
    handlers: {
      OPTIONS: async () => options204(),
      GET: async ({ params }) => {
        const { shop, objectId } = params;
        let playerCount = 0;

        if (shop === "steam" && /^\d+$/.test(objectId)) {
          try {
            const res = await fetch(
              `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${objectId}`
            );
            if (res.ok) {
              const body = (await res.json()) as {
                response?: { player_count?: number };
              };
              playerCount = body?.response?.player_count ?? 0;
            }
          } catch {
            playerCount = 0;
          }
        }

        return json({
          downloadCount: 0,
          playerCount,
          averageScore: null,
          reviewCount: 0,
        });
      },
    },
  },
});
