'use client';

import Link from 'next/link';
import { Home, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const FeedExploreNav = () => {
  const pathname = usePathname();

  return (
    <nav className='w-full bg-transparent py-4'>
      <div className='flex items-center justify-center gap-1'>
        <Link
          href='/'
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-medium text-sm ${
            pathname === '/'
              ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Home className='w-4 h-4' />
          <span>Feed</span>
        </Link>

        <Link
          href='/explore'
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-medium text-sm ${
            pathname === '/explore'
              ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Compass className='w-4 h-4' />
          <span>Explore</span>
        </Link>
      </div>
    </nav>
  );
};
