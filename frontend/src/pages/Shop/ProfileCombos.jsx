import React, { useRef, useState } from "react";
import { Banners } from "../../Data/Banners";
import { useAuthStore } from "../../store/useAuthStore";
import Spinner from "../../components/Spinner/spinner";
import { fetchImageAsBase64 } from "../../helpers/fetchImage64";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Avatars } from "../../Data/Avatars";
import { useSettingStore } from "../../store/useSettingsStore";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { CharThemes } from "../../Data/ChatThemes";
import { SuccesToast } from "../../components/Toast/Toasters";
import getContrastingTextColor from "../../helpers/GetContrast";

export default function Shop() {
  const [updatingIndex, setUpdatingIndex] = useState(null);
  const [IsUpdatingBanner, setIsUpdatingBanner] = useState(false);
  const [IsUpdatingProfilePic, setIsUpdatingProfilePic] = useState(false);

  const { UpdateProfile, AddBanner } = useAuthStore();
  const {
    SetMyMessageTheme,
    SetMySenderTheme,
    SetMySendSound,
    SetMyReceiveSound,
    myMessageTheme,
  } = useSettingStore();
  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  const handleBannerChange = async (input) => {
    let imageToUse = "";

    if (typeof input === "string") {
      imageToUse = await fetchImageAsBase64(input);
      try {
        await AddBanner({ banner: imageToUse });
      } catch (error) {
        console.error("Error updating banner:", error);
      }
    } else {
      const file = input.target.files[0];
      if (!file) return ErrorToast("No file selected");
      if (!file.type.startsWith("image/"))
        return ErrorToast("Invalid file type. Please upload an image.");

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        try {
          await AddBanner({ banner: base64Image });
        } catch (error) {
          console.error("Error updating banner:", error);
        }
      };
    }
  };

  const handleProfilePicChange = async (input) => {
    let imageToUse = "";

    if (typeof input === "string") {
      imageToUse = await fetchImageAsBase64(input);
    } else {
      const file = input.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/"))
        return ErrorToast("Invalid file type. Please upload an image.");

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        try {
          await UpdateProfile({ profilePic: base64Image });
        } catch (error) {
          console.error("Error updating profile picture:", error);
        }
      };
      return;
    }

    try {
      await UpdateProfile({ profilePic: imageToUse });
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };
  return (
    <>
      <div
        className="overflow-hidden container mx-auto p-8 min-h-screen"
        ref={formRef}
      >
        <div
          className="py-3 mt-8 flex-1 border-b mb-3 border-second relative"
          style={{ borderColor: myMessageTheme }}
        >
          <div className="flex flex-row items-center justify-center">
            <h2 className="text-2xl font-bold">Shop</h2>
            <div className="flex flex-row gap-4 items-center"></div>
          </div>
        </div>
        <div className="flex flex-col">
          <section className="mt-4 flex flex-col gap-2">
            <h2 className="text-lg font-medium">Avatars</h2>
            <Splide
              options={{
                type: "loop",
                drag: "free",
                focus: "center",
                gap: "3rem",
                perPage: 2,
                autoScroll: {
                  speed: 2,
                },
              }}
            >
              {Avatars.map((avatar, index) => (
                <SplideSlide
                  key={index}
                  className="flex flex-col gap-3 bg-main/25 p-4 rounded-xl overflow-hidden"
                >
                  {" "}
                  <h2 className="text-lg font-medium">
                    {index + 1} : {avatar.name} Avatar
                  </h2>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img
                        src={avatar.url}
                        alt={`Avatar ${index}`}
                        className="size-32 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <button
                    className="btn bg-main"
                    onClick={() => {
                      handleProfilePicChange(avatar.url);
                    }}
                  >
                    Use Avatar
                  </button>
                  {updatingIndex === index && (
                    <div className="bg-black/50 flex items-center justify-center absolute top-0 bottom-0 left-0 right-0">
                      <Spinner />
                    </div>
                  )}
                </SplideSlide>
              ))}
            </Splide>
          </section>
          <section className="mt-4 flex flex-col gap-2">
            <h2 className="text-lg font-medium">Banners</h2>
            <Splide
              options={{
                type: "loop",
                drag: "free",
                focus: "center",
                gap: "3rem",
                perPage: 2,
                autoScroll: {
                  speed: 2,
                },
              }}
            >
              {Banners.map((Banners, index) => (
                <SplideSlide
                  key={index}
                  className="flex flex-col gap-3 bg-main/25 p-4 rounded-xl overflow-hidden"
                >
                  <h2 className="text-lg font-medium">
                    {index + 1} : {Banners.name} Banner
                  </h2>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3">
                      <img
                        src={Banners.url}
                        alt={`Banners ${index}`}
                        className="rounded-md object-cover"
                      />
                    </div>
                  </div>
                  <button
                    className="btn bg-main"
                    onClick={() => {
                      handleBannerChange(Banners.url);
                    }}
                  >
                    Use Banner
                  </button>
                  {updatingIndex === index && (
                    <div className="bg-black/50 flex items-center justify-center absolute top-0 bottom-0 left-0 right-0">
                      <Spinner />
                    </div>
                  )}
                </SplideSlide>
              ))}
            </Splide>
          </section>
          <section className="mt-4 flex flex-col gap-2">
            <h2 className="text-lg font-medium">Chat Themes</h2>
            <Splide
              options={{
                type: "loop",
                drag: "free",
                focus: "center",
                gap: "2rem",
                perPage: 2,
                autoScroll: {
                  speed: 2,
                },
              }}
            >
              {CharThemes.map((themes, index) => (
                <SplideSlide
                  key={index}
                  className="flex flex-col gap-3 bg-main/25 p-4 rounded-xl overflow-hidden"
                >
                  <h2 className="text-lg font-medium">
                    {index + 1} : {themes.name} Theme
                  </h2>
                  <div className="chat flex flex-col p-2 space-y-3">
                    <div className="flex flex-row items-center justify-start">
                      <div
                        className="chat-bubble"
                        style={{ backgroundColor: themes.SenderTheme ,color: getContrastingTextColor(themes.SenderTheme) }}
                      >
                        <div className="p-3">
                          <h2>This is my Sender Theme</h2>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-end">
                      <div
                        className="chat-bubble"
                        style={{ backgroundColor: themes.myTheme,color: getContrastingTextColor(themes.myTheme) }}

                      >
                        <div className="p-3">
                          <h2>This is my Theme</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn bg-main"
                    onClick={() => {
                      SetMyMessageTheme(themes.myTheme);
                      SetMySenderTheme(themes.SenderTheme);
                      SuccesToast("Theme changed successfully");
                    }}
                  >
                    Use Theme
                  </button>
                </SplideSlide>
              ))}
            </Splide>
          </section>
        </div>
      </div>
    </>
  );
}
