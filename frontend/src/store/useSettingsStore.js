import { create } from "zustand";
import Cookie from "js-cookie";
import getInitialTheme from "../helpers/getInitialTheme";
import Sent from "../../Sounds/Main.mp3";
import MessageRecieved from "../../Sounds/MessageReceived.mp3";
export const useSettingStore = create((set) => ({
  theme: getInitialTheme(),
  SetTheme: async (theme) => {
    Cookie.set("chat-theme", theme);
    set({ theme });
  },
  myMessageTheme: Cookie.get("my-message-theme") || "#645EE2",
  SetMyMessageTheme: (msgtheme) => {
    Cookie.set("my-message-theme", msgtheme);
    set({ myMessageTheme: msgtheme });
  },

  mySenderTheme: Cookie.get("my-sender-theme") || "#2D3135",
  SetMySenderTheme: async (sendertheme) => {
    Cookie.set("my-sender-theme", sendertheme);
    set({ mySenderTheme: sendertheme });
  },
  mySendSound: Cookie.get("my-send-sound") || Sent,
  SetMySendSound: async (sound) => {
    Cookie.set("my-send-sound", sound);
    set({ mySendSound: sound });
  },
  myReceiveSound: Cookie.get("my-receive-sound") || MessageRecieved,
  SetMyReceiveSound: async (sound) => {
    Cookie.set("my-receive-sound", sound);
    set({ myReceiveSound: sound });
  },
}));
