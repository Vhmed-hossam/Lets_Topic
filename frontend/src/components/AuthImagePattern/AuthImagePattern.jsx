import { useGSAP } from "@gsap/react";
import React, { useRef } from "react";
import gsap from "gsap";
export default function AuthImagePattern({ title, subtitle }) {
  const formRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, duration: 1, ease: "power4.out", y: 0 }
    );
  });
  return (
    <div className="hidden lg:flex items-center justify-center p-12">
      <div className="max-w-md text-center" ref={formRef}>
        <div className="grid w-auto grid-cols-3 gap-3 mb-3">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl ${
                i === 4 ? "bg-main/50" : "bg-second/50"
              } ${i % 2 === 0 ? "animate-pulse" : ""}`}
            ></div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
}