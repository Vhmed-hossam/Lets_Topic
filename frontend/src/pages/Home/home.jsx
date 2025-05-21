import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import Sidebar from "../../components/SideBar/Sidebar";
import Nochat from "../../components/Chat/Nochat";
import Chat from "../../components/Chat/Chat";
import ProfilePopup from "../../components/Profile/profilepopup";
import MediaPopup from "../../components/Media/mediaPopup";

export default function Home() {
  const { SelectedUser, ProfileOpened, getChatMedia, MediaOpened } =
    useChatStore();
  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  useEffect(() => {
    if (SelectedUser?._id) {
      getChatMedia(SelectedUser._id);
    }
  }, [SelectedUser]);
  return (
    <div className="h-screen">
      <div className="flex items-center justify-center pt-6 px-4">
        <div className="rounded-lg shadow-cl w-full max-w-7xl h-[calc(100vh-8rem)] relative">
          <div className="flex h-full rounded-lg" ref={formRef}>
            <div
              className={`w-20 lg:w-72 max-[550px]:flex-1 ${
                SelectedUser ? "max-[550px]:hidden" : ""
              }`}
            >
              <Sidebar />
            </div>
            <div
              className={`mt-14 self-stretch flex-1 flex h-full ${
                !SelectedUser ? "max-[550px]:hidden" : ""
              }`}
            >
              {!SelectedUser ? <Nochat /> : <Chat />}
            </div>
          </div>
          <div
            className={`h-full overflow-hidden rounded-lg w-80 pb-0  top-5 lg:w-70 border-none right-0 z-50 absolute flex flex-col mt-10 max-[550px]:w-full ${
              !ProfileOpened && "hidden"
            }`}
          >
            {SelectedUser && ProfileOpened && <ProfilePopup />}
          </div>
          <div
            className={`h-full overflow-hidden rounded-lg w-95 pb-0  top-5 lg:w-70 border-none right-0 z-50 absolute flex flex-col mt-10 max-[550px]:w-full ${
              !MediaOpened && "hidden"
            }`}
          >
            {SelectedUser && MediaOpened && <MediaPopup />}
          </div>
        </div>
      </div>
    </div>
  );
}
