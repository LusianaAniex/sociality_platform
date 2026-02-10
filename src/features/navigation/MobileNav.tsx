"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./constants";

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 p-2 ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};