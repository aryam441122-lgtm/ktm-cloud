import { registerEvent } from "../register-event";
import { logger, KTMApi } from "@main/services";
import { KTM_DECKY_PLUGIN_LOCATION } from "@main/constants";
import fs from "node:fs";
import path from "node:path";

interface DeckyReleaseInfo {
  version: string;
  downloadUrl: string;
}

const getKTMDeckyPluginInfo = async (
  _event: Electron.IpcMainInvokeEvent
): Promise<{
  installed: boolean;
  version: string | null;
  path: string;
  outdated: boolean;
  expectedVersion: string | null;
}> => {
  try {
    // Fetch the expected version from API
    let expectedVersion: string | null = null;
    try {
      const releaseInfo = await KTMApi.get<DeckyReleaseInfo>(
        "/decky/release",
        {},
        { needsAuth: false }
      );
      expectedVersion = releaseInfo.version;
    } catch (error) {
      logger.error("Failed to fetch Decky release info:", error);
    }

    // Check if plugin folder exists
    if (!fs.existsSync(KTM_DECKY_PLUGIN_LOCATION)) {
      logger.log("KTM Decky plugin not installed");
      return {
        installed: false,
        version: null,
        path: KTM_DECKY_PLUGIN_LOCATION,
        outdated: true,
        expectedVersion,
      };
    }

    // Check if package.json exists
    const packageJsonPath = path.join(
      KTM_DECKY_PLUGIN_LOCATION,
      "package.json"
    );

    if (!fs.existsSync(packageJsonPath)) {
      logger.log("KTM Decky plugin package.json not found");
      return {
        installed: false,
        version: null,
        path: KTM_DECKY_PLUGIN_LOCATION,
        outdated: true,
        expectedVersion,
      };
    }

    // Read and parse package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    const version = packageJson.version;

    const outdated = expectedVersion ? version !== expectedVersion : false;

    logger.log(
      `KTM Decky plugin installed, version: ${version}, expected: ${expectedVersion}, outdated: ${outdated}`
    );

    return {
      installed: true,
      version,
      path: KTM_DECKY_PLUGIN_LOCATION,
      outdated,
      expectedVersion,
    };
  } catch (error) {
    logger.error("Failed to get plugin info:", error);
    return {
      installed: false,
      version: null,
      path: KTM_DECKY_PLUGIN_LOCATION,
      outdated: true,
      expectedVersion: null,
    };
  }
};

registerEvent("getKTMDeckyPluginInfo", getKTMDeckyPluginInfo);
