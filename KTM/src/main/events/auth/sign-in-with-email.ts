import { registerEvent } from "../register-event";
import { KTMCloud } from "@main/services/ktm-cloud";
import { WindowManager } from "@main/services";

const signInWithEmail = async (
  _event: Electron.IpcMainInvokeEvent,
  payload: { email: string; password: string }
) => {
  const userDetails = await KTMCloud.signIn(payload);

  WindowManager.sendToAppWindows("on-signin");

  return userDetails;
};

registerEvent("signInWithEmail", signInWithEmail);
