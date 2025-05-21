import { useChatStore } from "../../store/useChatStore";
import { useSettingStore } from "../../store/useSettingsStore";
import {
  Ban,
  ThumbsDown,
  Trash2,
  TriangleAlert,
  UserX,
  Volume2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import getContrastingTextColor from "../../helpers/GetContrast";
import { defaultImage } from "../../Data/Avatars";
import formatDateOnly from "../../helpers/formatDateonly";
import { useFriendsStore } from "../../store/useFriendsStore";
import { useState } from "react";
import renderTextWithLinks from "../../helpers/renderTLink";
import SigninLoader from "../Spinner/signinloader";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileComp() {
  const [BlockPopover, setBlockPopover] = useState(false);
  const [WipePopover, setWipePopover] = useState(false);
  const [UnfriendPopover, setUnfriendPopover] = useState(false);
  const [ReportPopover, setReportPopover] = useState(false);
  const [ReportReason, setReportReason] = useState("")
  const { authUser, isReportingUser, ReportUser } = useAuthStore();
  const {
    SelectedUser,
    ProfileOpened,
    closeProfile,
    ChatMedia,
    OpenMedia,
    SetSelectedUser,
  } = useChatStore();
  const {
    unfriendUser,
    blockUser,
    WipechatRequest,
    isBlocking,
    isWiping,
    isUnfriending,
  } = useFriendsStore();
  const { theme, myMessageTheme } = useSettingStore();
  const backgroundColor = theme === "dark" ? "#0A0A17" : "#EFEFFC";
  const textColor = getContrastingTextColor(backgroundColor);
  const secondaryTextColor = theme === "dark" ? "#A0A0A0" : "#666666";
  const borderColor = theme === "dark" ? "#333333" : "#D1D1D1";
  const placeholderBgColor = theme === "dark" ? "#333333" : "#D1D1D1";
  return (
    <>
      <AnimatePresence>
        {BlockPopover && (
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
                  Are you sure you want to Block {SelectedUser.fullName}?
                </h2>
              </div>
              <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
                <button
                  className="transition-all hover:opacity-80 flex-1 p-2 rounded-lg px-4 text-white"
                  style={{ backgroundColor: myMessageTheme }}
                  onClick={async () => {
                    await blockUser({
                      userId: authUser.user._id,
                      blockUserId: SelectedUser._id,
                    });
                    setBlockPopover(false);
                    SetSelectedUser(null);
                  }}
                >
                  {isBlocking ? <SigninLoader /> : "Block"}
                </button>
                <button
                  onClick={() => setBlockPopover(false)}
                  className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {WipePopover && (
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
                  Are you sure you want to Wipe chat with{" "}
                  {SelectedUser.fullName}?
                </h2>
              </div>
              <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
                <button
                  className="transition-all hover:opacity-80 flex-1 p-2 rounded-lg px-4 text-white"
                  style={{ backgroundColor: myMessageTheme }}
                  onClick={async () => {
                    await WipechatRequest(SelectedUser._id);
                    setWipePopover(false);
                    SetSelectedUser(null);
                  }}
                >
                  {isWiping ? <SigninLoader /> : "Wipe"}
                </button>
                <button
                  onClick={() => setWipePopover(false)}
                  className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {UnfriendPopover && (
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
                  Are you sure you want to Unfriend {SelectedUser.fullName}?
                </h2>
              </div>
              <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
                <button
                  className="transition-all hover:opacity-80 flex-1 p-2 rounded-lg px-4 text-white"
                  style={{ backgroundColor: myMessageTheme }}
                  onClick={async () => {
                    await unfriendUser({
                      userId: authUser.user._id,
                      friendId: SelectedUser._id,
                    });
                    setUnfriendPopover(false);
                    SetSelectedUser(null);
                  }}
                >
                  {isUnfriending ? <SigninLoader /> : "Unfriend"}
                </button>
                <button
                  onClick={() => setUnfriendPopover(false)}
                  className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ReportPopover && (
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
              <div className="p-2 space-y-2">
                <p>Please enter the reason for your report :</p>
                <textarea
                  className="resize-none w-full p-2 border border-very-caution ring-0 rounded-md"
                  placeholder="Enter the reason"
                  onChange={(e) => setReportReason(e.target.value)}
                  value={ReportReason}
                />
              </div>
              <div className="gap-5  p-2 flex flex-wrap justify-center items-center flex-row">
                <button
                  className="transition-all hover:opacity-80 flex-1 p-2 rounded-lg px-4 text-white"
                  style={{ backgroundColor: myMessageTheme }}
                  onClick={async () => {
                    await ReportUser({});
                    setReportPopover(false);
                    SetSelectedUser(null);
                  }}
                >
                  {isReportingUser ? <SigninLoader /> : "Report"}
                </button>
                <button
                  onClick={() => setReportPopover(false)}
                  className="bg-very-caution flex-1 hover:bg-caution transition-all p-2 rounded-lg px-4 text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ProfileOpened && (
          <motion.div
            key="profile-panel"
            className="h-full space-y-2 w-full overflow-y-auto overflow-x-hidden relative flex flex-col right-0 top-0 pointer-events-auto"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              backgroundColor,
              color: textColor,
            }}
          >
            <div
              className="flex items-center gap-2 justify-start p-4 border-b"
              style={{ borderColor }}
            >
              <button
                className="p-2 rounded-full hover:opacity-75 transition-colors cursor-pointer"
                style={{
                  backgroundColor: theme === "dark" ? "#FFFFFF20" : "#00000010",
                }}
                onClick={() => closeProfile()}
              >
                <X className="w-6 h-6" style={{ color: secondaryTextColor }} />
              </button>{" "}
              <h2 className="text-lg font-semibold">User Info</h2>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full">
                <div className="w-full h-40 relative">
                  <img
                    src={SelectedUser?.banner}
                    alt="Banner"
                    className="w-full h-full object-cover "
                  />
                </div>
                <div
                  className="absolute left-1/2 -bottom-12 transform -translate-x-1/2 z-10 w-25 h-25 rounded-full border-4"
                  style={{
                    backgroundColor: placeholderBgColor,
                    borderColor: backgroundColor,
                  }}
                >
                  <img
                    src={SelectedUser.profilePic || defaultImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full "
                  />
                </div>
              </div>
              <div className="h-12" />
              <div className="text-center">
                <h3 className="text-xl font-medium">
                  {SelectedUser?.fullName || "Unknown User"}
                </h3>
                <p className="text-sm" style={{ color: secondaryTextColor }}>
                  @{SelectedUser?.username}
                </p>
              </div>
            </div>
            <div className="p-4 border-t" style={{ borderColor }}>
              <h4 className="text-sm" style={{ color: secondaryTextColor }}>
                Bio
              </h4>
              <p className="text-sm mt-1 max-h-40 overflow-y-auto">
                {SelectedUser?.bio &&
                  renderTextWithLinks(
                    SelectedUser?.bio,
                    getContrastingTextColor(myMessageTheme)
                  )}
              </p>
            </div>
            <div
              style={{
                backgroundColor: theme === "dark" ? "#FFFFFF10" : "#00000005",
              }}
            >
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-10 transition-colors"
                onClick={() => {
                  OpenMedia();
                }}
              >
                <h4 className="text-sm" style={{ color: secondaryTextColor }}>
                  Media
                </h4>
                <button className="flex items-center space-x-2">
                  <span className="text-sm">{ChatMedia.length}</span>
                  <span style={{ color: secondaryTextColor }}>
                    {ChatMedia.length > 0 && "➔"}
                  </span>
                </button>
              </div>
              <div className="px-4 py-3 flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {ChatMedia.length === 0 && (
                  <h4 className="text-sm text-gray-400">
                    No Media in this chat.
                  </h4>
                )}
                {ChatMedia.slice(0, 7).map((media, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-800/60 hover:bg-gray-700/60 shadow-md transition-all duration-200 ease-in-out"
                  >
                    {media.type === "image" && (
                      <img
                        src={media.image}
                        alt="Chat media"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {media.type === "video" && (
                      <video
                        src={media.videoUrl}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {media.type === "voice" && (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/80 text-white px-2 py-1">
                        <div className="text-xl mb-1">
                          <Volume2 />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div
                className="p-4 border-t flex justify-between items-center cursor-pointer hover:bg-opacity-10 transition-colors"
                style={{
                  borderColor,
                  backgroundColor: theme === "dark" ? "#FFFFFF10" : "#00000005",
                }}
              >
                <h2>Member Since</h2>
                <p>{formatDateOnly(SelectedUser.createdAt)}</p>
              </div>
              <div className="p-2 mt-2 text-caution gap-3 flex flex-col">
                <div>
                  <div
                    onClick={() => setUnfriendPopover(true)}
                    className="p-4 flex rounded-lg justify-start gap-2 items-center text-caution cursor-pointer hover:bg-opacity-10 transition-colors hover:bg-very-caution/20"
                  >
                    <UserX />
                    <h2>Unfriend {SelectedUser.fullName}</h2>
                  </div>
                  <div
                    onClick={() => {
                      setWipePopover(true);
                    }}
                    className="p-4 flex rounded-lg justify-start gap-2 items-center text-caution cursor-pointer hover:bg-opacity-10 transition-colors hover:bg-very-caution/20"
                  >
                    <Trash2 />
                    <h2>Wipe Chat</h2>
                  </div>
                  <div
                    onClick={() => {
                      setBlockPopover(true);
                    }}
                    className="p-4 flex rounded-lg justify-start gap-2 items-center text-caution cursor-pointer hover:bg-opacity-10 transition-colors hover:bg-very-caution/20"
                  >
                    <Ban />
                    <h2>Block {SelectedUser.fullName}</h2>
                  </div>
                  <div
                    onClick={() => {
                      setReportPopover(true);
                    }}
                    className="p-4 flex rounded-lg justify-start gap-2 items-center text-caution cursor-pointer hover:bg-opacity-10 transition-colors hover:bg-very-caution/20"
                  >
                    <ThumbsDown />
                    <h2>Report {SelectedUser.fullName}</h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
