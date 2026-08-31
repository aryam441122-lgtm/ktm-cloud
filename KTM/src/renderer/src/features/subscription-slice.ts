import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { KTMCloudFeature } from "@types";

export interface SubscriptionState {
  isKTMCloudModalVisible: boolean;
  feature: KTMCloudFeature | "";
}

const initialState: SubscriptionState = {
  isKTMCloudModalVisible: false,
  feature: "",
};

export const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setKTMCloudModalVisible: (
      state,
      action: PayloadAction<KTMCloudFeature>
    ) => {
      state.isKTMCloudModalVisible = true;
      state.feature = action.payload;
    },
    setKTMCloudModalHidden: (state) => {
      state.isKTMCloudModalVisible = false;
    },
  },
});

export const { setKTMCloudModalVisible, setKTMCloudModalHidden } =
  subscriptionSlice.actions;
