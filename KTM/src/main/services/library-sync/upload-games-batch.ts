import { chunk } from "lodash-es";
import { KTMApi } from "../ktm-api";
import { mergeWithRemoteGames } from "./merge-with-remote-games";
import { WindowManager } from "../window-manager";
import { AchievementWatcherManager } from "../achievements/achievement-watcher-manager";
import { gamesSublevel } from "@main/level";

export const uploadGamesBatch = async () => {
  if (!KTMApi.LEGACY_CLOUD_ENABLED) {
    // Local-only library: nothing to upload, but keep the local flow intact.
    AchievementWatcherManager.preSearchAchievements();

    if (WindowManager.mainWindow)
      WindowManager.sendToAppWindows("on-library-batch-complete");

    return;
  }

  const games = await gamesSublevel
    .values()
    .all()
    .then((results) => {
      return results.filter(
        (game) =>
          !game.isDeleted && game.remoteId === null && game.shop !== "custom"
      );
    });

  const gamesChunks = chunk(games, 30);

  for (const chunk of gamesChunks) {
    await KTMApi.post(
      "/profile/games/batch",
      chunk.map((game) => {
        return {
          objectId: game.objectId,
          playTimeInMilliseconds: Math.trunc(game.playTimeInMilliseconds),
          shop: game.shop,
          lastTimePlayed: game.lastTimePlayed,
          isFavorite: game.favorite,
          isPinned: game.isPinned ?? false,
        };
      })
    ).catch(() => {});
  }

  await mergeWithRemoteGames();

  AchievementWatcherManager.preSearchAchievements();

  if (WindowManager.mainWindow)
    WindowManager.sendToAppWindows("on-library-batch-complete");
};
