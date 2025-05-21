import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { useNotificationStore } from "../../store/useNotificationStore";
import formatDate from "../../helpers/formatDate";
import NotificationSkeleton from "../../components/Skeletons/NotificationSkeleton";
import { EllipsisVertical, Trash2, TriangleAlert } from "lucide-react";
import { useSettingStore } from "../../store/useSettingsStore";
import SendLoader from "../../components/Spinner/SendLoader";
import { useFriendsStore } from "../../store/useFriendsStore";
import { useAuthStore } from "../../store/useAuthStore";
import { RotateCcw } from "lucide-react";
import { SuccesToast } from "../../components/Toast/Toasters";
import { defaultImage } from "../../Data/Avatars";

export default function Notifications() {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const formRef = useRef(null);
  const toggleRef = useRef(null);
  const popoverRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const {
    notifications,
    fetchNotifications,
    isFetchingNotifications,
    clearNotifications,
    isClearingNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  } = useNotificationStore();

  const { theme, myMessageTheme } = useSettingStore();
  const {
    acceptFriendRequest,
    declineFriendRequest,
    WipechatRequest,
    acceptWipeChatRequest,
    declineWipeChatRequest,
  } = useFriendsStore();
  const { socket, authUser } = useAuthStore();

  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  }, []);

  useEffect(() => {
    const socket = useAuthStore.getState().socket;

    const handleRemoveNotification = ({ requestId, type }) => {
      useNotificationStore.setState((state) => ({
        notifications: state.notifications.filter(
          (n) => !(n.requestId === requestId && n.type === type)
        ),
      }));
    };

    if (socket) {
      socket.on("removeNotification", handleRemoveNotification);
    }

    return () => {
      if (socket) {
        socket.off("removeNotification", handleRemoveNotification);
      }
    };
  }, []);
  useGSAP(
    () => {
      if (isToggleOpen) {
        toggleRef.current.style.display = "block";
        gsap.fromTo(
          toggleRef.current,
          { opacity: 0, scale: 0.8, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(2.1)" }
        );
      } else {
        gsap.to(toggleRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 10,
          duration: 0.2,
          ease: "power2.in",
        });
      }
      if (isPopoverOpen) {
        gsap.fromTo(
          popoverRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }
        );
      } else {
        gsap.to(popoverRef.current, {
          opacity: 0,
          scale: 0.9,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    },
    { dependencies: [isToggleOpen, isPopoverOpen] }
  );

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    fetchNotifications();
    if (socket) {
      subscribeToNotifications();
    }
    return () => {
      unsubscribeFromNotifications();
    };
  }, [
    fetchNotifications,
    socket,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  ]);
  const handleToggle = () => {
    setIsToggleOpen((prev) => !prev);
  };
  const openPopover = () => {
    setIsToggleOpen(false);
    setIsPopoverOpen(true);
  };
  const handleClearNotifications = async () => {
    await clearNotifications();
    setIsPopoverOpen(false);
  };

  if (isFetchingNotifications) return <NotificationSkeleton />;
  console.log(notifications);
  return (
    <div className="container mx-auto min-h-screen p-6">
      <div className="mt-16 space-y-2">
        <div
          className="py-3 flex-1 border-b mb-3 border-second relative"
          style={{ borderColor: myMessageTheme }}
        >
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <div className="flex flex-row gap-4 items-center">
              <button
                className="btn p-0 m-0 border-0 ring-0 bg-transparent"
                onClick={async () => {
                  setIsToggleOpen(false);
                  await fetchNotifications();
                  SuccesToast("Notifications refreshed");
                }}
              >
                <RotateCcw />
              </button>
              <button
                ref={toggleButtonRef}
                className="p-2 bg-main/50 hover:bg-main/70 transition-all rounded-full"
                onClick={handleToggle}
                disabled={isClearingNotifications}
              >
                <EllipsisVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          {isToggleOpen && (
            <div
              ref={toggleRef}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-10"
              style={{ display: "block" }}
            >
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={openPopover}
                disabled={isClearingNotifications}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </button>
            </div>
          )}
        </div>
        <div className="flex space-y-3 flex-col" ref={formRef}>
          {notifications.length === 0 && !isFetchingNotifications ? (
            <h2 className="text-center text-gray-500 mt-8">No notifications</h2>
          ) : (
            notifications.map((notification) => (
              <div
                className="notification-card bg-main/15 shadow-md rounded-lg p-6 w-full max-w-2xl mx-auto hover:bg-main/20 transition-all duration-300"
                key={notification._id}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={notification?.sender?.profilePic || defaultImage}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        {notification?.sender?.fullName
                          ? notification.sender.fullName.toLowerCase() ===
                            authUser.user.fullName.toLowerCase()
                            ? "You"
                            : notification.sender.fullName
                          : "Unknown User"}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {notification?.sender?.username && (
                      <h3 className="text-md text-gray-400">
                        {notification.sender.username}
                      </h3>
                    )}
                    <h2 className="text-lg mt-2">{notification.message}</h2>

                    {/* Action buttons */}
                    {notification.type === "friend_request_received" && (
                      <div className="mt-3 flex gap-3">
                        <button
                          className="bg-main text-white px-4 py-1 rounded-md hover:bg-green-600 transition-all"
                          onClick={() =>
                            acceptFriendRequest(notification.requestId)
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="bg-very-caution text-white px-4 py-1 rounded-md hover:bg-red-600 transition-all"
                          onClick={() =>
                            declineFriendRequest(notification.requestId)
                          }
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {notification.type === "wipe_chat_request" && (
                      <div className="mt-3 flex gap-3">
                        <button
                          className="bg-main text-white px-4 py-1 rounded-md"
                          onClick={() => {
                            acceptWipeChatRequest(notification.requestId);
                          }}
                        >
                          Accept Wipe
                        </button>
                        <button
                          className="bg-gray-500 text-white px-4 py-1 rounded-md cursor-pointer"
                          onClick={() => {
                            declineWipeChatRequest(notification.requestId);
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {isPopoverOpen && (
        <div>
          <div className="fixed inset-0 bg-black-full/40 flex items-center justify-center z-50">
            <div
              className={`flex border border-caution flex-col gap-5 overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
                theme === "dark" ? "bg-black-full" : "bg-white"
              }`}
              ref={popoverRef}
            >
              <div className="flex flex-col items-center gap-2">
                <TriangleAlert className="size-20 text-caution" />
                <h2
                  className={`text-xl font-bold text-center ${
                    theme === "dark" ? "text-white" : "text-black-full"
                  }`}
                >
                  Are you sure you want to Clear Notifications?
                </h2>
              </div>
              <div className="gap-5 p-2 flex flex-wrap justify-center items-center flex-row">
                <button
                  onClick={handleClearNotifications}
                  className="bg-main hover:bg-main/85 transition-all p-2 rounded-lg px-4 text-white"
                  disabled={isClearingNotifications}
                >
                  {isClearingNotifications ? (
                    <SendLoader color="#645EE2" />
                  ) : (
                    "Clear"
                  )}
                </button>
                <button
                  onClick={() => setIsPopoverOpen(false)}
                  className="bg-caution hover:bg-caution/85 transition-all p-2 rounded-lg px-4 text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
