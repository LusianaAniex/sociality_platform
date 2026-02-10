"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();

  // List of public routes where we DO NOT want to show the Sidebar/Nav
  // e.g., Login and Register pages should be full screen
  const isPublicRoute = ["/login", "/register"].includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <Sidebar />

      {/* Main Content Area */}
      {/* md:pl-64 adds padding-left on desktop to make room for the sidebar */}
      {/* pb-20 adds padding-bottom on mobile to make room for bottom nav */}
      <main className="md:pl-64 pb-20 pt-4 px-4 max-w-4xl mx-auto">
        {children}
      </main>

      {/* Mobile Navigation - Hidden on Desktop */}
      <MobileNav />
    </div>
  );
};