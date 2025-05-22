import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";
import { usePopoversStore } from "../../store/usePopoversStore";
import { useSettingStore } from "../../store/useSettingsStore";
import getContrastingTextColor from "../../helpers/GetContrast";
import SendLoader from "../Spinner/SendLoader";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
export default function EditPopover({ messageData }) {
  const { theme, myMessageTheme } = useSettingStore();
  const [NewText, setNewText] = useState("");
  const { CloseEditMessagePopover } = usePopoversStore();
  const { isEditing, EditMessage } = useChatStore();
  useEffect(() => {
    setNewText(messageData.text);
  }, []);
  console.log(messageData);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className={`flex border flex-col gap-5 overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
          theme === "dark" ? "bg-black-full" : "bg-white"
        }`}
        style={{ borderColor: myMessageTheme }}
      >
        <div
          onClick={CloseEditMessagePopover}
          className="flex flex-row items-center gap-2"
        >
          <button
            style={{
              color: getContrastingTextColor(myMessageTheme),
              backgroundColor: myMessageTheme,
            }}
            className="btn p-2 rounded-full transition-all hover:opacity-80"
          >
            <X />
          </button>
          <h2 className="text-lg">Edit message</h2>
        </div>
        <div className="h-[180px] w-full relative bg-black rounded-lg flex items-center justify-center chat">
          <div
            className="chat-bubble max-w-[350px] break-words relative group max-[550px]:max-w-[200px]"
            style={{
              backgroundColor: myMessageTheme,
              color: getContrastingTextColor(myMessageTheme),
            }}
          >
            {messageData.text}
          </div>
        </div>
        <div className="gap-3 p-2 flex flex-wrap justify-center items-center flex-row">
          <input
            type="text"
            className="w-full flex-1 ring-0 input border-2 bg-transparent rounded-lg focus:outline-none transition-all"
            placeholder="Enter your new message..."
            value={NewText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button
            onClick={async () => {
              await EditMessage({
                messageId: messageData._id,
                Text: NewText,
                selectedId: messageData.senderId,
                userToChatId: messageData.receiverId,
              });
              CloseEditMessagePopover();
              setNewText("");
            }}
            className="transition-all hover:bg-main-shiny bg-main p-2 rounded-lg px-4 text-white"
          >
            {isEditing ? <SendLoader color={myMessageTheme} /> : <Pencil />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
