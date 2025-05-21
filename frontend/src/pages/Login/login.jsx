import React, { useState, useRef } from "react";
import {
  EyeClosed,
  KeyRound,
  Mail,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { Eye } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFormik } from "formik";
import * as Yup from "yup";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link, Navigate } from "react-router-dom";
import AuthImagePattern from "../../components/AuthImagePattern/AuthImagePattern";
import LoginLoader from "../../components/Spinner/loginLoader";
import { useSettingStore } from "../../store/useSettingsStore";
import { ErrorToast } from "../../components/Toast/Toasters";
import { AnimatePresence, motion } from "framer-motion";
import SigninLoader from "../../components/Spinner/signinloader";
import { usePopoversStore } from "../../store/usePopoversStore";
import RestorePopover from "../../components/Popovers/RestorePopover";
export default function Login() {
  const [ShowPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const { isLoggingIn, Login, restoreAccount, ForgetPassword, isRestoring } =
    useAuthStore();
  const formRef = useRef(null);
  const { theme } = useSettingStore();
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email")
      .required("Email is required")
      .trim()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format"
      ),
    password: Yup.string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required")
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  });

  const { values, handleChange, handleBlur, errors, touched, handleSubmit } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      validationSchema,
      onSubmit: async () => {
        const response = await Login(values);
        console.log(response);
        if (response?.data.user.deletionData?.Disabled) {
          OpenRestorePopover();
          return;
        }
        if (response?.data.user.deletionData?.Restorable) {
          OpenRestorePopover();
        }
      },
    });

  const { RestorePopoverState, OpenRestorePopover } = usePopoversStore();

  return (
    <>
      <AnimatePresence>
        {RestorePopoverState && <RestorePopover />}
      </AnimatePresence>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div
          className="flex flex-col justify-center items-center p-6 lg:p-12"
          ref={formRef}
        >
          <div className="size-20  rounded-xl p-2 bg-second/25 mb-3 flex items-center justify-center hover:bg-main/25 transition">
            <img src="/Let's Topic mlogo.png" alt="Let's Topic" />
          </div>
          <form
            className="w-full max-w-lg p-2 rounded-lg space-y-6"
            onSubmit={handleSubmit}
          >
            <h2 className="text-3xl font-semibold text-center">Log In</h2>
            <div className="relative space-y-2">
              <Mail className="absolute left-4 top-4 text-gray-500" />
              <input
                name="email"
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`w-full p-4 pl-12 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.email && touched.email
                    ? "border-caution focus:ring-caution"
                    : "border-second focus:ring-second"
                }`}
                onChange={handleChange}
                value={values.email}
                onBlur={handleBlur}
              />
              {errors.email && touched.email && (
                <p className="text-caution text-sm">{errors.email}</p>
              )}
            </div>
            <div className="relative space-y-2">
              <KeyRound className="absolute left-4 top-4 text-gray-500" />
              <input
                name="password"
                id="password"
                type={ShowPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full p-4 pl-12 border rounded-lg focus:ring-2 focus:outline-none select-none ${
                  errors.password && touched.password
                    ? "border-caution focus:ring-caution"
                    : "border-second focus:ring-second"
                }`}
                onChange={handleChange}
                value={values.password}
                onBlur={handleBlur}
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => {
                  e.preventDefault();
                  ErrorToast("You cannot paste text in this input.");
                }}
              />
              <button
                onClick={handleClickShowPassword}
                type="button"
                className="absolute right-4 top-4 text-gray-500"
              >
                {values.password.length > 0 &&
                  (ShowPassword ? (
                    <EyeClosed className="text-second" />
                  ) : (
                    <Eye className="text-second" />
                  ))}
              </button>
              {errors.password && touched.password && (
                <p className="text-caution text-sm">{errors.password}</p>
              )}
            </div>
            <button
              className={`w-full bg-second
                 hover:bg-second/75 text-white py-4 
                 rounded-lg cursor-pointer  transition ${
                   isLoggingIn
                     ? "opacity-50 cursor-not-allowed border border-second"
                     : ""
                 }`}
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? <LoginLoader /> : "Log In"}
            </button>
          </form>
          <button
            className="w-full max-w-lg px-3"
            onClick={() => {
              if (
                !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                  values.email.trim()
                )
              ) {
                ErrorToast("Please enter your email");
              }
            }}
          ></button>
          <div className="text-center mt-4">
            <p>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-second hover:text-second/75 transition"
              >
                Sign Up
              </Link>
            </p>
          </div>
          <Link to="/reset-password">
            <p className="text-second text-end mt-1.5">Forget your password?</p>
          </Link>
        </div>
        <div className="hidden lg:flex items-center justify-center p-12">
          <AuthImagePattern
            title={"Welcome to Let's Topic"}
            subtitle={
              "Log In to continue your conversations and catch up with your messages."
            }
          />
        </div>
      </div>
    </>
  );
}

