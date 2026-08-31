import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";

import { db } from "@main/level";
import { levelKeys } from "@main/level/sublevels";
import { logger } from "../logger";
import type { UserDetails, User } from "@types";

/**
 * KTM Cloud (Lovable Cloud) authentication + profile service.
 *
 * This replaces the legacy remote account system. Everything account related
 * (sign up, sign in, sign out, profile) now lives here.
 */

export const KTM_CLOUD_URL = "https://lmxuhcirmfopmspcxlsd.supabase.co";
export const KTM_CLOUD_PUBLISHABLE_KEY =
  "sb_publishable__umfAsPycKhYbwHCzc_tvQ_vfINo7ni";

interface KTMCloudProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  background_image_url: string | null;
  bio: string | null;
}

/** Session storage backed by the local level database (no browser storage). */
const levelStorage = {
  getItem: async (key: string) => {
    try {
      const value = await db.get<string, string>(
        levelKeys.ktmCloudSession(key),
        { valueEncoding: "utf8" }
      );
      return value ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    await db.put<string, string>(levelKeys.ktmCloudSession(key), value, {
      valueEncoding: "utf8",
    });
  },
  removeItem: async (key: string) => {
    try {
      await db.del(levelKeys.ktmCloudSession(key));
    } catch {
      /* ignore */
    }
  },
};

export class KTMCloud {
  private static client: SupabaseClient | null = null;

  public static getClient(): SupabaseClient {
    if (!this.client) {
      this.client = createClient(KTM_CLOUD_URL, KTM_CLOUD_PUBLISHABLE_KEY, {
        auth: {
          storage: levelStorage as never,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: "pkce",
        },
      });
    }

    return this.client;
  }

  public static async getSession(): Promise<Session | null> {
    const { data } = await this.getClient().auth.getSession();
    return data.session ?? null;
  }

  public static async isLoggedIn() {
    return (await this.getSession()) !== null;
  }

  public static async signUp(payload: {
    email: string;
    password: string;
    username?: string;
    displayName?: string;
  }) {
    const { data, error } = await this.getClient().auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          username: payload.username ?? "",
          display_name: payload.displayName ?? payload.username ?? "",
        },
      },
    });

    if (error) throw new Error(error.message);

    if (!data.session) {
      /* Account created but not signed in yet, sign in right away. */
      return this.signIn(payload);
    }

    await this.syncLocalUser();
    return this.getMe();
  }

  public static async signIn(payload: { email: string; password: string }) {
    const { error } = await this.getClient().auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) throw new Error(error.message);

    await this.syncLocalUser();
    return this.getMe();
  }

  public static async signOut() {
    try {
      await this.getClient().auth.signOut();
    } catch (err) {
      logger.error("KTM Cloud sign out failed", err);
    }
  }

  public static async getMe(): Promise<UserDetails | null> {
    const session = await this.getSession();
    if (!session) return null;

    const { data, error } = await this.getClient()
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      logger.error("Failed to load KTM Cloud profile", error);
      return null;
    }

    return this.mapProfile(data as KTMCloudProfile | null, session);
  }

  public static async updateProfile(values: {
    displayName?: string;
    bio?: string;
    profileImageUrl?: string | null;
    backgroundImageUrl?: string | null;
  }): Promise<UserDetails | null> {
    const session = await this.getSession();
    if (!session) return null;

    const patch: Record<string, unknown> = {};
    if (values.displayName !== undefined) patch.display_name = values.displayName;
    if (values.bio !== undefined) patch.bio = values.bio;
    if (values.profileImageUrl !== undefined)
      patch.avatar_url = values.profileImageUrl;
    if (values.backgroundImageUrl !== undefined)
      patch.background_image_url = values.backgroundImageUrl;

    const { data, error } = await this.getClient()
      .from("profiles")
      .update(patch)
      .eq("id", session.user.id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);

    await this.syncLocalUser();
    return this.mapProfile(data as KTMCloudProfile | null, session);
  }

  private static mapProfile(
    profile: KTMCloudProfile | null,
    session: Session
  ): UserDetails | null {
    if (!profile) return null;

    return {
      id: profile.id,
      username: profile.username,
      email: session.user.email ?? null,
      displayName: profile.display_name || profile.username,
      profileImageUrl: profile.avatar_url,
      backgroundImageUrl: profile.background_image_url,
      profileVisibility: "PUBLIC",
      souvenirsVisibility: "PUBLIC",
      bio: profile.bio ?? "",
      workwondersJwt: "",
      subscription: null,
      karma: 0,
    } as UserDetails;
  }

  /** Keeps the local `user` entry in sync so offline surfaces keep working. */
  private static async syncLocalUser() {
    try {
      const me = await this.getMe();
      if (!me) return;

      const user = await db
        .get<string, User>(levelKeys.user, { valueEncoding: "json" })
        .catch(() => null);

      await db.put<string, User>(
        levelKeys.user,
        {
          ...(user ?? {}),
          id: me.id,
          displayName: me.displayName,
          profileImageUrl: me.profileImageUrl,
          backgroundImageUrl: me.backgroundImageUrl,
          subscription: null,
        } as User,
        { valueEncoding: "json" }
      );
    } catch (err) {
      logger.error("Failed to sync local KTM user", err);
    }
  }
}
