import { motion } from "framer-motion";
import { SquarePen, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { usePopoversStore } from "../../store/usePopoversStore";
import { useSettingStore } from "../../store/useSettingsStore";
import getContrastingTextColor from "../../helpers/GetContrast";
import SendLoader from "../Spinner/SendLoader";
import { ErrorToast } from "../Toast/Toasters";
import { useState } from "react";
export default function UsernamePopover() {
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const { authUser, isChangingUsername, ChangeUsername } = useAuthStore();
  const { CloseUsernamePopover } = usePopoversStore();
  const { theme } = useSettingStore();
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
        transition={{ duration: 0.15 }}
        className={`flex border border-main flex-col gap-5 overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
          theme === "dark" ? "bg-black-full" : "bg-white"
        }`}
      >
        <div>
          <button
            style={{ color: getContrastingTextColor("#645EE2") }}
            className="btn p-2 rounded-full bg-main transition-all hover:bg-main/80"
            onClick={CloseUsernamePopover}
          >
            <X />
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <SquarePen className="size-20 text-main" />
          <h2
            className={`text-xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-black-full"
            }`}
          >
            Change your username
          </h2>

          <p className="text-center text-base-content/70">
            please fill out these inputs to continue
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            className="w-full flex-1 ring-0 input border-2 bg-transparent rounded-lg focus:outline-none transition-all"
            placeholder="Enter your new username..."
            value={Username}
            onChange={(e) => setUsername(e.target.value)}
            
          />
          <input
            type="text"
            className="w-full flex-1 ring-0 input border-2 bg-transparent rounded-lg focus:outline-none transition-all"
            placeholder="Enter your password..."
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              ErrorToast("You cannot paste text in this input.");
            }}
          />
          <button
            onClick={async () => {
              await ChangeUsername(authUser.user._id, {
                username: Username,
                password: Password,
              });
              CloseUsernamePopover();
              setPassword("");
              setUsername("");
            }}
            className="transition-all w-full flex items-center justify-center hover:bg-main/80 bg-main p-2 rounded-lg px-4 text-white"
          >
            {isChangingUsername ? (
              <SendLoader color={"#645EE2"} />
            ) : (
              "Change username"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
