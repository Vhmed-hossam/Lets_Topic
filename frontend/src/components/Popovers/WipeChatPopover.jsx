import { useFriendsStore } from "../../store/useFriendsStore";
import { useChatStore } from "../../store/useChatStore";
import { usePopoversStore } from "../../store/usePopoversStore";
import { useSettingStore } from "../../store/useSettingsStore";
import { TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import SendLoader from "../Spinner/SendLoader";
export default function WipeChatPopover() {
  const { SelectedUser, SetSelectedUser } = useChatStore();
  const { CloseWipePopover } = usePopoversStore();
  const { WipechatRequest, isWiping } = useFriendsStore();
  const { theme, myMessageTheme } = useSettingStore();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black-full/40 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`flex border border-very-caution flex-col gap-5 overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
          theme === "dark" ? "bg-black-full" : "bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <TriangleAlert className="size-20 text-very-caution" />
          <h2
            className={`text-xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-black-full"
            }`}
          >
            Are you sure you want to Wipe chat with {SelectedUser.fullName}?
          </h2>
        </div>
        <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
          <button
            className="transition-all hover:opacity-80 flex-1 p-2 rounded-lg px-4 text-white flex items-center justify-center"
            style={{ backgroundColor: myMessageTheme }}
            onClick={async () => {
              await WipechatRequest(SelectedUser._id);
              CloseWipePopover();
              SetSelectedUser(null);
            }}
          >
            {isWiping ? <SendLoader color={myMessageTheme} /> : "Wipe"}
          </button>
          <button
            onClick={CloseWipePopover}
            className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
