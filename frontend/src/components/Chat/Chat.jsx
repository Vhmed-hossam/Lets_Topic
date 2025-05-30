import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Chatheader from "./header/chatheader";
import Chatinput from "./input/chatinput";
import ChatSkeleton from "../Skeletons/ChatSkeleton";
import { useSettingStore } from "../../store/useSettingsStore";
import formatTime from "../../helpers/formatTime";
import getContrastingTextColor from "../../helpers/GetContrast";
import formatDateOnly from "../../helpers/formatDateonly";
import MinimalAudioPlayer from "../CustomAudioPlayer/CustomAudioPlayer";
import { useFriendsStore } from "../../store/useFriendsStore";
import CustomVideoPlayer from "../CustomVideoPlayer/CustomVideoPlayer";
import { Download, Pencil, Trash } from "lucide-react";
import { defaultImage } from "../../Data/Avatars";
import renderTextWithLinks from "../../helpers/renderTLink";
import { AnimatePresence } from "framer-motion";
import { usePopoversStore } from "../../store/usePopoversStore";
import DeletePopover from "../Popovers/DeleteMPopover";
import EditMessagePopover from "../Popovers/EditMPopover";
import { downloadImage, downloadVideo } from "../../helpers/downloadImage";
export default function Chat() {
  const [Data, setData] = useState(null);
  const [MessageDeletionData, setMessageDeletionData] = useState("");
  const scrollRef = useRef(null);
  const {
    Messages,
    GetMessages,
    SelectedUser,
    isMessagesLoading,
    isTyping,
    typingUserId,
    SubscribeToMessages,
    UnsubscribeFromMessages,
    SetSelectedUser,
  } = useChatStore();
  const {
    EditMessagePopoverState,
    OpenEditMessagePopover,
    DeleteMessagePopoverState,
    OpenDeleteMessagePopover,
  } = usePopoversStore();
  const { authUser } = useAuthStore();
  const { theme, myMessageTheme, mySenderTheme } = useSettingStore();
  const { sendFriendRequest, SendMessage, friends } = useFriendsStore();
  const scrollToBottom = (behavior) => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(
    () => scrollToBottom("smooth"),
    [Messages, SelectedUser?._id, isMessagesLoading]
  );

  useEffect(() => {
    if (SelectedUser?._id && SelectedUser._id !== authUser.user._id) {
      GetMessages(SelectedUser._id);
      SubscribeToMessages();
    } else if (SelectedUser?._id === authUser.user._id) {
      SetSelectedUser(null);
    }
    return () => UnsubscribeFromMessages();
  }, [
    SelectedUser?._id,
    GetMessages,
    SubscribeToMessages,
    UnsubscribeFromMessages,
    SetSelectedUser,
    authUser.user._id,
  ]);
  if (isMessagesLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-auto">
        <ChatSkeleton />
      </div>
    );
  }
  return (
    <>
      <AnimatePresence>
        {EditMessagePopoverState && <EditMessagePopover messageData={Data} />}{" "}
      </AnimatePresence>
      <AnimatePresence>
        {DeleteMessagePopoverState && (
          <DeletePopover messageData={MessageDeletionData} />
        )}{" "}
      </AnimatePresence>
      <div
        className="flex flex-1 self-stretch flex-col overflow-auto scrollbar-hide"
        ref={scrollRef}
      >
        <div className="flex flex-col self-stretch flex-1">
          <div
            className={`sticky z-10 top-0 ${
              theme === "dark" ? "bg-black-full" : "bg-white"
            }`}
          >
            <Chatheader />
          </div>
          <div className="p-2 px-6 flex-1 items-center self-stretch overflow-auto">
            <div>
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col gap-2 flex-1 items-start justify-end p-3 self-stretch border-b border-base-100">
                  <div className="flex justify-center  items-center w-[100px] h-[100px] rounded-full overflow-hidden">
                    <img
                      src={SelectedUser?.profilePic || defaultImage}
                      alt={`${SelectedUser?.fullName || "User"} Profile Pic`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg max-w-xl">
                      This is the beginning of your Legendary Conversation with
                      <span className="text-second text-xl">
                        {" "}
                        {SelectedUser?.fullName || "User"}
                      </span>
                    </h2>
                  </div>
                  {Messages.length !== 0 &&
                    authUser.user._id &&
                    friends.includes(SelectedUser._id) && (
                      <div className="flex flex-row gap-2 ">
                        <button
                          className="btn bg-main border-0 ring-0"
                          onClick={() => {
                            sendFriendRequest({
                              senderUsername: authUser.user.username,
                              recipientUsername: SelectedUser.username,
                            });
                          }}
                        >
                          Add Friend
                        </button>
                        <button
                          className="btn bg-second border-0 ring-0"
                          onClick={() => {
                            SendMessage({
                              text: `Hi! I'm ${authUser.user.fullName}! Nice to meet you!`,
                              senderId: authUser.user._id,
                              receiverId: SelectedUser._id,
                              image: "",
                            });
                          }}
                        >
                          Say Hi!
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
            <div className="overflow-hidden">
              {Messages.map((message, index) => {
                const isMine = message.senderId === authUser.user._id;
                const currentDate = new Date(message.createdAt);
                currentDate.setHours(0, 0, 0, 0);
                const previousMessage = Messages[index - 1];
                let showDateSeparator = false;
                if (!previousMessage) {
                  showDateSeparator = true;
                } else {
                  const previousDate = new Date(previousMessage.createdAt);
                  previousDate.setHours(0, 0, 0, 0);
                  showDateSeparator =
                    currentDate.getTime() !== previousDate.getTime();
                }
                const textColor = getContrastingTextColor(
                  isMine ? myMessageTheme : mySenderTheme
                );
                return (
                  <div
                    key={message._id}
                    id={`message-${message._id}`}
                    className="transition-all duration-300 relative mx-3"
                  >
                    {showDateSeparator && (
                      <div className="flex justify-center my-4 transition-all duration-300 bg-transparent">
                        <span
                          className={`text-xs py-1 px-3 rounded-full ${
                            theme === "dark"
                              ? "bg-gray-800 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {formatDateOnly(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`chat transition-all duration-300 bg-transprent group  ${
                        isMine ? "chat-end" : "chat-start"
                      }`}
                    >
                      <div className="flex flex-row items-center gap-2 ">
                        {isMine && (
                          <div className="hidden group-hover:flex">
                            <div className="flex gap-2 text-zinc-500">
                              <button
                                onClick={() => {
                                  setMessageDeletionData(message);
                                  OpenDeleteMessagePopover();
                                }}
                                className="cursor-pointer"
                              >
                                <Trash size={20} />
                              </button>
                              {message?.text && (
                                <button
                                  onClick={async () => {
                                    setData(message);
                                    OpenEditMessagePopover();
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Pencil size={20} />
                                </button>
                              )}
                              {message?.image && (
                                <button
                                  onClick={async () => {
                                    downloadImage(message.image);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Download size={20} />
                                </button>
                              )}
                              {message?.videoUrl && (
                                <button
                                  onClick={async () => {
                                    downloadVideo(message.videoUrl);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Download size={20} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        <div
                          className="chat-bubble max-w-[350px] break-words relative group max-[550px]:max-w-[200px] pe-7"
                          style={{
                            backgroundColor: isMine
                              ? myMessageTheme
                              : mySenderTheme,
                            color: textColor,
                          }}
                        >
                          {message?.image && (
                            <img
                              src={message.image}
                              className="w-full max-w-[300px] rounded-md mb-2 "
                              alt=""
                            />
                          )}
                          {message?.type === "voice" && (
                            <div className="mt-2 w-full">
                              <MinimalAudioPlayer src={message.voiceUrl} />
                            </div>
                          )}
                          {message?.type === "video" && (
                            <div className="mt-2 w-full">
                              <CustomVideoPlayer src={message.videoUrl} />
                            </div>
                          )}
                          {message?.text &&
                            renderTextWithLinks(
                              message.text,
                              getContrastingTextColor(
                                isMine ? myMessageTheme : mySenderTheme
                              )
                            )}
                          <div
                            className={`mt-1 text-xs  ${
                              isMine ? "text-end" : "text-start"
                            }`}
                          >
                            <span>{!message.edited ? "" : "Edited"}</span>{" "}
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {isTyping && typingUserId === SelectedUser?._id && (
              <div className="chat chat-start">
                <div
                  className="chat-bubble max-w-[300px] break-words"
                  style={{
                    backgroundColor: mySenderTheme || "#FFFFFF",
                    color: getContrastingTextColor(mySenderTheme || "#FFFFFF"),
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="animate-pulse">•</span>
                    <span className="animate-pulse delay-100">•</span>
                    <span className="animate-pulse delay-200">•</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className={`sticky z-10 bottom-0 ${
              theme === "dark" ? "bg-black-full" : "bg-white"
            }`}
          >
            <Chatinput />
          </div>
        </div>
      </div>
    </>
  );
}
