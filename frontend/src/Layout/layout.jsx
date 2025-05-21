import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import DevSpace from "../Tasks/DevSpace";

export default function Layout() {
  useEffect(() => {
    DevSpace();
  }, []);
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}