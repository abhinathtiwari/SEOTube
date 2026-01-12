/** Recoil state atoms for managing global synchronization of user and channel metadata. */
import { atom } from "recoil";

export const userEmailState = atom<string>({
  key: "userEmailState",
  default: "",
});

export const channelNameState = atom<string>({
  key: "channelNameState",
  default: "",
});

export const customUrlState = atom<string>({
  key: "customUrlState",
  default: "",
});

export const lastOptimizedAtState = atom<string | null>({
  key: "lastOptimizedAtState",
  default: null,
});

export const upcomingOptimizationState = atom<string | null>({
  key: "upcomingOptimizationState",
  default: null,
});

export const pauseCronUpdateState = atom<boolean>({
  key: "pauseCronUpdateState",
  default: false,
});

export const recentlyUpdatedState = atom<string[]>({
  key: "recentlyUpdatedState",
  default: [],
});
