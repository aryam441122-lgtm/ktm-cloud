import { type UserDetails } from "@types";
import { KTMCloud } from "../ktm-cloud";
import { logger } from "../logger";

/**
 * User data now comes from KTM Cloud (Lovable Cloud).
 * The legacy remote account API is no longer used.
 */
export const getUserData = async (): Promise<UserDetails | null> => {
  try {
    return await KTMCloud.getMe();
  } catch (err) {
    logger.error("Failed to get KTM Cloud user data", err);
    return null;
  }
};
