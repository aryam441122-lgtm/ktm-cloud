import { createFileRoute } from "@tanstack/react-router";
import { json, options204 } from "@/lib/steam-catalogue";

export const Route = createFileRoute("/api/public/games/shop-details")({
  server: {
    handlers: {
      OPTIONS: async () => options204(),
      POST: async () => json([]),
    },
  },
});
