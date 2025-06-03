import React, { useState, useMemo } from "react";
import { useChatStore } from "../../../store/useChatStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { Search, X } from "lucide-react";
import { defaultImage } from "../../../Data/Avatars";
import formatDate from "../../../helpers/formatDate";
import { useSettingStore } from "../../../store/useSettingsStore";
import { useTextColor } from "../../../helpers/Colors";

export default function ChatHeader() {
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { SelectedUser, SetSelectedUser, openProfile, closeProfile, Messages } =
    useChatStore();
  const textColor = useTextColor();

  const { onlineUsers } = useAuthStore();
  const { myMessageTheme } = useSettingStore();
  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    return Messages.filter((message) =>
      message.text.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, Messages]);
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-3 px-2 py-0.5 cursor-pointer flex-1"
          onClick={openProfile}
        >
          <div className="size-10 rounded-full relative overflow-hidden">
            <img
              src={SelectedUser?.profilePic || defaultImage}
              alt={SelectedUser?.fullName || "User"}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h3 className="font-medium">
              {SelectedUser?.fullName || "Unknown User"}
            </h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(SelectedUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="btn bg-transparent m-0 ring-0 border-0 p-0 cursor-pointer"
            aria-label="Search messages"
          >
            <Search className="size-5" />
          </button>
          <button
            onClick={() => {
              SetSelectedUser(null);
              closeProfile();
            }}
            className="btn bg-transparent m-0 ring-0 border-0 p-0"
            aria-label="Close chat"
          >
            <X />
          </button>
        </div>
      </div>

      {isSearchVisible && (
        <div className="mt-2">
          <div className="flex items-center gap-3 flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search messages..."
                className="input input-bordered w-full"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText.trim() !== "" && (
                <X
                  className="size-5 absolute top-2.5 right-3"
                  onClick={() => setSearchText("")}
                  aria-label="Close search"
                />
              )}
            </div>
            <button
              className="btn transition-all "
              onClick={() => setIsSearchVisible(false)}
              style={{
                background: myMessageTheme,
                color: textColor,
              }}
            >
              Close
            </button>
          </div>
          <div
            className={`mt-3 max-h-60 overflow-y-auto bg-base-100 border border-base-300 rounded-lg
          ${searchText.trim() ? "p-2" : "p-0 border-none"}`}
          >
            <div className="flex flex-col items-start">
              {searchText.trim() &&
                (searchResults.length > 0 ? (
                  searchResults.map((message, index) => (
                    <div
                      key={index}
                      className="p-2 rounded hover:bg-base-200 overflow-x-auto max-w-2xl overflow-hidden w-full cursor-pointer transition-all duration-500 bg-transparent"
                      onClick={() => {
                        const el = document.getElementById(
                          `message-${message._id}`
                        );
                        if (el) {
                          el.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                          el.classList.add("bg-gray-900");
                          setTimeout(() => {
                            el.classList.remove("bg-gray-900");
                          }, 1500);
                        }
                        setIsSearchVisible(false);
                        setSearchText("");
                      }}
                    >
                      <p className="text-sm text-base-content">
                        {message.text}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-base-content/50">
                    No results found.
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
