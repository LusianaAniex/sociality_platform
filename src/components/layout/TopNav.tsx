import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TopNav = () => {
  return (
    <header className='fixed top-0 left-0 right-0 h-16 bg-base-black border-b border-neutral-900 z-50 px-4 md:px-8 flex items-center justify-between'>
      {/* 1. LOGO */}
      <Link href='/' className='flex items-center gap-2'>
        <Image
          src='/logo.svg'
          alt='Sociality Logo'
          width={24}
          height={24}
          className='w-6 h-6'
        />
        <span className='text-display-xs font-bold text-base-white tracking-tight'>
          Sociality
        </span>
      </Link>

      {/* 2. SEARCH BAR (Hidden on mobile, visible on desktop) */}
      <div className='hidden md:flex items-center relative w-full max-w-md'>
        <Search className='w-4 h-4 absolute left-4 text-neutral-400' />
        <input
          type='text'
          placeholder='Search'
          className='w-full bg-neutral-900 text-body-sm text-base-white rounded-full py-2.5 pl-10 pr-4 outline-none border border-neutral-800 focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-all placeholder:text-neutral-500'
        />
      </div>

      {/* 3. RIGHT SIDE: Mobile Search Icon & User Profile */}
      <div className='flex items-center gap-4'>
        {/* Mobile Search Icon */}
        <button className='md:hidden'>
          <Search className='w-5 h-5 text-neutral-400 hover:text-base-white transition-colors' />
        </button>

        {/* User Profile Snippet */}
        <Link href='/profile' className='flex items-center gap-3 group'>
          <Avatar className='w-8 h-8 border border-neutral-800'>
            {/* Update src with actual user data later! */}
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback className='bg-neutral-800 text-base-white'>
              JD
            </AvatarFallback>
          </Avatar>
          <span className='hidden md:block text-body-sm font-semibold text-base-white group-hover:text-primary-200 transition-colors'>
            John Doe
          </span>
        </Link>
      </div>
    </header>
  );
};
