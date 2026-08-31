import type { Game } from "@types";
import { KTMApi } from "../ktm-api";
import { gamesSublevel, levelKeys } from "@main/level";

export const createGame = async (game: Game) => {
  if (game.shop === "custom") {
    return;
  }

  // KTM Cloud handles accounts only; the library stays local for now.
  if (!KTMApi.LEGACY_CLOUD_ENABLED) {
    return;
  }

  return KTMApi.post(`/profile/games`, {
    objectId: game.objectId,
    playTimeInMilliseconds: Math.trunc(game.playTimeInMilliseconds ?? 0),
    shop: game.shop,
    lastTimePlayed: game.lastTimePlayed,
  }).then((response) => {
    const {
      id: remoteId,
      playTimeInMilliseconds,
      lastTimePlayed,
      createdAt,
    } = response;

    gamesSublevel.put(levelKeys.game(game.shop, game.objectId), {
      ...game,
      remoteId,
      addedToLibraryAt:
        game.addedToLibraryAt ?? (createdAt ? new Date(createdAt) : new Date()),
      playTimeInMilliseconds,
      lastTimePlayed,
    });
  });
};
