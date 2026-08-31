import {
  getCloudSaveAccessAction,
  SubscriptionRequiredError,
  UserNotLoggedInError,
} from "@shared";

import { KTMApi } from "../ktm-api";

export const canAccessCloudSaves = (
  isLoggedIn: boolean,
  hasActiveSubscription: boolean
) => getCloudSaveAccessAction(isLoggedIn, hasActiveSubscription) === "open";

export const assertCloudSaveSubscription = (
  isLoggedIn = KTMApi.isLoggedIn(),
  hasActiveSubscription = KTMApi.hasActiveSubscription()
) => {
  if (!isLoggedIn) {
    throw new UserNotLoggedInError();
  }
  if (!hasActiveSubscription) {
    throw new SubscriptionRequiredError();
  }
};
