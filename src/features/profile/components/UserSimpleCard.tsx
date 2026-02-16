'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/features/profile/types';
import { FollowButton } from './FollowButton';
import { useAppSelector } from '@/hooks/useRedux';

interface UserSimpleCardProps {
  user: UserProfile;
  bgConfig?: {
    hover?: string;
  };
}

export function UserSimpleCard({ user, bgConfig }: UserSimpleCardProps) {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const isSelf =
    currentUser?.id === user.id || currentUser?.username === user.username;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${bgConfig?.hover || 'hover:bg-neutral-900/50'}`}
    >
      <Link
        href={`/users/${user.username}`}
        className='flex items-center gap-3 flex-1 min-w-0'
      >
        <Avatar className='w-10 h-10 border border-neutral-800'>
          <AvatarImage
            src={
              user.avatar ||
              user.avatarUrl ||
              user.profilePicture ||
              'https://github.com/shadcn.png'
            }
            alt={user.username}
          />
          <AvatarFallback className='bg-neutral-800 text-white'>
            {user.username?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className='flex flex-col min-w-0'>
          <span className='text-sm font-semibold text-white truncate'>
            {user.name || user.fullName || user.username}
          </span>
          <span className='text-xs text-neutral-400 truncate'>
            @{user.username}
          </span>
        </div>
      </Link>

      {!isSelf && (
        <div className='ml-2'>
          <FollowButton
            userId={user.id}
            username={user.username}
            initialIsFollowing={user.isFollowing ?? false}
            className='h-8 px-3 text-xs'
          />
        </div>
      )}
    </div>
  );
}
