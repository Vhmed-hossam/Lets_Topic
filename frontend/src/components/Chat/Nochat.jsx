import React from "react";
import { useSettingStore } from "../../store/useSettingsStore";
export default function Nochat() {
  const { myMessageTheme } = useSettingStore();
  return (
    <div className="w-full flex flex-col items-center h-full justify-center p-16">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="size-20 p-2 rounded-2xl flex items-center
           justify-center"
              style={{ background: myMessageTheme + "4a" }}
            >
              <img src="/Images/Let's Topic mlogo.png" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold">Welcome to Let's Topic!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
}
