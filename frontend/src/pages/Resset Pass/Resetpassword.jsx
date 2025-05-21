import React, { useRef, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import AuthImagePattern from "../../components/AuthImagePattern/AuthImagePattern";
import MainHeader from "../../components/Header/header";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Resetpassword() {
  // for users who forgot their password
  const [code, setCode] = useState("");
  const [NewPassword, setNewPassword] = useState("");
  const { ResetPassword, isResettingPass } = useAuthStore();
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
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div
          ref={formRef}
          className="flex flex-col text-center justify-center items-center min-h-screen px-6 md:px-24 gap-6"
        >
          <MainHeader
            title={"Reset your Password"}
            subtitle={"fill out these data to change your password"}
          />
          <input
            type="text"
            className="w-full max-w-md p-4 pl-5 rounded-lg border border-main focus:ring-2 focus:outline-none focus:ring-main text-sm shadow-sm"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            type="text"
            className="w-full max-w-md p-4 pl-5 rounded-lg border border-main focus:ring-2 focus:outline-none focus:ring-main text-sm shadow-sm"
            placeholder="Enter Your new password"
            value={NewPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="hidden lg:flex items-center justify-center p-12">
          <AuthImagePattern
            title={"Reset your Password"}
            subtitle={
              "Enter the code sent to your email to verify and reset your password."
            }
          />
        </div>
      </div>
    </>
  );
}
