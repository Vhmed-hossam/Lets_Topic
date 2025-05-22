import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { defaultImage } from "../../../Data/Avatars";
import { useSettingStore } from "../../../store/useSettingsStore";
import getContrastingTextColor from "../../../helpers/GetContrast";
import { Link } from "react-router-dom";
import { HideEmail } from "../../../helpers/hideContent";
import copy from "copy-to-clipboard";
import { Copy, LogOutIcon, Pencil } from "lucide-react";
import { SuccesToast } from "../../../components/Toast/Toasters";
import SendLoader from "../../../components/Spinner/SendLoader";
import { AnimatePresence } from "framer-motion";
import { useTextColor } from "../../../helpers/Colors";
import LogoutPopover from "../../../components/Popovers/LogoutPopover";
import { usePopoversStore } from "../../../store/usePopoversStore";
import DisablePopover from "../../../components/Popovers/DisablePopover";
import UsernamePopover from "../../../components/Popovers/UsernamePopover";
import DeletePopover from "../../../components/Popovers/DeletePopover";
export default function Account() {
  const textColor = useTextColor();
  const { authUser, UpdatePassword, isUpdatingPassword } = useAuthStore();
  const [ShowEmail, setShowEmail] = useState(false);
  const [timer, setTimer] = useState(5);
  const formRef = useRef(null);
  const { myMessageTheme, theme } = useSettingStore();
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  const AccountData = [
    {
      title: "Name",
      value: authUser?.user?.fullName,
    },
    {
      title: "Username",
      value: authUser?.user?.username,
    },
    {
      title: "Email",
      value: ShowEmail
        ? authUser?.user?.email
        : HideEmail(authUser?.user?.email),
    },
  ];
  useEffect(() => {
    let interval;

    if (ShowEmail) {
      setTimer(5);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            setShowEmail(false);
            clearInterval(interval);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [ShowEmail]);
  const {
    LogoutPopoverState,
    OpenLogoutPopover,
    DisablePopoverState,
    OpenDisablePopover,
    UsernamePopoverState,
    OpenUsernamePopover,
    DeletePopoverState,
    OpenDeletePopover,
  } = usePopoversStore();
  return (
    <>
      <AnimatePresence>
        {LogoutPopoverState && <LogoutPopover />}
      </AnimatePresence>
      <AnimatePresence>
        {DisablePopoverState && <DisablePopover />}
      </AnimatePresence>
      <AnimatePresence>
        {UsernamePopoverState && <UsernamePopover />}
      </AnimatePresence>
      <AnimatePresence>
        {DeletePopoverState && <DeletePopover />}
      </AnimatePresence>
      <div
        ref={formRef}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl"
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="w-full max-w-3xl p-6 ">
            <div className="flex sm:flex-row items-center justify-between max-[640px]:justify-center max-sm:items-start gap-6">
              <div className="flex flex-col max-sm:flex-row max-sm:justify-start items-center sm:items-start max-sm:gap-3">
                <div className="flex flex-row max-[640px]:flex-col items-center gap-4">
                  <div
                    style={{ borderColor: myMessageTheme }}
                    className="w-32 h-32 rounded-full overflow-hidden border-2 shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <img
                      src={authUser?.user?.profilePic || defaultImage}
                      alt={`${authUser?.user?.fullName}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-2xl max-[640px]:pt-2 pt-10 font-semibold text-start">
                    {authUser?.user?.fullName}
                  </h2>
                </div>
              </div>
              <div>
                <Link to="/profile" className="max-[640px]:hidden">
                  <button
                    className="btn border-0 ring-0 hover:opacity-80 transition-all"
                    style={{
                      backgroundColor: myMessageTheme,
                      color: textColor,
                    }}
                  >
                    Edit profile
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-base-300 w-full max-w-2xl p-5 rounded-lg">
            <div className="flex flex-col">
              <div className="flex flex-col gap-5">
                {AccountData.map((data, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex flex-row items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{data.title}</h3>
                        <p>{data.value}</p>
                      </div>
                      {data.title === "Username" && (
                        <>
                          <div>
                            <button
                              onClick={OpenUsernamePopover}
                              className={`btn rounded-xl border-0 ring-0 hover:opacity-80 transition-all bg-transparent`}
                            >
                              <Pencil />
                            </button>{" "}
                            <button
                              onClick={() => {
                                copy(data.value);
                                SuccesToast("Copied to clipboard");
                              }}
                              className={`btn rounded-xl border-0 ring-0 hover:opacity-80 transition-all bg-transparent`}
                            >
                              <Copy />
                            </button>
                          </div>
                        </>
                      )}
                      {data.title === "Email" && (
                        <button
                          onClick={() => setShowEmail(!ShowEmail)}
                          className={`btn rounded-xl border-0 ring-0 hover:opacity-80 transition-all`}
                          style={{
                            backgroundColor: myMessageTheme,
                            color: textColor,
                          }}
                        >
                          {ShowEmail ? `Hiding in ${timer}...` : "Show"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-start w-full max-w-2xl space-y-3">
            <div>
              <h2 className="text-xl font-semibold">
                Password and Authentication
              </h2>
            </div>
            <div className="w-full p-0.5">
              <button
                className="btn border-2 bg-transparent ring-0 hover:opacity-80 transition-all"
                style={{
                  borderColor: myMessageTheme,
                  color: getContrastingTextColor(
                    theme === "dark" ? "#0A0A17" : "#F8F8FF"
                  ),
                }}
                onClick={() => {
                  UpdatePassword({ email: authUser?.user?.email });
                }}
              >
                {isUpdatingPassword ? (
                  <SendLoader color={myMessageTheme} />
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>
          <div className="text-start w-full max-w-2xl space-y-3">
            <div>
              <h2 className="text-xl text-very-caution font-semibold">
                Danger Zone
              </h2>
            </div>
            <div className="w-full border-2 border-very-caution rounded-lg p-3 flex flex-col gap-3 p-0.5">
              <div className="flex flex-row gap-2 items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Disable Account</h3>
                  <p className="text-base-content/60">
                    this will disable your account , but its resorable anytime
                  </p>
                </div>
                <div>
                  <button
                    className="btn bg-caution ring-0 hover:opacity-80 transition-all"
                    style={{
                      color: getContrastingTextColor("#E25E60"),
                    }}
                    onClick={OpenDisablePopover}
                  >
                    Disable
                  </button>
                </div>
              </div>
              <div className="flex flex-row gap-2 items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Delete Account</h3>
                  <p className="text-base-content/60">
                    this will Permanently delete your account
                  </p>
                </div>
                <div>
                  <button
                    className="btn bg-very-caution ring-0 hover:opacity-80 transition-all"
                    style={{
                      color: getContrastingTextColor("#BB0C0F"),
                    }}
                    onClick={OpenDeletePopover}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-2xl items-center justify-end flex gap-3 p-0.5">
            <button
              className="btn bg-very-caution flex flex-row items-center ring-0 hover:opacity-80 transition-all"
              style={{
                color: getContrastingTextColor("#BB0C0F"),
              }}
              onClick={OpenLogoutPopover}
            >
              Log out <LogOutIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
