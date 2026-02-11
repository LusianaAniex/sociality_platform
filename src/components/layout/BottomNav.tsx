"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, User } from "lucide-react";

export const BottomNav = () => {
  // We use this to know which page is currently active so we can color the icon purple
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[320px]">
      <div className="bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        
        {/* HOME BUTTON */}
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === "/" ? "text-primary-200" : "text-neutral-500 hover:text-base-white"
          }`}
        >
          <Home className={`w-5 h-5 ${pathname === "/" ? "fill-primary-200" : ""}`} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* CREATE POST (+) BUTTON */}
        <Link 
          href="/create" 
          className="bg-primary-200 hover:bg-primary-300 text-base-white rounded-full p-3 transition-transform active:scale-95 shadow-[0_0_15px_rgba(127,81,249,0.4)]"
        >
          <Plus className="w-6 h-6" />
        </Link>

        {/* PROFILE BUTTON */}
        <Link 
          href="/profile" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === "/profile" ? "text-primary-200" : "text-neutral-500 hover:text-base-white"
          }`}
        >
          <User className={`w-5 h-5 ${pathname === "/profile" ? "fill-primary-200" : ""}`} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>

      </div>
    </div>
  );
};