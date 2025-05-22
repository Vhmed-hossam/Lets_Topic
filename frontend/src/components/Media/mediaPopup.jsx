import { useChatStore } from "../../store/useChatStore";
import { useSettingStore } from "../../store/useSettingsStore";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import getContrastingTextColor from "../../helpers/GetContrast";
import { useState } from "react";
import MinimalAudioPlayer from "../CustomAudioPlayer/CustomAudioPlayer";
import CustomVideoPlayer from "../CustomVideoPlayer/CustomVideoPlayer";
import formatDate from "../../helpers/formatDate";
import { useAuthStore } from "../../store/useAuthStore";

export default function MediaPopup() {
  const { ChatMedia, MediaOpened, CloseMedia, SelectedUser } = useChatStore();
  const { theme, myMessageTheme } = useSettingStore();
  const { authUser } = useAuthStore();
  const [selectedType, setSelectedType] = useState("Image");

  const backgroundColor = theme === "dark" ? "#0A0A17" : "#EFEFFC";
  const textColor = getContrastingTextColor(backgroundColor);
  const secondaryTextColor = theme === "dark" ? "#A0A0A0" : "#666666";
  const borderColor = theme === "dark" ? "#333333" : "#D1D1D1";

  const filteredMedia = ChatMedia.filter(
    (item) => item.type === selectedType.toLowerCase()
  );
  return (
    <AnimatePresence>
      {MediaOpened && (
        <motion.div
          key="media-panel"
          className="h-full space-y-2 w-full overflow-y-auto overflow-x-hidden flex flex-col absolute right-0 top-0 pointer-events-auto"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ backgroundColor, color: textColor }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor }}
          >
            <h2 className="text-lg font-semibold">Chat Media</h2>
            <button
              onClick={CloseMedia}
              className="p-2 rounded-full hover:opacity-75 transition"
              style={{
                backgroundColor: theme === "dark" ? "#ffffff20" : "#00000010",
              }}
            >
              <X className="w-5 h-5" style={{ color: secondaryTextColor }} />
            </button>
          </div>
          <div
            className="flex justify-around px-4 py-2 border-b"
            style={{ borderColor }}
          >
            {["Image", "Video", "Voice"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-sm px-4 py-1 rounded-md transition-colors font-medium ${
                  selectedType === type
                    ? "bg-main text-white"
                    : "hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
                style={{
                  backgroundColor: selectedType === type && myMessageTheme,
                  color: getContrastingTextColor(
                    selectedType === type ? myMessageTheme : backgroundColor
                  ),
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="p-4 flex flex-wrap gap-4 justify-center items-center">
            {filteredMedia.length === 0 ? (
              <p className="text-sm text-gray-400">
                No {selectedType.toLowerCase()}s found.
              </p>
            ) : (
              filteredMedia.map((item, index) => {
                if (item.type === "image") {
                  return (
                    <img
                      key={index}
                      src={item.image}
                      alt="media"
                      className="w-40 h-40 object-cover rounded-md border"
                      style={{ borderColor }}
                    />
                  );
                }

                if (item.type === "video") {
                  return (
                    <div key={index}>
                      <CustomVideoPlayer src={item.videoUrl} />
                    </div>
                  );
                }
                if (item.type === "voice") {
                  return (
                    <div
                      key={index}
                      className="p-3 border rounded-md space-y-1"
                      style={{ borderColor: myMessageTheme }}
                    >
                      <MinimalAudioPlayer src={item.voiceUrl} />
                    </div>
                  );
                }
                return null;
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
