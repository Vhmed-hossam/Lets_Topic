import { motion } from "framer-motion";
import { X } from "lucide-react";
import { OctagonAlert } from "lucide-react";
import { usePopoversStore } from "../../store/usePopoversStore";
import { useSettingStore } from "../../store/useSettingsStore";
import getContrastingTextColor from "../../helpers/GetContrast";
import SendLoader from "../Spinner/SendLoader";
import { useChatStore } from "../../store/useChatStore";
export default function DeleteMessagePopover({ messageData }) {
  const { theme } = useSettingStore();
  const { CloseDeleteMessagePopover } = usePopoversStore();
  const { isDeleting, DeleteMessage } = useChatStore();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black-full/40"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className={`flex border flex-col gap-5 overflow-hidden border-caution rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
          theme === "dark" ? "bg-black-full" : "bg-white"
        }`}
      >
        <div className="flex flex-row items-center gap-2">
          <button
            style={{
              color: getContrastingTextColor("#E25E60"),
            }}
            className="btn p-2 rounded-full transition-all hover:opacity-80 bg-caution"
            onClick={CloseDeleteMessagePopover}
          >
            <X />
          </button>
          <h2 className="text-lg">Delete message</h2>
        </div>
        <div className="w-full relative rounded-lg flex items-center justify-center chat">
          <div className="flex flex-col gap-2 items-center">
            <OctagonAlert className="text-caution size-20" />
            <p className="text-lg text-center">
              Are you sure you want to delete that message?
            </p>
          </div>
        </div>
        <div className="gap-3 p-2 flex flex-wrap justify-center items-center flex-row">
          <button
            className="transition-all hover:bg-very-caution items-center justify-center flex bg-caution p-2 rounded-lg px-4 text-white flex-1"
            onClick={async () => {
              await DeleteMessage({
                messageId: messageData._id,
                userToChatId: messageData.receiverId,
              });
              CloseDeleteMessagePopover();
            }}
          >
            {isDeleting ? <SendLoader color="#E25E60" /> : "Delete"}
          </button>
          <button
            className="transition-all hover:bg-very-caution bg-caution p-2 items-center justify-center flex rounded-lg px-4 text-white flex-1"
            onClick={CloseDeleteMessagePopover}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
