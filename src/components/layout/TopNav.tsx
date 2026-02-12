'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TopNav = () => {
  const pathname = usePathname();

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

      {/* 2. RIGHT SIDE: Search Icon & User Profile */}
      <div className='flex items-center gap-4'>
        {/* Search Icon */}
        <button className='hover:text-base-white transition-colors'>
          <Search className='w-5 h-5 text-neutral-400' />
        </button>

        {/* User Profile Snippet */}
        <Link href='/profile' className='flex items-center gap-3 group'>
          <Avatar className='w-8 h-8 border border-neutral-800'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback className='bg-neutral-800 text-base-white'>
              AN
            </AvatarFallback>
          </Avatar>
          <span className='hidden md:block text-body-sm font-semibold text-base-white group-hover:text-primary-200 transition-colors'>
            Aniex
          </span>
        </Link>
      </div>
    </header>
  );
};
