import { RouterProvider } from "react-router-dom";
import letstopic from "./Routing/Letstopic";
import { Toaster } from "react-hot-toast";
import useNetworkStatus from "./connection/handleNetwork";
import NetworkStatusView from "./Connection/Offline Page/OfflinePage";
export default function App() {
  const isOnline = useNetworkStatus();
  if (!isOnline) {
    return (
      <>
        <NetworkStatusView />
      </>
    );
  }
  return (
    <>
      <div>
        <RouterProvider router={letstopic} />
        <Toaster />
      </div>
    </>
  );
}
