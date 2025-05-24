import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  UserPlus,
  CheckCheck,
  ShoppingCart,
} from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import SidebarSkeleton from "../Skeletons/SidebarSkeleton";
import { useAuthStore } from "../../store/useAuthStore";
import { useFriendsStore } from "../../store/useFriendsStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { Link } from "react-router-dom";
import { useSettingStore } from "../../store/useSettingsStore";
import { ErrorToast } from "../Toast/Toasters";
import { defaultImage } from "../../Data/Avatars";
import filterUnreadFromFriends from "../../Tasks/filterUnread";

export default function Sidebar() {
  const [canSelect, setCanSelect] = useState(true);
  const {
    GetUsers,
    SelectedUser,
    isUsersLoading,
    SetSelectedUser,
    closeProfile,
    CloseMedia,
  } = useChatStore();
  const { fetchFriends, friends } = useFriendsStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { unreadMessages, resetAllUnread } = useNotificationStore();
  const [ShowOnline, setShowOnline] = useState(false);
  const { myMessageTheme } = useSettingStore();
  useEffect(() => {
    GetUsers();
    fetchFriends();
  }, [GetUsers, fetchFriends]);

  const handleSelectUser = (user) => {
    if (SelectedUser?._id === user._id) return;
    if (!canSelect) {
      ErrorToast("Please wait a few seconds before selecting another user.");
      return;
    }
    SetSelectedUser(user);
    setCanSelect(false);
    setTimeout(() => {
      setCanSelect(true);
    }, 500);
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  const filteredUsers = ShowOnline
    ? friends.filter((user) => onlineUsers.includes(user._id))
    : friends;
  const filteredUnread = filterUnreadFromFriends(
    unreadMessages,
    authUser.user.friends
  );
  return (
    <aside
      className="h-full pb-0 w-20 lg:w-72 border-r border-base-300 max-[550px]:border-none relative flex flex-col transition-all duration-200 mt-10 max-[550px]:w-full"
      key={JSON.stringify(unreadMessages)}
    >
      <div
        className="border-b w-full p-5"
        style={{ borderColor: myMessageTheme }}
      >
        <div className="flex items-center gap-2">
          <UsersIcon className="size-6" />
          {filteredUnread > 0 && (
            <span className="ml-2 badge badge-error badge-sm text-white">
              {filteredUnread.totalUnreadFromFriends}
            </span>
          )}
          <span className="font-medium hidden lg:block max-[550px]:block">
            Contacts
          </span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2 max-[550px]:flex">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={ShowOnline}
              onChange={(e) => setShowOnline(e.target.checked)}
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length} online)
          </span>
        </div>
      </div>
      <div className="overflow-y-auto w-full">
        {filteredUsers.map((user) => {
          const unreadCount = unreadMessages[user._id] || 0;
          return (
            <button
              className={`w-full p-3 flex items-start flex-row gap-3 hover:bg-base-300 transition-colors ${
                SelectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-main/15"
                  : ""
              }`}
              key={user._id}
              onClick={() => {
                handleSelectUser(user);
                closeProfile();
                CloseMedia();
              }}
            >
              <div className="relative mx-auto lg:mx-0 max-[550px]:m-0">
                <img
                  className="size-12 object-cover rounded-full"
                  src={user.profilePic || defaultImage}
                  alt={user.fullName}
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-zinc-900" />
                )}
                {unreadCount > 0 && (
                  <span
                    className="absolute bg-red-400 top-0 right-0 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-zinc-900"
                    style={{ zIndex: 10, backgroundColor: myMessageTheme }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left min-w-0 max-[550px]:block">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
      <div className="absolute bottom-5 w-full">
        <div>
          <div
            onClick={resetAllUnread}
            className="border-t border-base-300 p-1.5 py-3 hover:bg-main/10 transition-all flex flex-row items-center gap-2 max-lg:justify-center cursor-pointer"
          >
            <button className="">
              <CheckCheck />
            </button>
            <h2 className="max-lg:hidden">Mark all as read</h2>
          </div>
        </div>
        <Link to="/add-friend">
          <div className="border-t border-base-300 p-1.5 py-3 hover:bg-main/10 transition-all">
            <div className="flex flex-row items-center gap-2 max-lg:justify-center">
              <UserPlus />
              <h2 className="max-lg:hidden">Add friend</h2>
            </div>
          </div>
        </Link>
        <Link to="/shop">
          <div className="border-t border-base-300 p-1.5 py-3 hover:bg-main/10 transition-all">
            <div className="flex flex-row items-center gap-2 max-lg:justify-center">
              <ShoppingCart />
              <h2 className="max-lg:hidden">Shop</h2>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
