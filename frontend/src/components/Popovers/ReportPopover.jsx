import { usePopoversStore } from "../../store/usePopoversStore";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useSettingStore } from "../../store/useSettingsStore";
import { Camera, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import SendLoader from "../Spinner/SendLoader";
import { useState } from "react";
import { fetchImageAsBase64 } from "../../helpers/fetchImage64";
import { ErrorToast } from "../Toast/Toasters";
export default function ReportPopover() {
  const [ReportReason, setReportReason] = useState("");
  const { isReportingUser, ReportUser } = useAuthStore();
  const { SelectedUser, SetSelectedUser } = useChatStore();
  const { CloseReportPopover } = usePopoversStore();
  const { theme, myMessageTheme } = useSettingStore();
  const [SelectedImage, setSelectedImage] = useState(null);
  const handleImageUpload = async (input) => {
    if (typeof input === "string") {
      let imageToUse = "";
      imageToUse = await fetchImageAsBase64(input);
    } else {
      const file = input.target.files[0];
      if (!file) return ErrorToast("No file selected");
      if (!file.type.startsWith("image/"))
        return ErrorToast("Invalid file type. Please upload an image.");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImage(base64Image);
      };
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
        transition={{ duration: 0.2 }}
        className={`flex border-very-caution border-3 flex-col gap-5 overflow-hidden rounded-lg shadow-lg w-11/12 max-w-md p-4 relative ${
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
            Reporting {SelectedUser.fullName}
          </h2>
        </div>
        <div className="px-2 pt-2 space-y-2">
          <p>Please enter the reason for your report :</p>
          <textarea
            className="resize-none w-full p-2 border border-very-caution ring-0 rounded-md"
            placeholder="Enter the reason"
            onChange={(e) => setReportReason(e.target.value)}
            value={ReportReason}
          />
        </div>
        <div className="px-2 pt-2 space-y-2">
          <img src={SelectedImage} />
          <p className="pb-2">Upload an image (optional) :</p>
          <label
            htmlFor="avatar-upload"
            className={`bg-very-caution hover:bg-caution transition-all p-2 rounded-lg px-4 text-white`}
          >
            {SelectedImage ? "Change Image" : "Upload"}
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
          <button
            className="transition-all hover:opacity-80 flex-1 p-2 rounded-lg px-4 text-white flex items-center justify-center"
            style={{ backgroundColor: myMessageTheme }}
            onClick={async () => {
              await ReportUser({
                reportedEmail: SelectedUser.email,
                reason: ReportReason,
                image: SelectedImage,
              });
              CloseReportPopover();
              setSelectedImage(null);
              SetSelectedUser(null);
            }}
          >
            {isReportingUser ? <SendLoader color={myMessageTheme} /> : "Report"}
          </button>
          <button
            onClick={CloseReportPopover}
            className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
