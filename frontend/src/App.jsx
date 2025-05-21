import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect, useState } from "react";
import Spinner from "./components/Spinner/spinner";
import { useSettingStore } from "./store/useSettingsStore";
import useNetworkStatus from "./connection/handleNetwork";
import NetworkStatusView from "./Connection/Offline Page/OfflinePage";
import { preloadImages } from "./helpers/imagesloader";
import { Banners } from "./Data/Banners";
import NonActive from "./components/non-activated/NActive";
import { Avatars } from "./Data/Avatars";
import { useNotificationStore } from "./store/useNotificationStore";
import letstopic from "./Routing/Letstopic";
import { useChatStore } from "./store/useChatStore";
import { useExpandVideo } from "./store/useExpandVideo";
import { motion, AnimatePresence } from "framer-motion";
import ExpandedVideo from "./components/ExpandedVideo/ExpandedVideo";
import { useFriendsStore } from "./store/useFriendsStore";
export default function App() {
  const [Activated, setActivated] = useState(false);
  const isOnline = useNetworkStatus();
  const { authUser, connectSocket, isCheckingAuth, checkAuth } = useAuthStore();
  const { fetchUnreadCounts, unsubscribeFromNotifications } =
    useNotificationStore();
  const { theme } = useSettingStore();
  const { GetUsers, UnsubscribeFromMessages } = useChatStore();
  const { expandVideo, Video, setCloseVideo } = useExpandVideo();
  const { fetchBlockedUsers } = useFriendsStore();
  useEffect(() => {
    checkAuth();
    preloadImages(
      Avatars.map((a) => a.url),
      Banners.map((b) => b.url)
    ).then(() => {
      setActivated(true);
    });
  }, [checkAuth]);
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authUser?.user?._id) {
      connectSocket();
      fetchUnreadCounts();
      fetchBlockedUsers();
      GetUsers();
      useNotificationStore.getState().subscribeToNotifications();
      useChatStore.getState().SubscribeToMessages();
    }

    return () => {
      if (authUser?.user?._id) {
        UnsubscribeFromMessages();
        unsubscribeFromNotifications();
      }
    };
  }, [authUser?.user?._id]);
  if (isCheckingAuth && !authUser) {
    return (
      <>
        <Spinner />
      </>
    );
  }
  if (!isOnline) {
    return (
      <>
        <NetworkStatusView />
      </>
    );
  }
  if (!Activated) {
    return (
      <>
        <NonActive />
      </>
    );
  }

  return (
    <>
      <div data-theme={theme}>
        <RouterProvider router={letstopic} />
        <Toaster />
      </div>
      <AnimatePresence>
        {expandVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {" "}
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={setCloseVideo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <ExpandedVideo src={Video} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
