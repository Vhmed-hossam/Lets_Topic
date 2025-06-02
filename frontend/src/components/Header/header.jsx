import React from "react";

export default function header({ title , subtitle}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="size-20 rounded-xl p-2 bg-second/25 flex items-center justify-center hover:bg-main/25 transition-all shadow-md">
        <img
          src="/Images/Let's Topic mlogo.png"
          alt="Let's Topic"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <h1 className="text-xl font-semibold  px-4 py-2 rounded-lg shadow">
        {title}
      </h1>
      <p className="text-sm text-base-content/70">
        {subtitle}
      </p>
    </div>
  );
}
