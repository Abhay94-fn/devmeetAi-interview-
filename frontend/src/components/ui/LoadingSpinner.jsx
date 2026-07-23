import React from "react";

export default function LoadingSpinner() {
  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center space-y-4 select-none"
      style={{ backgroundColor: "#060612" }}
    >
      <div className="relative w-12 h-12">
        {/* Spinning Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div 
          className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#8B5CF6", borderTopColor: "transparent" }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-[10px]">
          D
        </span>
        <span className="text-white font-extrabold tracking-tight text-sm">
          DevMeet
        </span>
      </div>
    </div>
  );
}
