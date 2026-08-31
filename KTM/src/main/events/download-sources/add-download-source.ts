import { registerEvent } from "../register-event";
import { KTMApi } from "@main/services/ktm-api";
import { downloadSourcesSublevel } from "@main/level";
import type { DownloadSource } from "@types";
import { logger } from "@main/services";
import axios from "axios";
import crypto from "node:crypto";
import { DownloadSourceStatus } from "@shared";

const idFromUrl = (url: string) => {
  const hex = crypto.createHash("sha1").update(url).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

/**
 * Fallback used when the API is unreachable or rejects the request:
 * fetch the JSON file directly and build the source locally.
 */
const buildSourceFromUrl = async (url: string): Promise<DownloadSource> => {
  const { data } = await axios.get(url, {
    timeout: 30_000,
    headers: { accept: "application/json" },
  });

  const payload = typeof data === "string" ? JSON.parse(data) : data;

  if (!payload || !Array.isArray(payload.downloads)) {
    throw new Error("Download source is missing a 'downloads' array");
  }

  const name =
    typeof payload.name === "string" && payload.name.trim()
      ? payload.name.trim()
      : (new URL(url).pathname.split("/").pop() ?? "Download Source");

  return {
    id: idFromUrl(url),
    name,
    url,
    status: DownloadSourceStatus.Matched,
    downloadCount: payload.downloads.length,
    createdAt: new Date().toISOString(),
  };
};

const addDownloadSource = async (
  _event: Electron.IpcMainInvokeEvent,
  url: string
) => {
  const existingSources = await downloadSourcesSublevel.values().all();
  const urlExists = existingSources.some((source) => source.url === url);

  if (urlExists) {
    throw new Error("Download source with this URL already exists");
  }

  let downloadSource: DownloadSource;
  let isRemote = true;

  try {
    downloadSource = await KTMApi.post<DownloadSource>(
      "/download-sources",
      { url },
      { needsAuth: false }
    );
  } catch (error) {
    logger.error("API rejected download source, falling back to direct fetch:", error);
    downloadSource = await buildSourceFromUrl(url);
    isRemote = false;
  }

  if (KTMApi.isLoggedIn() && KTMApi.hasActiveSubscription()) {
    try {
      await KTMApi.post("/profile/download-sources", { urls: [url] });
    } catch (error) {
      logger.error("Failed to add download source to profile:", error);
    }
  }

  await downloadSourcesSublevel.put(downloadSource.id, {
    ...downloadSource,
    ...(isRemote ? { isRemote: true as const } : {}),
    createdAt: new Date().toISOString(),
  });

  return downloadSource;
};

registerEvent("addDownloadSource", addDownloadSource);
