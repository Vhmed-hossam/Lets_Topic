import React from "react";
export default function NonActive() {
  return (
    <>
      <div className="flex gap-3 items-center flex-col justify-center h-screen">
        <img
          src=" /Let's Topic mlogo.png"
          alt="Loading..."
          className="animate-spin h-24 w-24"
        />
        <h2 className="text-xl">Loading...</h2>
      </div>
    </>
  );
}
