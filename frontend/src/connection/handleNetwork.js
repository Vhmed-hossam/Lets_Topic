import { useEffect, useState } from "react";
import { SuccesToast } from "../components/Toast/Toasters";
import { useAuthStore } from "../store/useAuthStore";

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const {connectSocket} =useAuthStore()
  useEffect(() => {
    const updateNetwork = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        SuccesToast("You are online!");
        connectSocket()
      }
    };

    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  return isOnline;
}
