"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { NAV_ITEMS } from "./constants";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    // 1. Clear Redux state and LocalStorage
    dispatch(logout());
    // 2. Redirect to login page
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-white fixed left-0 top-0 z-30">
      {/* Logo Area */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">Sociality</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button at the bottom */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};