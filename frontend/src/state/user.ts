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
