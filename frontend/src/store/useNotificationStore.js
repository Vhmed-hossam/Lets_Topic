import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import { useFriendsStore } from "./useFriendsStore";
import { SuccesToast } from "../components/Toast/Toasters";
import { VALID_NOTIFICATION_TYPES } from "../Data/VALID_NOTIFICATION_TYPES";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  isFetchingNotifications: false,
  isClearingNotifications: false,
  isResettingUnread: false,
  unreadMessages: {},
  totalUnread: 0,

  fetchUnreadCounts: async () => {
    try {
      const userId = useAuthStore.getState().authUser?.user?._id;
      if (!userId) {
        console.warn("fetchUnreadCounts: No user ID available");
        return { error: "No user ID available" };
      }
      const res = await axiosInstance.get(`/messages/unread-counts/${userId}`);
      const { unreadMessages, totalUnread } = res.data;
      set({ unreadMessages, totalUnread });
      return { success: true };
    } catch (error) {
      console.error(
        "fetchUnreadCounts error:",
        error.response?.data || error.message
      );
      return { error: error.response?.data || error.message };
    }
  },

  fetchNotifications: async () => {
    set({ isFetchingNotifications: true });
    try {
      const userId = useAuthStore.getState().authUser?.user?._id;
      if (!userId) {
        console.error("fetchNotifications: No user ID");
        return { error: "No user ID" };
      }
      const res = await axiosInstance.get(`/friends/notifications/${userId}`);
      const notifications = res.data.notifications || [];
      set({ notifications });
      return { success: true, notifications };
    } catch (error) {
      console.error(
        "fetchNotifications error:",
        error.response?.data || error.message
      );
      set({ notifications: [] });
      return { error: error.response?.data || error.message };
    } finally {
      set({ isFetchingNotifications: false });
    }
  },

  clearNotifications: async () => {
    set({ isClearingNotifications: true });
    try {
      const userId = useAuthStore.getState().authUser?.user?._id;
      if (!userId) {
        console.error("clearNotifications: No user ID");
        return { error: "No user ID" };
      }
      const res = await axiosInstance.delete(
        `/friends/notifications/clear-notifications/${userId}`
      );
      await get().fetchNotifications();
      SuccesToast(res.data.message);
      return { success: true };
    } catch (error) {
      console.error(
        "clearNotifications error:",
        error.response?.data || error.message
      );
      return { error: error.response?.data || error.message };
    } finally {
      set({ isClearingNotifications: false });
    }
  },

  subscribeToNotifications: () => {
    const socket = useAuthStore.getState().socket;
    const userId = useAuthStore.getState().authUser?.user?._id;
    if (!socket || !userId) {
      console.error("subscribeToNotifications: Missing socket or userId", {
        socket,
        userId,
      });
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.off("newMessage");
    socket.off("unreadUpdate");
    socket.off("newNotification");
    socket.off("connect");
    socket.off("disconnect");

    socket.on("connect", () => {
      socket.emit("joinRoom", { userId });
    });

    socket.on("newMessage", (message) => {
      const userIdStr = userId.toString();
      const receiverIdStr = message.receiverId.toString();
      const senderIdStr = message.senderId.toString();
      const selectedUserId = useChatStore.getState().SelectedUser?._id;

      if (message.isRead || senderIdStr === userIdStr) {
        return;
      }

      if (receiverIdStr === userIdStr && senderIdStr !== selectedUserId) {
        
        get().incrementUnread(senderIdStr);
      }
    });

    socket.on("unreadUpdate", ({ unreadMessages, totalUnread }) => {
      set({ unreadMessages, totalUnread });
    });

    socket.on("newNotification", (notification) => {
      if (VALID_NOTIFICATION_TYPES.includes(notification.type)) {
        set((state) => {
          if (!state.notifications.some((n) => n._id === notification._id)) {
            return { notifications: [...state.notifications, notification] };
          }
          return state;
        });
      }
    });

    socket.on("disconnect", () => {
      console.warn("Socket disconnected, attempting to reconnect...");
    });

    useChatStore.getState().SubscribeToMessages();
    useFriendsStore.getState().subscribeToFriendRequests();
  },

  unsubscribeFromNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("unreadUpdate");
      socket.off("newNotification");
      socket.off("connect");
      socket.off("disconnect");
    }
  },

  incrementUnread: (chatId) => {
    set((state) => {
      const newCount = (state.unreadMessages[chatId] || 0) + 1;
      return {
        unreadMessages: {
          ...state.unreadMessages,
          [chatId]: newCount,
        },
        totalUnread: state.totalUnread + 1,
      };
    });
  },

  resetUnread: (chatId) => {
    set((state) => {
      const currentCount = state.unreadMessages[chatId] || 0;
      const newTotalUnread = Math.max(0, state.totalUnread - currentCount);
      return {
        unreadMessages: {
          ...state.unreadMessages,
          [chatId]: 0,
        },
        totalUnread: newTotalUnread,
      };
    });
  },

  resetAllUnread: async () => {
    set({ isResettingUnread: true });
    try {
      const userId = useAuthStore.getState().authUser?.user?._id;
      if (!userId) {
        console.error("resetAllUnread: No user ID");
        return { error: "No user ID" };
      }
      const res = await axiosInstance.put(`/messages/reset-all-unread/${userId}`);
      await get().fetchUnreadCounts();
      SuccesToast(res.data.message || "All unread messages cleared");
      return { success: true };
    } catch (error) {
      console.error(
        "resetAllUnread error:",
        error.response?.data || error.message
      );
      return { error: error.response?.data || error.message };
    } finally {
      set({ isResettingUnread: false });
    }
  },
}));