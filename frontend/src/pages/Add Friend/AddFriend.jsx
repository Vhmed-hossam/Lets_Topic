import React, { useRef, useState } from "react";
import { useSettingStore } from "../../store/useSettingsStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Link } from "react-router-dom";
import { useFriendsStore } from "../../store/useFriendsStore";
import SendLoader from "../../components/Spinner/SendLoader";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { X } from "lucide-react";
import copy from "copy-to-clipboard";
import { SuccesToast } from "../../components/Toast/Toasters";
import { useTextColor } from "../../helpers/Colors";
export default function AddFriend() {
  const [Text, setText] = useState("");
  const { myMessageTheme } = useSettingStore();
  const { authUser } = useAuthStore();
  const { sendFriendRequest, isSendingFriendRequest } = useFriendsStore();
  const formRef = useRef(null);
  const textColor = useTextColor();
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  return (
    <div className="container mx-auto min-h-screen p-6">
      <div className="mt-16 space-y-2" ref={formRef}>
        <div>
          <Link to="/">
            <button
              className="btn rounded-full p-2 hover:bg-main/80"
              style={{
                backgroundColor: myMessageTheme,
                color: textColor,
              }}
            >
              <X className="p-0 m-0" />
            </button>
          </Link>
        </div>
        <div
          className="py-3 flex-1 border-b mb-3 relative"
          style={{ borderColor: myMessageTheme }}
        >
          <div className="flex flex-col gap-1 text-start items-start justify-start">
            <h2 className="text-2xl font-bold">Add friend</h2>
            <p className="text-sm text-base-content/70">
              you can add friends with thier username
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-row gap-2">
            <div className="flex flex-row flex-1 items-center justify-center">
              <div
                className="bg-gray-600 self-stretch w-2 px-5.5 rounded-s-lg flex items-center justify-center"
                style={{
                  borderColor: myMessageTheme,
                  backgroundColor: myMessageTheme,
                }}
              >
                <span
                  className="text-lg select-none"
                  style={{ color: textColor }}
                >
                  @
                </span>
              </div>
              <input
                type="text"
                className="w-full flex-1 ring-0 input border-2 bg-transparent rounded-e-lg rounded-s-none  focus:outline-none transition-all"
                placeholder="Search For User"
                style={{ borderColor: myMessageTheme }}
                value={Text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <button
              className="btn disabled:cursor-not-allowed disabled:opacity-75 transition-all"
              style={{
                backgroundColor: myMessageTheme,
                color: textColor,
              }}
              disabled={!Text.trim()}
              onClick={() => {
                sendFriendRequest({
                  senderUsername: authUser.user.username,
                  recipientUsername: Text,
                });
                setText("");
              }}
            >
              {isSendingFriendRequest ? (
                <SendLoader color={myMessageTheme} />
              ) : (
                "Send"
              )}
            </button>
          </div>
          <div className="flex flex-row items-center gap-2 mt-2">
            <p className="">anyways , your username is </p>
            <button
              onClick={() => {
                copy(authUser?.user?.username);
                SuccesToast("Copied to clipboard");
              }}
              className="disabled:cursor-not-allowed px-1.5 rounded-lg transition-all cursor-pointer"
              style={{
                backgroundColor: myMessageTheme,
                color: textColor,
              }}
            >
              <span>{authUser?.user?.username}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
