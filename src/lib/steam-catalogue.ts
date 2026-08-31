// Shared helpers to build KTM-compatible catalogue payloads from public Steam data.

const CDN = "https://cdn.cloudflare.steamstatic.com/steam/apps";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      ...corsHeaders,
    },
  });

export const options204 = () => new Response(null, { status: 204, headers: corsHeaders });

export interface ShopAssets {
  objectId: string;
  shop: string;
  title: string;
  iconUrl: string | null;
  libraryHeroImageUrl: string | null;
  libraryImageUrl: string | null;
  logoImageUrl: string | null;
  logoPosition: string | null;
  coverImageUrl: string | null;
  downloadSources: string[];
}

export const buildSteamAssets = (
  objectId: string,
  title: string,
  downloadSources: string[] = []
): ShopAssets => ({
  objectId,
  shop: "steam",
  title,
  iconUrl: `${CDN}/${objectId}/capsule_231x87.jpg`,
  libraryHeroImageUrl: `${CDN}/${objectId}/library_hero.jpg`,
  libraryImageUrl: `${CDN}/${objectId}/library_600x900.jpg`,
  logoImageUrl: `${CDN}/${objectId}/logo.png`,
  logoPosition: null,
  coverImageUrl: `${CDN}/${objectId}/header.jpg`,
  downloadSources,
});

interface FeaturedItem {
  id: number;
  name: string;
}

let featuredCache: { at: number; data: Record<string, FeaturedItem[]> } | null = null;

export const getFeatured = async (): Promise<Record<string, FeaturedItem[]>> => {
  if (featuredCache && Date.now() - featuredCache.at < 1000 * 60 * 30) {
    return featuredCache.data;
  }

  const res = await fetch(
    "https://store.steampowered.com/api/featuredcategories?cc=us&l=en"
  );
  if (!res.ok) throw new Error(`steam featured ${res.status}`);
  const body = (await res.json()) as Record<string, { items?: FeaturedItem[] }>;

  const data: Record<string, FeaturedItem[]> = {};
  for (const key of ["top_sellers", "specials", "new_releases", "coming_soon"]) {
    data[key] = (body[key]?.items ?? []).filter((i) => i && i.id && i.name);
  }

  featuredCache = { at: Date.now(), data };
  return data;
};

export const searchSteam = async (term: string): Promise<FeaturedItem[]> => {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
    term
  )}&cc=us&l=en`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const body = (await res.json()) as { items?: { id: number; name: string }[] };
  return (body.items ?? []).filter((i) => i && i.id && i.name);
};

const titleCache = new Map<string, { at: number; title: string }>();

export const getSteamTitle = async (objectId: string): Promise<string | null> => {
  const cached = titleCache.get(objectId);
  if (cached && Date.now() - cached.at < 1000 * 60 * 60 * 24) return cached.title;

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${objectId}&l=en`
    );
    if (!res.ok) return null;
    const body = (await res.json()) as Record<
      string,
      { success?: boolean; data?: { name?: string } }
    >;
    const name = body[objectId]?.data?.name;
    if (!name) return null;
    titleCache.set(objectId, { at: Date.now(), title: name });
    return name;
  } catch {
    return null;
  }
};
