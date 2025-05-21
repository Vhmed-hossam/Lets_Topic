import { motion } from "framer-motion";
import { usePopoversStore } from "../../store/usePopoversStore";
import { TriangleAlert } from "lucide-react";
import SigninLoader from "../Spinner/signinloader";
import { useSettingStore } from "../../store/useSettingsStore";
export default function RestorePopover() {
  const { CloseRestorePopover } = usePopoversStore();
  const { theme } = useSettingStore();
  const handleRestoreAccount = async () => {
    try {
      await restoreAccount(values);
    } catch (error) {
      console.log(error);
    } finally {
      CloseRestorePopover();
    }
  };
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
        transition={{ duration: 0.3 }}
        className={`flex border border-very-caution flex-col gap-5 overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
          theme === "dark" ? "bg-black-full" : "bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <TriangleAlert className="size-20 text-very-caution" />
          <h2
            className={`text-lg font-semibold text-center ${
              theme === "dark" ? "text-white" : "text-black-full"
            }`}
          >
            This account is Disabled, Check your Gmail or restore it yourself!
          </h2>
        </div>
        <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
          <button
            onClick={handleRestoreAccount}
            className="bg-main hover:bg-main/75 transition-all flex-1 p-2 rounded-lg px-4 text-white"
          >
            {isRestoring ? <SigninLoader /> : "Restore"}
          </button>
          <button
            onClick={CloseRestorePopover}
            className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
