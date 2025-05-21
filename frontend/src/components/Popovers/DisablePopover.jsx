import { motion } from "framer-motion";
import { X } from "lucide-react";
import { OctagonAlert } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { usePopoversStore } from "../../store/usePopoversStore";
import { useSettingStore } from "../../store/useSettingsStore";
import getContrastingTextColor from "../../helpers/GetContrast";
import { Link } from "react-router-dom";
import SendLoader from "../Spinner/SendLoader";
import { ErrorToast } from "../Toast/Toasters";
import { useState } from "react";

export default function DisablePopover() {
  const [Password, setPassword] = useState("");
  const { DisableAccount, isDisabling, isDisabled } = useAuthStore();
  const { CloseDisablePopover } = usePopoversStore();
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
        className={`flex border border-very-caution flex-col gap-5 overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
          theme === "dark" ? "bg-black-full" : "bg-white"
        }`}
      >
        <div>
          <button
            style={{ color: getContrastingTextColor("#BB0C0F") }}
            className="btn p-2 rounded-full bg-very-caution transition-all hover:bg-caution"
            onClick={CloseDisablePopover}
          >
            <X />
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <OctagonAlert className="size-20 text-very-caution" />
          <h2
            className={`text-xl font-bold text-center ${
              theme === "dark" ? "text-white" : "text-black-full"
            }`}
          >
            Disable your account
          </h2>
          {!isDisabled && (
            <p className="text-center text-base-content/70">
              please enter your password to continue
            </p>
          )}
        </div>
        {isDisabled ? (
          <div className="gap-3 p-2 flex flex-wrap justify-center items-center flex-row">
            <Link to="/confirm-disable-account" className="w-full">
              <button
                className="w-full transition-all hover:bg-caution bg-very-caution p-2 rounded-lg px-4 text-white"
                onClick={CloseDisablePopover}
              >
                {isDisabling ? (
                  <SendLoader color={"#BB0C0F"} />
                ) : (
                  "Disable my account"
                )}
              </button>
            </Link>
          </div>
        ) : (
          <div className="gap-3 p-2 flex flex-wrap justify-center items-center flex-row">
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
                await DisableAccount(Password);
                setPassword("");
              }}
              className="transition-all hover:bg-caution bg-very-caution p-2 rounded-lg px-4 text-white"
            >
              {isDisabling ? <SendLoader color={"#BB0C0F"} /> : "Disable"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
