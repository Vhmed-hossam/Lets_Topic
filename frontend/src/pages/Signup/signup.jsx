import React, { useState, useRef } from "react";
import { EyeClosed, KeyRound, Mail, User } from "lucide-react";
import { Eye } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFormik } from "formik";
import * as Yup from "yup";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../../components/AuthImagePattern/AuthImagePattern";
import Loader from "../../components/Spinner/signinloader";
import { ErrorToast } from "../../components/Toast/Toasters";

export default function Signup() {
  const [ShowPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const { isSigningUp, Signup } = useAuthStore();
  const formRef = useRef(null);
  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
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
        fullName: "",
        email: "",
        password: "",
      },
      validationSchema,
      onSubmit: () => {
        Signup(values);
      },
    });
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        <div
          className="flex flex-col justify-center items-center p-6 lg:p-12"
          ref={formRef}
        >
          <div className="size-20 rounded-xl p-2 bg-main/25 mb-3 flex items-center justify-center hover:bg-second/25 transition">
            <img src="/Let's Topic mlogo.png" alt="Let's Topic" />
          </div>
          <form
            className="w-full max-w-lg p-2 rounded-lg space-y-6"
            onSubmit={handleSubmit}
          >
            <h2 className="text-3xl font-semibold text-center">Sign Up</h2>
            <div className="relative space-y-2">
              <User className="absolute left-4 top-4 text-gray-500" />
              <input
                name="fullName"
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className={`w-full p-4 pl-12 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.fullName && touched.fullName
                    ? "border-caution focus:ring-caution "
                    : "border-main focus:ring-main"
                }`}
                onChange={handleChange}
                value={values.fullName}
                onBlur={handleBlur}
              />
              {errors.fullName && touched.fullName && (
                <p className="text-caution text-sm">{errors.fullName}</p>
              )}
            </div>
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
                    : "border-main focus:ring-main"
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
                    : "border-main focus:ring-main"
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
              className={`w-full bg-main
                 hover:bg-main/75 text-white py-4 
                 rounded-lg hover:bg-main-dark transition ${
                   isSigningUp
                     ? "opacity-50 cursor-not-allowed border border-main"
                     : ""
                 }`}
              type="submit"
              disabled={isSigningUp}
            >
              {isSigningUp ? <Loader /> : "Sign Up"}
            </button>
          </form>
          <div className="text-center mt-4">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-second hover:text-second/75 transition"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center p-12">
          <AuthImagePattern
            title={"Welcome to Let's Topic"}
            subtitle={"Sign up to get started"}
          />
        </div>
      </div>
    </>
  );
}
