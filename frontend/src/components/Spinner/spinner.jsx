import React from "react";

export default function Spinner() {
  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <img
          src=" /Let's Topic mlogo.png"
          alt="Loading..."
          className="animate-spin h-24 w-24"
        />
      </div>
    </>
  );
}
