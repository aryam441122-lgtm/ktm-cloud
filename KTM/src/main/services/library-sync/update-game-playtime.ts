import type { Game } from "@types";
import { KTMApi } from "../ktm-api";

export const trackGamePlaytime = async (
  game: Game,
  deltaInMillis: number,
  lastTimePlayed: Date
) => {
  if (game.shop === "custom") {
    return;
  }

  // Playtime is tracked locally; no remote library sync in KTM Cloud yet.
  if (!KTMApi.LEGACY_CLOUD_ENABLED) {
    return;
  }

  return KTMApi.put(`/profile/games/${game.shop}/${game.objectId}`, {
    playTimeDeltaInSeconds: Math.trunc(deltaInMillis / 1000),
    lastTimePlayed,
  });
};
