import { create } from "zustand";

export const useExpandVideo = create((set) => ({
  expandVideo: false,
  Video: "",
  VidDuration: 0,
  setExpandVideo: () => set({ expandVideo: true }),
  setVideo: (value) => set({ Video: value }),
  setCloseVideo: () => set({ expandVideo: false }),
  setVidDuration: (value) => set({ Duration: value }),
}));
