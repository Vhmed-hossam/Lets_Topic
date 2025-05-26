import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import LogoutFunc from "../../Funcs/LogoutFunc";
import { useSettingStore } from "../../store/useSettingsStore";
import { usePopoversStore } from "../../store/usePopoversStore";
import SendLoader from "../Spinner/SendLoader";

export default function LogoutPopover() {
  const {
    isloggingout,
    Logoutacs,
  } = LogoutFunc();
  const { myMessageTheme, theme } = useSettingStore();
  const { CloseLogoutPopover } = usePopoversStore();
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
            Are you sure you want to Log Out?
          </h2>
        </div>
        <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
          <button
            onClick={Logoutacs}
            className="transition-all hover:opacity-80 flex-1 p-2 rounded-lg px-4 text-white flex items-center justify-center"
            style={{ backgroundColor: myMessageTheme }}
          >
            {isloggingout ? <SendLoader color={myMessageTheme} /> : "Log Out"}
          </button>
          <button
            onClick={CloseLogoutPopover}
            className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
