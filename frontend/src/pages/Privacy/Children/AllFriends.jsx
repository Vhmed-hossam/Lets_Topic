import { useFriendsStore } from "../../../store/useFriendsStore";
import { useAuthStore } from "../../../store/useAuthStore";
import SendLoader from "../../../components/Spinner/SendLoader";

export default function AllFriends() {
  const { friends, isUnfriending, unfriendUser } = useFriendsStore();
  const { authUser } = useAuthStore();

  return (
    <>
      {friends.length === 0 ? (
        <div className="flex p-3 bg-main/25 hover:bg-main/50 rounded-lg transition-all ">
          You do not have any blocked users.
        </div>
      ) : (
        friends.map((friends) => (
          <>
            <div
              key={friends._id}
              className="flex p-3 bg-main/25 rounded-lg transition-all items-center gap-3"
            >
              <div>
                <img
                  src={friends.profilePic}
                  alt={friends.username}
                  className="w-17 h-17 rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold">{friends.fullName}</span>
                <span className="text-sm text-gray-400">
                  @{friends.username}
                </span>
              </div>
              <button
                onClick={() =>
                  unfriendUser({
                    userId: authUser.user._id,
                    friendId: friends._id,
                  })
                }
                className="ml-auto bg-very-caution transition-all hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                {isUnfriending ? <SendLoader color="#BB0C0F" /> : "unfriend"}
              </button>
            </div>
          </>
        ))
      )}
    </>
  );
}
