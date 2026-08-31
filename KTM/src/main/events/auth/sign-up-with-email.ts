import { registerEvent } from "../register-event";
import { KTMCloud } from "@main/services/ktm-cloud";
import { WindowManager } from "@main/services";

const signUpWithEmail = async (
  _event: Electron.IpcMainInvokeEvent,
  payload: {
    email: string;
    password: string;
    username?: string;
    displayName?: string;
  }
) => {
  const userDetails = await KTMCloud.signUp(payload);

  WindowManager.sendToAppWindows("on-signin");

  return userDetails;
};

registerEvent("signUpWithEmail", signUpWithEmail);
