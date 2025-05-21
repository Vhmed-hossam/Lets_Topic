import getContrastingTextColor from "./GetContrast";
import { useSettingStore } from "../store/useSettingsStore";

export const useTextColor = () => {
  const { myMessageTheme } = useSettingStore();
  const textColor = getContrastingTextColor(myMessageTheme);
  return textColor;
};
