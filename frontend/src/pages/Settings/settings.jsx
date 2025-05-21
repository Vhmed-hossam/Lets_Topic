import React, { useEffect, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SettingsData } from "../../Data/SettingsData";
import capitalizeFirstLetter from "../../helpers/capitalizeFirstLetter";
import { useSettingStore } from "../../store/useSettingsStore";
import { defaultImage } from "../../Data/Avatars";
import { ErrorToast } from "../../components/Toast/Toasters";

export default function Settings() {
  const { pathname } = useLocation();
  const { authUser, checkAuth } = useAuthStore();
  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  const Authcheck = async () => {
    try {
      await checkAuth();
    } catch (error) {
      console.error("CheckAuth error:", error);
      ErrorToast(error.response?.data?.error || "Failed to check authentication");
    }
  };
  useEffect(() => {
    Authcheck()
  }, []);

  const { myMessageTheme } = useSettingStore();
  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="pt-10 flex-1">
          {pathname == "/settings" ? (
            <>
              <div className=" grid place-content-center" ref={formRef}>
                <div className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="p-3">
                      <div className="flex items-center flex-col justify-center">
                        <img
                          src={authUser.user.profilePic || defaultImage}
                          alt="Let's Topic"
                          className="size-50 text-center rounded-full object-cover grid place-items-center"
                        />
                        <h2 className="text-xl font-bold text-center mt-2">
                          {authUser.user.fullName}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 w-full gap-8 text-center grid sm:grid-cols-2 md:grid-cols-3">
                  {SettingsData.map((data) => {
                    return (
                      <Link to={`/${data.title}`} key={data.id}>
                        <div
                          key={data.id}
                          className="p-3 w-full bg-transparent border-2 border-second text-second font-bold flex flex-col items-center rounded-md overflow-hidden hover:bg-second hover:text-white transition-all"
                        >
                          {data.icon}
                          <h2 className="text-lg">{data.name}</h2>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col" ref={formRef}>
                <div className="p-3">
                  <div
                    className="p-2 border-b border-second"
                    style={{ borderColor: myMessageTheme }}
                  >
                    <div className="flex items-center justify-center pb-1">
                      <h2 className="text-xl font-bold">
                        {capitalizeFirstLetter(pathname.split("/")[2])}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
              <Outlet />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
