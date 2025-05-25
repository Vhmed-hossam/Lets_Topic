import { useEffect, useState } from "react";
import { SuccesToast } from "../components/Toast/Toasters";

export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateNetwork = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        SuccesToast("You are online , please refresh the page");
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
