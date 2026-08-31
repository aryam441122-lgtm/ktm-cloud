import { KTMApi } from "@main/services";
import { downloadSourcesSublevel } from "@main/level";
import { registerEvent } from "../register-event";

const removeDownloadSource = async (
  _event: Electron.IpcMainInvokeEvent,
  removeAll = false,
  downloadSourceId?: string
) => {
  const params = new URLSearchParams({
    all: removeAll.toString(),
  });

  if (downloadSourceId) params.set("downloadSourceId", downloadSourceId);

  if (KTMApi.isLoggedIn() && KTMApi.hasActiveSubscription()) {
    void KTMApi.delete(`/profile/download-sources?${params.toString()}`);
  }

  if (removeAll) {
    await downloadSourcesSublevel.clear();
  } else if (downloadSourceId) {
    await downloadSourcesSublevel.del(downloadSourceId);
  }
};

registerEvent("removeDownloadSource", removeDownloadSource);
