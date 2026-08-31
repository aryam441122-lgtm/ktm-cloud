import { registerEvent } from "../register-event";
import {
  DownloadManager,
  KTMApi,
  SSEClient,
  WindowManager,
  emulators,
  retroarch,
} from "@main/services";
import { KTMCloud } from "@main/services/ktm-cloud";
import { clearGamesPlaytimeState } from "@main/services/game-running-state";
import {
  db,
  downloadLayoutStateSublevel,
  downloadsSublevel,
  gamesSublevel,
  levelKeys,
} from "@main/level";

const signOut = async (_event: Electron.IpcMainInvokeEvent) => {
  SSEClient.close();

  const databaseOperations = db
    .batch([
      {
        type: "del",
        key: levelKeys.auth,
      },
      {
        type: "del",
        key: levelKeys.user,
      },
    ])
    .then(() => {
      /* Removes all games being played */
      clearGamesPlaytimeState();

      return Promise.all([
        gamesSublevel.clear(),
        downloadsSublevel.clear(),
        downloadLayoutStateSublevel.clear(),
        emulators.resetEmulatorScanData(),
        retroarch.resetRetroArchScanData(),
      ]);
    });

  /* Cancels any ongoing downloads */
  DownloadManager.cancelDownload();

  await KTMCloud.signOut();
  await KTMApi.handleSignOut();


  await databaseOperations;
};

registerEvent("signOut", signOut);
