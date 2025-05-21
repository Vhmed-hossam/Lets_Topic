import React from "react";
import { useSettingStore } from "../../store/useSettingsStore";

export default function NotificationSkeleton() {
  const { myMessageTheme } = useSettingStore();
  return (
    <div className="container mx-auto min-h-screen p-6">
      <div className="flex space-y-3 flex-col items-start justify-start mt-16">
        <div
          className="py-3 w-full flex-1 border-b mb-3 border-second relative"
          style={{ borderColor: myMessageTheme }}
        >
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-2xl font-bold h-12 w-36.5 animate-pulse skeleton"></h2>
            <button className="p-2  skeleton animate-pulse transition-all rounded-full w-10 h-10">
              <span className="w-5 h-5 rounded-pill" />
            </button>
          </div>
        </div>
        {[...Array(3)].map((_, idx) => (
          <div
            className="shadow-md bg-main/5 skeleton rounded-lg p-6 w-full max-w-2xl mx-auto"
            key={idx}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full animate-pulse skeleton"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-32 animate-pulse rounded skeleton"></div>
                  <div className="h-4 w-16 animate-pulse rounded skeleton"></div>
                </div>
                <div className="h-4 w-24 animate-pulse rounded mt-2 skeleton"></div>
                <div className="h-5 w-full animate-pulse rounded mt-4 skeleton"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
