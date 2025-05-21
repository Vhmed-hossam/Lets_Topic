import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";
import { useChatStore } from "./useChatStore";
import { ErrorToast, SuccesToast } from "../components/Toast/Toasters";

export const useFriendsStore = create((set, get) => ({
  friends: [],
  blockedUsers: [],
  isBlocking: false,
  isUnblocking: false,
  isWiping: false,
  isSendingFriendRequest: false,
  isAcceptingFriendRequest: false,
  isDecliningFriendRequest: false,
  isUnfriending: false,

  fetchFriends: async () => {
    try {
      const userId = useAuthStore.getState().authUser?.user?._id;
      const res = await axiosInstance.get(`/friends/friends-list/${userId}`);
      set({ friends: res.data.friends || [] });
    } catch (error) {
      console.error("Error fetching friends:", error);
      set({ friends: [] });
    }
  },

  fetchBlockedUsers: async () => {
    try {
      const userId = useAuthStore.getState().authUser?.user?._id;
      const res = await axiosInstance.get(`/friends/blocked-users/${userId}`);
      set({ blockedUsers: res.data.blockedUsers || [] });
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      set({ blockedUsers: [] });
    }
  },

  sendFriendRequest: async (recipientId) => {
    set({ isSendingFriendRequest: true });
    try {
      const res = await axiosInstance.post("/friends/send-friend-request", {
        senderUsername: recipientId.senderUsername,
        recipientUsername: recipientId.recipientUsername,
      });
      SuccesToast("Friend request sent!");
      return res.data;
    } catch (error) {
      console.error("Error sending friend request:", error);
      ErrorToast(error.response.data.message);
    } finally {
      set({ isSendingFriendRequest: false });
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      const res = await axiosInstance.post(
        `/friends/accept-friend-request/${requestId}`
      );
      if (res.data.success) {
        await Promise.all([get().fetchFriends()]);

        useNotificationStore.setState({
          notifications: res.data.notifications,
        });
      }
      SuccesToast("Friend request accepted!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      ErrorToast("Error accepting friend request");
      throw error;
    }
  },

  declineFriendRequest: async (requestId) => {
    try {
      const res = await axiosInstance.post(
        `/friends/refuse-friend-request/${requestId}`
      );
      if (res.data.success) {
        useNotificationStore.setState({
          notifications: res.data.notifications,
        });
      }
      SuccesToast("Friend request declined!");
    } catch (error) {
      console.error("Error declining friend request:", error);
      ErrorToast("Error declining friend request");
      throw error;
    }
  },

  blockUser: async (data) => {
    set({ isBlocking: true });
    try {
      await axiosInstance.post("/friends/block-user", {
        userId: data.userId,
        blockUserId: data.blockUserId,
      });
      await Promise.all([get().fetchFriends(), get().fetchBlockedUsers()]);
      SuccesToast("User blocked successfully!");
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    } finally {
      set({ isBlocking: false });
    }
  },

  unblockUser: async (data) => {
    set({ isUnblocking: true });
    try {
      await axiosInstance.post("/friends/unblock-user", {
        userId: data.userId,
        unblockUserId: data.unblockUserId,
      });
      await get().fetchBlockedUsers();
      SuccesToast("User unblocked successfully!");
    } catch (error) {
      console.error("Error unblocking user:", error);
      throw error;
    } finally {
      set({ isUnblocking: false });
    }
  },

  unfriendUser: async (data) => {
    set({ isUnfriending: true });
    try {
      await axiosInstance.post("/friends/unfriend-user", {
        userId: data.userId,
        friendId: data.friendId,
      });
      await get().fetchFriends();
      SuccesToast("User unfriended successfully!");
    } catch (error) {
      console.error("Error unfriending user:", error);
      throw error;
    } finally {
      set({ isUnfriending: false });
    }
  },

  subscribeToFriendRequests: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newNotification", (notification) => {
      if (
        notification.type === "friend_request_received" ||
        notification.type === "friend_request_accepted" ||
        notification.type === "friend_request_declined" ||
        notification.type === "block_initiated" ||
        notification.type === "block_received" ||
        notification.type === "unfriend_initiated" ||
        notification.type === "unfriend_received" ||
        notification.type === "unblock_initiated" ||
        notification.type === "unblock_received"
      ) {
        const { notifications } = useNotificationStore.getState();
        if (!notifications.some((n) => n._id === notification._id)) {
          useNotificationStore.setState({
            notifications: [...notifications, notification],
          });
        }
        if (notification.type === "friend_request") {
        } else if (notification.type === "friend_request_accepted") {
          get().fetchFriends();
        } else if (notification.type === "friend_request_declined") {
        } else if (
          notification.type === "block_initiated" ||
          notification.type === "block_received"
        ) {
          get().fetchBlockedUsers();
          get().fetchFriends();
        } else if (
          notification.type === "unfriend_initiated" ||
          notification.type === "unfriend_received"
        ) {
          get().fetchFriends();
        } else if (
          notification.type === "unblock_initiated" ||
          notification.type === "unblock_received"
        ) {
          get().fetchBlockedUsers();
        }
        if (notification.type === "friend_request_accepted") {
          get().fetchFriends();
          const selectedUserId = useChatStore.getState().SelectedUser?._id;
          if (
            selectedUserId === notification.sender ||
            selectedUserId === notification.recipient
          ) {
            useChatStore.getState().GetMessages(selectedUserId);
          }
        }
      }
    });
  },

  unsubscribeFromFriendRequests: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newNotification");
    }
  },
  WipechatRequest: async (userId) => {
    set({ isWiping: true });
    try {
      await axiosInstance.post("/wipechat/request", { recipientId: userId });
      SuccesToast("Wipe chat request sent!");
    } catch (error) {
      console.error("Error requesting wipe chat:", error);
      ErrorToast(error.response.data.message);
      throw error;
    } finally {
      set({ isWiping: false });
    }
  },

  acceptWipeChatRequest: async (requestId) => {
    set({ isAcceptingFriendRequest: true });
    try {
      const res = await axiosInstance.put(`/wipechat/accept/${requestId}`);
      if (res.data.success) {
        useNotificationStore.setState({
          notifications: res.data.notifications,
        });
        SuccesToast("Wipe chat request accepted!");
      }
      return res.data;
    } catch (error) {
      console.error("Error accepting wipe chat request:", error);
      ErrorToast("Error accepting wipe chat request");
      throw error;
    } finally {
      set({ isAcceptingFriendRequest: false });
    }
  },

  declineWipeChatRequest: async (requestId) => {
    set({ isDecliningFriendRequest: true });
    try {
      const res = await axiosInstance.put(`/wipechat/decline/${requestId}`);
      if (res.data.success) {
        useNotificationStore.setState({
          notifications: res.data.notifications,
        });
        SuccesToast("Wipe chat request declined!");
      }
      return res.data;
    } catch (error) {
      console.error("Error declining wipe chat request:", error);
      ErrorToast("Error declining wipe chat request");
      throw error;
    } finally {
      set({ isDecliningFriendRequest: false });
    }
  },
}));
