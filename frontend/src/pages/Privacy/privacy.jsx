import { Link, Outlet, useLocation } from "react-router-dom";
import { useFriendsStore } from "../../store/useFriendsStore";
import { ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Privacy() {
  const { friends, blockedUsers } = useFriendsStore();
  const { pathname } = useLocation();
  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });

  return (
    <>
      <div
        className="container mx-auto px-4 max-w-5xl flex-1 space-y-4"
        ref={formRef}
      >
        {pathname === "/settings/privacy" ? (
          <>
            <section>
              <div>
                <h2 className="text-lg font-semibold">Friends</h2>
                <p className="text-sm text-base-content/70">
                  check all of your friends
                </p>
              </div>
              <div className="pt-3">
                {friends.length === 0 ? (
                  <div
                    key={"friend._id"}
                    className="flex p-3 bg-main/25 rounded-lg transition-all "
                  >
                    You do not have any friends.
                  </div>
                ) : (
                  <>
                    <Link
                      to={`all-friends`}
                      className="flex p-3 bg-main/25 gap-3 transition-all hover:bg-main/50 rounded-lg items-center justify-between"
                    >
                      {" "}
                      <div className="flex flex-1 overflow-x-auto -space-x-7 items-center">
                        {friends.map((friend) => {
                          return (
                            <img
                              src={friend.profilePic}
                              alt={friend.username}
                              className="w-17 h-17 rounded-full object-cover"
                            />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-end">
                        <ChevronRight className="size-9" />
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </section>
            <section>
              <div>
                <h2 className="text-lg font-semibold">Blocked</h2>
                <p className="text-sm text-base-content/70">
                  check all of your blocks
                </p>
              </div>
              <div className="pt-3">
                {blockedUsers.length === 0 ? (
                  <div
                    key={"friend._id"}
                    className="flex p-3 bg-main/25 rounded-lg"
                  >
                    You did not block anyone.
                  </div>
                ) : (
                  blockedUsers.map((friend) => {
                    return (
                      <Link
                        to={`all-blocked`}
                        key={friend._id}
                        className="flex p-3 bg-main/25 gap-3 hover:bg-main/50 rounded-lg items-center justify-between"
                      >
                        <div className="flex flex-1 overflow-x-auto -space-x-7 items-center">
                          <img
                            src={friend.profilePic}
                            alt={friend.username}
                            className="w-17 h-17 rounded-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-end">
                          <ChevronRight className="size-9" />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </>
  );
}
