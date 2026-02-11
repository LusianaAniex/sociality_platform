'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current page is an auth page
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // If it's an auth page, render children directly without navigation
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Otherwise, render with navigation and main wrapper
  return (
    <>
      {/* TOP NAVIGATION */}
      <TopNav />

      {/* MAIN CONTENT AREA */}
      {/* pt-20 pushes content below TopNav, pb-28 pushes content above BottomNav */}
      <main className='flex-1 pt-20 pb-28 w-full'>{children}</main>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </>
  );
}
