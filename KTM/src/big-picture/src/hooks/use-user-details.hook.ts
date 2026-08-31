import { useCallback, useEffect, useMemo } from "react";
import { IS_DESKTOP } from "../constants";
import type {
  UpdateProfileRequest,
  UserDetails,
  UserProfile,
} from "@types";
import { useBigPictureUserDetailsStore } from "../stores";

function mergeUserProfileIntoDetails(
  currentUserDetails: UserDetails | null,
  updatedProfile: UserProfile
): UserDetails {
  return {
    id: updatedProfile.id,
    username: currentUserDetails?.username ?? "",
    email: updatedProfile.email,
    displayName: updatedProfile.displayName,
    profileImageUrl: updatedProfile.profileImageUrl,
    backgroundImageUrl: updatedProfile.backgroundImageUrl,
    profileVisibility: updatedProfile.profileVisibility,
    souvenirsVisibility: updatedProfile.souvenirsVisibility,
    bio: updatedProfile.bio,
    workwondersJwt: currentUserDetails?.workwondersJwt ?? "",
    subscription: currentUserDetails?.subscription ?? null,
    karma: currentUserDetails?.karma ?? 0,
    quirks: updatedProfile.quirks,
  };
}

export function useUserDetails() {
  const userDetails = useBigPictureUserDetailsStore(
    (state) => state.userDetails
  );
  const setUserDetails = useBigPictureUserDetailsStore(
    (state) => state.setUserDetails
  );
  const clearUserDetails = useBigPictureUserDetailsStore(
    (state) => state.clearUserDetails
  );

  const fetchUserDetails = useCallback(async () => {
    if (!IS_DESKTOP) return null;

    try {
      const details = await window.electron.getMe();
      setUserDetails(details);
      return details;
    } catch {
      clearUserDetails();
      return null;
    }
  }, [clearUserDetails, setUserDetails]);

  const updateUserDetails = useCallback(
    (nextDetails: UserDetails | null) => {
      setUserDetails(nextDetails);
      return nextDetails;
    },
    [setUserDetails]
  );

  const signOut = useCallback(async () => {
    clearUserDetails();

    return globalThis.window.electron.signOut();
  }, [clearUserDetails]);

  const patchUser = useCallback(
    async (values: UpdateProfileRequest) => {
      const updatedProfile = (await window.electron.updateProfile(
        values
      )) as UserProfile;
      const nextUserDetails = mergeUserProfileIntoDetails(
        userDetails,
        updatedProfile
      );

      setUserDetails(nextUserDetails);

      return nextUserDetails;
    },
    [setUserDetails, userDetails]
  );

  const unblockUser = useCallback(async (userId: string) => {
    return globalThis.window.electron.ktmApi.post(`/users/${userId}/unblock`);
  }, []);

  const blockUser = useCallback(async (userId: string) => {
    return globalThis.window.electron.ktmApi.post(`/users/${userId}/block`);
  }, []);

  useEffect(() => {
    void fetchUserDetails();
  }, [fetchUserDetails]);

  useEffect(() => {
    if (!IS_DESKTOP) return;

    const unsubscribeAccountUpdated =
      globalThis.window.electron.onAccountUpdated(() => {
        void fetchUserDetails();
      });
    const unsubscribeSignIn = globalThis.window.electron.onSignIn(() => {
      void fetchUserDetails();
    });
    const unsubscribeSignOut = globalThis.window.electron.onSignOut(() => {
      clearUserDetails();
    });

    return () => {
      unsubscribeAccountUpdated();
      unsubscribeSignIn();
      unsubscribeSignOut();
    };
  }, [clearUserDetails, fetchUserDetails]);

  const hasActiveSubscription = useMemo(() => {
    const expiresAt = new Date(userDetails?.subscription?.expiresAt ?? 0);
    return expiresAt > new Date();
  }, [userDetails]);

  return {
    userDetails,
    hasActiveSubscription,
    fetchUserDetails,
    signOut,
    updateUserDetails,
    patchUser,
    blockUser,
    unblockUser,
  };
}
