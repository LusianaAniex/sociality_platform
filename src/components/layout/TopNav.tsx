'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logout } from '@/store/authSlice';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const TopNav = () => {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const [isMounted, setIsMounted] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

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
        {isMounted && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-3 group outline-none'>
                <Avatar className='w-8 h-8 border border-neutral-800'>
                  <AvatarImage
                    src={user.avatar || 'https://github.com/shadcn.png'}
                  />
                  <AvatarFallback className='bg-neutral-800 text-base-white'>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className='hidden md:block text-body-sm font-semibold text-base-white group-hover:text-primary-200 transition-colors'>
                  {user.username}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-56 bg-neutral-900 border-neutral-800 text-white'
            >
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {user.username}
                  </p>
                  <p className='text-xs leading-none text-neutral-400'>
                    @{user.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-neutral-800' />
              <DropdownMenuItem
                className='cursor-pointer focus:bg-neutral-800 focus:text-white'
                onClick={() => router.push(`/users/${user.username}`)}
              >
                <UserIcon className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500'
                onClick={handleLogout}
              >
                <LogOut className='mr-2 h-4 w-4' />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href='/login'
            className='text-body-sm font-semibold text-base-white hover:text-primary-200 transition-colors'
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
