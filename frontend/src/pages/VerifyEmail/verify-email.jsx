import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Spinner from "../../components/Spinner/spinner";
import AuthImagePattern from "../../components/AuthImagePattern/AuthImagePattern";
import SmallLoader from "../../components/Spinner/smallloader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
export default function VerifyEmail() {
  const formRef = useRef();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyEmail({ email, code });
      navigate("/");
    } catch (error) {
      console.error("VerifyEmail error:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <Spinner />;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div
        className="flex flex-col justify-center items-center min-h-screen px-6 md:px-24 gap-6"
        ref={formRef}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="size-20 rounded-xl p-2 bg-second/25 flex items-center justify-center hover:bg-main/25 transition-all shadow-md">
            <img
              src="/Let's Topic mlogo.png"
              alt="Let's Topic"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold  px-4 py-2 rounded-lg shadow">
            Email Verification
          </h1>
          <p className="text-sm text-base-content/70 ">
            Enter the code sent to your email
          </p>
        </div>
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
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col w-full max-w-md items-center justify-between md:flex-row gap-4 mt-4">
          <button
            className="bg-main w-full text-white hover:bg-main/85 transition-all px-6 py-2 rounded-lg disabled:bg-main/50 disabled:cursor-not-allowed"
            onClick={handleVerify}
            disabled={loading || !email.trim() || !code.trim()}
          >
            {loading ? <SmallLoader /> : "Verify"}
          </button>
        </div>
        <Link to="/login" className="text-caution">
          Go to login
        </Link>
      </div>
      <div className="hidden lg:flex items-center justify-center p-12">
        <AuthImagePattern
          title={"Verify Your Email"}
          subtitle={"Enter the code sent to your email to verify your account."}
        />
      </div>
    </div>
  );
}
