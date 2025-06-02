import { WifiOff } from "lucide-react";

export default function NetworkStatusView() {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <WifiOff className="size-24 text-caution" />
      <h1 className="text-2xl font-bold text-caution">you are offline!</h1>
      <p className="text-base text-caution">
        Please check your internet connection and try again , once you connect ,
        the content will be available
      </p>
      <div className="flex gap-2 flex-row justify-around items-center mt-3">
        <button
          onClick={() => window.location.reload()}
          className="btn bg-main hover:bg-main/80 transition-all"
        >
          Reload
        </button>
        <button
          className="btn bg-main hover:bg-main/80 transition-all"
          onClick={() => window.close()}
        >
          Close
        </button>
      </div>
    </div>
  );
}
