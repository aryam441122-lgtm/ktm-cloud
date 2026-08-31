import { registerEvent } from "../register-event";
import { KTMCloud } from "@main/services/ktm-cloud";

const getCloudSession = async (_event: Electron.IpcMainInvokeEvent) => {
  const session = await KTMCloud.getSession();

  if (!session) return null;

  return {
    userId: session.user.id,
    email: session.user.email ?? null,
    expiresAt: session.expires_at ?? null,
  };
};

registerEvent("getCloudSession", getCloudSession);
