import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/features/profile/types';

interface SearchResultsListProps {
  results: UserProfile[];
  isLoading: boolean;
  query: string;
  onSelect?: () => void;
}

export const SearchResultsList = ({
  results,
  isLoading,
  query,
  onSelect,
}: SearchResultsListProps) => {
  if (query && results.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <p className='text-base font-semibold text-white'>No results found</p>
        <p className='text-sm text-neutral-500 mt-1'>Change your keyword</p>
      </div>
    );
  }

  if (!query) return null;

  return (
    <div className='flex flex-col py-2'>
      {results.map((user) => (
        <Link
          key={user.id}
          href={`/users/${user.username}`}
          onClick={onSelect}
          className='flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 transition-colors'
        >
          <Avatar className='w-10 h-10 border border-neutral-800'>
            <AvatarImage
              src={
                user.avatar || user.avatarUrl || 'https://github.com/shadcn.png'
              }
              alt={user.username}
            />
            <AvatarFallback className='bg-neutral-800 text-white'>
              {user.username?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold text-white'>
              {user.fullName || user.username}
            </span>
            <span className='text-xs text-neutral-400'>@{user.username}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};
