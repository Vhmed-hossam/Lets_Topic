import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import playSound from "../helpers/PlaySound";
import MessageReceivedSound from "../../Sounds/Pinglet Pop.mp3";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";
import { ErrorToast, SuccesToast } from "../components/Toast/Toasters";
import { useSettingStore } from "./useSettingsStore";

export const useChatStore = create((set, get) => ({
  Messages: [],
  ProfileOpened: false,
  Users: [],
  SelectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  typingUserId: null,
  ChatMedia: null,
  lastMakredUserId: null,
  MediaOpened: false,
  isEditing: false,
  isDeleting: false,
  OpenMedia: () => {
    set({ MediaOpened: true });
  },
  CloseMedia: () => {
    set({ MediaOpened: false });
  },
  GetUsers: async () => {
    set({ isUsersLoading: true });
    set({ SelectedUser: null });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ Users: res.data.TheUsers });
      await useNotificationStore.getState().fetchUnreadCounts();
      return res;
    } catch (error) {
      console.error("GetUsers error:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  GetMessages: async (UId) => {
    if (!UId) {
      console.warn("GetMessages: No user ID provided");
      return;
    }
    set({ isMessagesLoading: true });
    try {
      const authUserId = useAuthStore.getState().authUser?.user?._id;
      if (!authUserId) {
        console.error("GetMessages: No authUser ID");
        return;
      }
      const res = await axiosInstance.get(`/messages/${UId}`);
      const Messages = res.data.messages || [];

      set({ Messages });
    } catch (error) {
      console.error(
        "GetMessages error:",
        error.response?.data || error.message
      );
      set({ SelectedUser: null });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  SendMessage: async (messageData) => {
    const { SelectedUser, Messages } = get();

    if (!SelectedUser?._id) {
      console.error("Cannot send message: No SelectedUser");
      return { error: "No user selected" };
    }

    if (
      !messageData.text &&
      !messageData.image &&
      !messageData.voiceMessage &&
      !messageData.video
    ) {
      console.error("Cannot send message: No content provided");
      return { error: "Message content is empty" };
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send-message/${SelectedUser._id}`,
        {
          text: messageData.text || "",
          image: messageData.image || null,
          video: messageData.video || null,
          voiceMessage: messageData.voiceMessage || null,
        }
      );
      if (res?.data?.NewMessage) {
        playSound(`/Sounds/${useSettingStore.getState().mySendSound}.mp3`);
        const newMessage = res.data.NewMessage;
        set({ Messages: [...Messages, newMessage] });
        return { success: true, message: newMessage };
      } else {
        console.warn("No NewMessage in response:", res.data);
        return { error: "No message returned from server" };
      }
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.error || "Failed to send message");
      useAuthStore.getState().fetchFriends();
      return {
        error: error.response?.data?.error || "Failed to send message",
        status: error.response?.status,
      };
    } finally {
      get().getChatMedia(SelectedUser._id);
      const unreadCount =
        useNotificationStore.getState().unreadMessages[SelectedUser._id] || 0;
      if (unreadCount > 0) {
        await get().markMessagesAsRead(SelectedUser._id, "SendMessage");
      }
      useNotificationStore.getState().resetUnread(SelectedUser._id);
    }
  },

  SubscribeToMessages: () => {
    const { SelectedUser } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    if (!socket) {
      console.error("No socket available for subscription");
      return;
    }
    if (!socket.connected) {
      return;
    }
    if (!authUser?.user?._id) {
      console.warn("No authUser ID available");
      return;
    }
    socket.emit("joinUserRoom", { userId: authUser.user._id });

    if (SelectedUser?._id) {
      socket.emit("joinChat", {
        senderId: authUser.user._id,
        receiverId: SelectedUser._id,
      });
    }

    socket.off("newMessage").on("newMessage", async (newMessage) => {
      set((state) => {
        if (state.Messages.some((msg) => msg._id === newMessage._id)) {
          return state;
        }

        const isSentMessage = newMessage.senderId === authUser.user._id;
        const isCurrentChat =
          state.SelectedUser?._id === newMessage.senderId ||
          state.SelectedUser?._id === newMessage.receiverId;
        if (isCurrentChat) {
          if (
            !isSentMessage &&
            newMessage.senderId === state.SelectedUser?._id
          ) {
            playSound(
              `/Sounds/${useSettingStore.getState().myReceiveSound}.mp3`
            );
            get().markMessagesAsRead(newMessage.senderId, "newMessage");
            useNotificationStore.getState().resetUnread(newMessage.senderId);
          }
          return { Messages: [...state.Messages, newMessage] };
        }

        return state;
      });
    });

    socket.off("userTyping").on("userTyping", ({ senderId }) => {
      set((state) => {
        if (senderId === state.SelectedUser?._id) {
          return { isTyping: true, typingUserId: senderId };
        }
        return state;
      });
    });

    socket.off("userStoppedTyping").on("userStoppedTyping", ({ senderId }) => {
      set((state) => {
        if (senderId === state.SelectedUser?._id) {
          return { isTyping: false, typingUserId: null };
        }
        return state;
      });
    });

    socket.off("friendRequestAccepted").on("friendRequestAccepted", () => {
      get().GetUsers();
    });

    socket.off("getOnlineUsers").on("getOnlineUsers", (onlineUsers) => {
      set((state) => ({
        Users: state.Users.map((user) => ({
          ...user,
          isOnline: onlineUsers.includes(user._id),
        })),
      }));
    });

    socket.off("chatWiped").on("chatWiped", ({ userId }) => {
      if (SelectedUser?._id === userId) {
        set({ Messages: [] });
      }
      get().fetchPendingWipeRequests();
    });
  },

  UnsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("Cannot unsubscribe: No socket");
      return;
    }
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("friendRequestAccepted");
    socket.off("newNotification");
    socket.off("getOnlineUsers");
    socket.off("chatWiped");
  },

  SetSelectedUser: async (userObj) => {
    const authUser = useAuthStore.getState().authUser?.user;
    const { SelectedUser } = get();
    if (!authUser?._id) {
      console.error("SetSelectedUser: authUser is missing or invalid");
      useAuthStore.getState().checkAuth();
      return;
    }
    if (!userObj || userObj._id === authUser._id) {
      set({
        SelectedUser: null,
        isTyping: false,
        typingUserId: null,
        Messages: [],
        lastMarkedUserId: null,
      });
      return;
    }
    if (SelectedUser?._id === userObj?._id) {
      SuccesToast("Same user selected, skipping.");
      return;
    }
    const currentLastMarkedUserId = get().lastMarkedUserId;
    set({
      SelectedUser: userObj,
      isTyping: false,
      typingUserId: null,
      Messages: [],
    });
    const unreadCount =
      useNotificationStore.getState().unreadMessages[userObj._id] || 0;
    if (unreadCount > 0 && userObj._id !== currentLastMarkedUserId) {
      try {
        const res = await axiosInstance.get(
          `/messages/unread-counts/${authUser._id}`
        );
        const backendUnreadCount = res.data.unreadMessages[userObj._id] || 0;
        if (backendUnreadCount > 0) {
          await get().markMessagesAsRead(userObj._id, "SetSelectedUser");
          set({ lastMarkedUserId: userObj._id });
        } else {
          useNotificationStore.getState().resetUnread(userObj._id);
        }
      } catch (error) {
        console.error(
          "SetSelectedUser: Error verifying unread counts:",
          error.response?.data || error.message
        );
      }
    }
  },

  resetTypingIndicator: () => {
    set({ isTyping: false, typingUserId: null });
  },

  emitTyping: ({ senderId, receiverId }) => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !senderId || !receiverId) {
      console.warn("Cannot emit typing: Invalid data", {
        socket,
        senderId,
        receiverId,
      });
      return;
    }
    if (!socket.connected) {
      console.warn("Cannot emit typing: Socket not connected");
      return;
    }
    socket.emit("typing", { senderId, receiverId });
  },

  emitStopTyping: ({ senderId, receiverId }) => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !senderId || !receiverId) {
      console.warn("Cannot emit stopTyping: Invalid data", {
        socket,
        senderId,
        receiverId,
      });
      return;
    }
    if (!socket.connected) {
      console.warn("Cannot emit stopTyping: Socket not connected");
      return;
    }
    socket.emit("stopTyping", { senderId, receiverId });
  },

  markMessagesAsRead: async (userId) => {
    try {
      const unreadCount =
        useNotificationStore.getState().unreadMessages[userId] || 0;
      const currentLastMarkedUserId = get().lastMarkedUserId;
      if (unreadCount === 0) {
        return;
      }
      if (userId === currentLastMarkedUserId) {
        return;
      }
      const res = await axiosInstance.put(`/messages/mark-read/${userId}`);
      if (res.data.modifiedCount > 0) {
        useNotificationStore.getState().resetUnread(userId);
        set({ lastMarkedUserId: userId });
      } else {
        useNotificationStore.getState().resetUnread(userId);
      }
    } catch (error) {
      console.error(
        "markMessagesAsRead error:",
        error.response?.data || error.message
      );
    }
  },
  getChatMedia: async (UId) => {
    if (!UId) {
      console.warn("GetMessages: No user ID provided");
      return;
    }
    try {
      const authUserId = useAuthStore.getState().authUser?.user?._id;
      if (!authUserId) {
        console.error("GetMessages: No authUser ID");
        return;
      }
      const res = await axiosInstance.get(`/messages/chat-media/${UId}`);
      set({ ChatMedia: res.data.mediaMessages || [] });
    } catch (error) {
      console.error(
        "GetMessages error:",
        error.response?.data || error.message
      );
    }
  },
  openProfile: () => {
    set({ ProfileOpened: true });
  },
  closeProfile: () => {
    set({ ProfileOpened: false });
  },
  EditMessage: async (data) => {
    const { messageId, Text, userToChatId } = data;
    if (!messageId || !Text?.trim() || !userToChatId) {
      ErrorToast("Message ID, text, and recipient ID are required");
      return;
    }
    set({ isEditing: true });
    try {
      const res = await axiosInstance.put(
        `/messages/update-message/${messageId}`,
        {
          NewText: Text.trim(),
          userToChatId,
        }
      );
      set({ Messages: res.data.messages || [] });
      SuccesToast(res.data.message || "Message edited successfully");
    } catch (error) {
      console.error("EditMessage error:", error);
      ErrorToast(error.response?.data?.error);
    } finally {
      set({ isEditing: false });
    }
  },

  DeleteMessage: async (messageId) => {
    set({ isDeleting: true });
    try {
      const res = await axiosInstance.delete(
        `/messages/delete-message/${messageId}`
      );
      const resp = get().GetMessages(data.selectedId);
      console.log(resp);
      SuccesToast(res.data.message || "Message deleted successfully");
    } catch (error) {
      console.error("DeleteMessage error:", error);
      ErrorToast(error.response?.data?.error || "Failed to delete message");
    } finally {
      set({ isDeleting: false });
    }
  },
}));
