import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { ErrorToast, SuccesToast } from "../components/Toast/Toasters";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";
import { useFriendsStore } from "./useFriendsStore";
import { useNotificationStore } from "./useNotificationStore";
import Cookie from "js-cookie";
import BASE_URL from "../Data/BASE_URL";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isUpdatingName: false,
  isaddingBanner: false,
  isAddingBio: false,
  isloggingout: false,
  isDeleting: false,
  isDisabling: false,
  isRestoring: false,
  onlineUsers: [],
  socket: null,
  isChangingPass: false,
  isEmailVerified: false,
  isConfirmingDisable: false,
  isDisabled: false,
  isDeleted: false,
  isChangingUsername: false,
  isReportingUser: false,
  isCancelingOperations: false,
  isResettingPass: false,
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check-auth");
      if (res.data.user.deletionData.Disabled) {
        if (res.data.user.deletionData.Restorable) {
          set({ authUser: null });
        } else {
          ErrorToast("This account has been permanently deleted.");
        }
        set({ authUser: null });
        return;
      }
      if (!res.data.user.isVerified) {
        set({ authUser: null });
        ErrorToast("Please verify your account.");
        await get().Logout();
        return;
      }
      set({ authUser: res.data });
      await get().connectSocket();
    } catch (error) {
      console.error("CheckAuth error:", error);
      set({ authUser: null });
      await get().DisconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  connectSocket: async () => {
    const { authUser, socket } = get();
    const userId = authUser?.user?._id;
    if (!userId) {
      console.warn("Cannot connect socket: No authUser");
      return;
    }
    if (socket?.connected) {
      console.log("Socket already connected");
      return;
    }
    if (typeof userId !== "string") {
      console.warn("Cannot connect socket: Invalid userId", userId);
      return;
    }
    if (socket) {
      console.log("Server connected");
    }

    const newSocket = io(BASE_URL, {
      auth: { userId },
      reconnection: true,
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", { userId });
      useNotificationStore.getState().subscribeToNotifications();

      useFriendsStore.getState().fetchFriends();
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      const friends = useFriendsStore.getState().friends || [];
      const friendIds = friends.map((friend) => friend._id);

      const onlineFriends = Array.isArray(userIds)
        ? userIds.filter((id) => friendIds.includes(id) && id !== userId)
        : [];
      set({ onlineUsers: onlineFriends });
    });

    newSocket.on("newMessage", (message) => {
      if (message.receiverId === authUser.user._id) {
        useNotificationStore.getState().incrementUnread(message.senderId);
      }
    });

    newSocket.on("unreadUpdate", ({ unreadMessages, totalUnread }) => {
      useNotificationStore.setState({ unreadMessages, totalUnread });
    });

    set({ socket: newSocket });
  },

  DisconnectSocket: async () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.off("newNotification");
      socket.off("getOnlineUsers");
      socket.off("chatWiped");
      useFriendsStore.getState().unsubscribeFromFriendRequests();
      useChatStore.getState().UnsubscribeFromMessages();
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },

  Signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("Signup Error:", error.response || error.message);
      ErrorToast(
        error.response?.data?.error ||
          "An unexpected error occurred during signup."
      );
    } finally {
      set({ isSigningUp: false });
    }
  },

  Login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      if (res.data.user.deletionData?.Disabled) {
        ErrorToast("This account is disabled.");
        return { error: "Account disabled", data: res.data };
      }
      if (!res.data.user.isVerified) {
        ErrorToast("Please verify your account before logging in.");
        set({ authUser: null });
      }
      set({ authUser: res.data });
      console.log(res.data);
      SuccesToast(res.data.message);
      await get().connectSocket();
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Login Error:", error.response || error.message);
      const errorMessage =
        error.response?.data?.error ||
        "An unexpected error occurred during login.";
      ErrorToast(errorMessage);
      return { error: errorMessage, data: error.response?.data };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  Logout: async () => {
    set({ isloggingout: true });
    try {
      const { authUser } = get();
      if (!authUser?.user?._id) {
        throw new Error("User ID is missing");
      }
      await axiosInstance.post(`/auth/logout`, { userId: authUser.user._id });
      set({ authUser: null });
      SuccesToast("Logged out successfully");
      await get().DisconnectSocket();
    } catch (error) {
      console.error("Logout Error:", error.response || error.message);
      ErrorToast("Error logging out");
    } finally {
      set({ isloggingout: false });
      Cookie.remove("my-sender-theme");
      Cookie.remove("my-message-theme");
      Cookie.remove("chat-theme");
    }
  },

  UpdateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      SuccesToast("Profile updated successfully");
    } catch (error) {
      console.error("UpdateProfile error:", error);
      ErrorToast(error.response?.data?.error || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  ChangeName: async (id, data) => {
    set({ isUpdatingName: true });
    try {
      const res = await axiosInstance.put("/auth/change-name/" + id, data);
      set({ authUser: res.data });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("ChangeName error:", error);
      ErrorToast(error.response?.data?.error || "Failed to change name");
    } finally {
      set({ isUpdatingName: false });
    }
  },

  AddBanner: async (data) => {
    set({ isaddingBanner: true });
    try {
      const res = await axiosInstance.put("/auth/upload-banner", data);
      set({ authUser: res.data });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("AddBanner error:", error);
      ErrorToast(error.response?.data?.error || "Failed to upload banner");
    } finally {
      set({ isaddingBanner: false });
    }
  },

  AddBio: async (id, data) => {
    set({ isAddingBio: true });
    try {
      const res = await axiosInstance.post("/auth/add-bio/" + id, data);
      set({ authUser: res.data });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("AddBio error:", error);
      ErrorToast(error.response?.data?.error || "Failed to add bio");
    } finally {
      set({ isAddingBio: false });
    }
  },

  ConfirmDeleteAccount: async (data) => {
    set({ isDeleting: true });
    try {
      const res = await axiosInstance.put("/auth/confirm-delete-account", {
        code: data.code,
        password: data.password,
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("DeleteAccount error:", error);
      ErrorToast(error.response?.data?.error || "Failed to delete account");
    } finally {
      set({ isDeleting: false });
      set({ isDeleted: true });
    }
  },
  restoreAccount: async (data) => {
    set({ isRestoring: true });
    try {
      const res = await axiosInstance.put("/auth/restore-account", data, {
        headers: { token: null },
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("RestoreAccount error:", error);
      ErrorToast(error.response?.data?.error || "Failed to restore account");
    } finally {
      set({ isRestoring: false });
    }
  },

  verifyEmail: async ({ email, code }) => {
    try {
      const response = await axiosInstance.post(`/auth/verify-email`, {
        email,
        code,
      });
      SuccesToast(response.data.message);
      set({ isEmailVerified: true });
      return response.data.message;
    } catch (error) {
      console.error("VerifyEmail error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Error verifying email, please try again later.";
      ErrorToast(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isEmailVerified: false });
    }
  },

  DeleteAccount: async (id, data) => {
    set({ isDeleting: true });
    try {
      const res = await axiosInstance.put("/auth/delete-account/" + id, {
        email: data.email,
        password: data.password,
      });
      SuccesToast(res.data.message);
      set({ isDeleted: true });
    } catch (error) {
      console.error("DeleteAccount error:", error);
      ErrorToast(error.response?.data?.error || "Failed to request deletion");
      set({ isDeleted: false });
      set({ isDeleting: false });
    } finally {
      set({ isDeleting: false });
    }
  },

  DisableAccount: async (password) => {
    set({ isDisabling: true });
    try {
      const res = await axiosInstance.put("/auth/disable-account", {
        password,
      });
      SuccesToast(res.data.message);
      set({ isDisabled: true });
    } catch (error) {
      console.error("DisableAccount error:", error);
      ErrorToast(error.response?.data?.error || "Failed to disable account");
      set({ isDisabling: false });
      set({ isDisabled: false });
    } finally {
      set({ isDisabling: false });
    }
  },

  ConfirmDisableAccount: async ({ code, password }) => {
    if (!code) {
      ErrorToast("Code is required to disable the account.");
      return;
    }
    set({ isConfirmingDisable: true });
    try {
      const res = await axiosInstance.put("/auth/confirm-disable-account", {
        code,
        password,
      });
      SuccesToast(res.data.message);
      set({ authUser: null });
    } catch (error) {
      console.error("ConfirmDisableAccount error:", error);
      ErrorToast(
        error.response?.data?.error || "Failed to confirm disable account"
      );
    } finally {
      set({ isConfirmingDisable: false });
    }
  },

  UpdatePassword: async ({ email }) => {
    set({ isUpdatingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/update-password", {
        email,
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.error || "Failed to update password");
    } finally {
      set({ isUpdatingPassword: false });
    }
  },

  VerifyandChangePassword: async (data) => {
    set({ isUpdatingPassword: true });
    try {
      const res = await axiosInstance.put("/auth/verifyandchangepassword", {
        verificationCode: data.verificationCode,
        password: data.password,
        newPassword: data.newPassword,
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("VerifyandChangePassword error:", error);
      ErrorToast(error.response?.data?.error || "Failed to update password");
    } finally {
      set({ isUpdatingPassword: false });
    }
  },

  ChangeUsername: async (id, data) => {
    set({ isChangingUsername: true });
    try {
      const res = await axiosInstance.put("/auth/update-username/" + id, {
        username: data.username,
        password: data.password,
      });
      set({ authUser: res.data });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("ChangeUsername error:", error);
      ErrorToast(error.response?.data?.error || "Failed to change username");
    } finally {
      set({ isChangingUsername: false });
    }
  },

  GetLoggedDevices: async () => {
    try {
      const { authUser } = get();
      const id = authUser?.user?._id;
      if (!id) {
        throw new Error("User ID is missing");
      }
      const res = await axiosInstance.get("/auth/logged-devices/" + id);
      return res.data;
    } catch (error) {
      console.error("GetLoggedDevices error:", error);
      ErrorToast(
        error.response?.data?.error || "Failed to fetch logged devices"
      );
    }
  },
  ReportUser: async (data) => {
    set({ isReportingUser: true });
    try {
      const res = await axiosInstance.post("/auth/report-user", {
        reportedEmail: data.reportedEmail,
        reason: data.reason,
        image: data.image,
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("ReportUser error:", error);
      ErrorToast(error.response?.data?.error || "Failed to report user");
    } finally {
      set({ isReportingUser: false });
    }
  },
  ForgetPassword: async (email) => {
    set({ isResettingPass: true });
    try {
      const res = await axiosInstance.post("/auth/forget-password", {
        email,
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.error || "Failed to reset password");
    } finally {
      set({ isResettingPass: false });
    }
  },
  ResetPassword: async (data) => {
    set({ isResettingPass: true });
    try {
      const res = await axiosInstance.put("/auth/ver-reset-password", {
        verificationCode: data.verificationCode,
        newPassword: data.newPassword, 
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error(error);
      ErrorToast(error.response?.data?.error || "Failed to reset password");
    } finally {
      set({ isResettingPass: false });
    }
  },
  CancelOperations: async (data) => {
    set({ isCancelingOperations: true });
    try {
      const res = await axiosInstance.put("/auth/cancel-operation/" + data.id, {
        code: data.code,
      });
      SuccesToast(res.data.message);
    } catch (error) {
      console.error("CancelOperations error:", error);
      ErrorToast(error.response?.data?.error || "Failed to cancel operations");
    } finally {
      set({ isCancelingOperations: false });
    }
  },
}));
