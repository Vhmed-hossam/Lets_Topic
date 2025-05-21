import SendLoader from "../../../components/Spinner/SendLoader";
import { useAuthStore } from "../../../store/useAuthStore";
import { useFriendsStore } from "../../../store/useFriendsStore";

export default function AllBlocked() {
  const { blockedUsers, unblockUser, isUnblocking } = useFriendsStore();
  const { authUser } = useAuthStore();

  return (
    <>
      {blockedUsers.length === 0 ? (
        <div className="flex p-3 bg-main/25 hover:bg-main/50 rounded-lg transition-all ">
          You do not have any blocked users.
        </div>
      ) : (
        blockedUsers.map((blockedUser) => (
          <div
            key={blockedUser._id}
            className="flex p-3 bg-main/25 rounded-lg transition-all items-center gap-3"
          >
            <div>
              <img
                src={blockedUser.profilePic}
                alt={blockedUser.username}
                className="w-17 h-17 rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">{blockedUser.fullName}</span>
              <span className="text-sm text-gray-400">
                @{blockedUser.username}
              </span>
            </div>
            <button
              onClick={() =>
                unblockUser({
                  userId: authUser.user._id,
                  unblockUserId: blockedUser._id,
                })
              }
              className="ml-auto bg-very-caution transition-all hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              {isUnblocking ? <SendLoader color="#BB0C0F" /> : "Unblock"}
            </button>
          </div>
        ))
      )}
    </>
  );
}
