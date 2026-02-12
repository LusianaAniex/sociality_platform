'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { FeedExploreNav } from '@/components/layout/FeedExploreNav';

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

      {/* FEED/EXPLORE NAVIGATION - Below TopNav */}
      <div className='fixed top-16 left-0 right-0 z-40 bg-base-black border-b border-neutral-900'>
        <FeedExploreNav />
      </div>

      {/* MAIN CONTENT AREA with Dark Purple Gradient Background */}
      {/* Responsive container: px-4 on mobile → px-[105px] at 1440px */}
      <main className='flex-1 pt-32 pb-28 w-full min-h-screen bg-linear-to-r from-purple-950/20 via-base-black to-base-black'>
        <div className='w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[105px]'>
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
    </>
  );
}
