import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  setKTMCloudModalVisible,
  setKTMCloudModalHidden,
} from "@renderer/features";
import { KTMCloudFeature } from "@types";

export function useSubscription() {
  const dispatch = useAppDispatch();

  const { isKTMCloudModalVisible, feature } = useAppSelector(
    (state) => state.subscription
  );

  const showKTMCloudModal = useCallback(
    (feature: KTMCloudFeature) => {
      dispatch(setKTMCloudModalVisible(feature));
    },
    [dispatch]
  );

  const hideKTMCloudModal = useCallback(() => {
    dispatch(setKTMCloudModalHidden());
  }, [dispatch]);

  return {
    isKTMCloudModalVisible,
    ktmCloudFeature: feature,
    showKTMCloudModal,
    hideKTMCloudModal,
  };
}
