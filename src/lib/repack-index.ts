// Builds a searchable index of download options from the hosted source JSON files.
import fitgirlAsset from "@/assets/fitgirl.json.asset.json";

export interface RawDownload {
  title: string;
  uris?: string[];
  uploadDate?: string | null;
  fileSize?: string | null;
}

export interface RepackEntry {
  id: string;
  title: string;
  normalized: string;
  fileSize: string | null;
  uris: string[];
  unavailableUris: string[];
  uploadDate: string | null;
  downloadSourceId: string;
  downloadSourceName: string;
  createdAt: string;
}

const SOURCES: { key: string; path: string }[] = [
  { key: "steamrip", path: "/sources/steamrip.json" },
  { key: "onlinefix", path: "/sources/onlinefix.json" },
  { key: "gog", path: "/sources/gog.json" },
  { key: "fitgirl", path: fitgirlAsset.url },
];

export const normalizeTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/[\u2018\u2019'’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const cache = new Map<string, { at: number; entries: RepackEntry[] }>();
const TTL = 1000 * 60 * 60;

const loadSource = async (
  origin: string,
  key: string,
  path: string
): Promise<RepackEntry[]> => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL) return cached.entries;

  const url = path.startsWith("http") ? path : `${origin}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${key} ${res.status}`);
  const body = (await res.json()) as { name?: string; downloads?: RawDownload[] };

  const name = body.name || key;
  const entries: RepackEntry[] = (body.downloads ?? [])
    .filter((d) => d && typeof d.title === "string")
    .map((d, index) => ({
      id: `${key}-${index}`,
      title: d.title,
      normalized: normalizeTitle(d.title),
      fileSize: d.fileSize ?? null,
      uris: Array.isArray(d.uris) ? d.uris : [],
      unavailableUris: [],
      uploadDate: d.uploadDate ?? null,
      downloadSourceId: key,
      downloadSourceName: name,
      createdAt: d.uploadDate ?? new Date().toISOString(),
    }));

  cache.set(key, { at: Date.now(), entries });
  return entries;
};

export const findRepacks = async (
  origin: string,
  gameTitle: string,
  take = 100,
  skip = 0
): Promise<RepackEntry[]> => {
  const target = normalizeTitle(gameTitle);
  if (target.length < 2) return [];

  const lists = await Promise.all(
    SOURCES.map((s) =>
      loadSource(origin, s.key, s.path).catch(() => [] as RepackEntry[])
    )
  );

  const matches: RepackEntry[] = [];
  for (const list of lists) {
    for (const entry of list) {
      if (entry.normalized.includes(target)) matches.push(entry);
    }
  }

  matches.sort((a, b) => (b.uploadDate ?? "").localeCompare(a.uploadDate ?? ""));
  return matches.slice(skip, skip + take);
};
