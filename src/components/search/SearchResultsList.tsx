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
  // Always render the container, even if empty
  return (
    <div className='px-4 py-6 min-h-[200px]'>
      {/* Loading State */}
      {isLoading && (
        <div className='flex justify-center items-center pt-8'>
          <Loader2 className='w-6 h-6 text-neutral-400 animate-spin' />
        </div>
      )}

      {/* Has Query but No Results */}
      {!isLoading && query && results.length === 0 && (
        <>
          <h2 className='text-white text-lg font-semibold mb-4'>Not Found</h2>
          <div className='space-y-2'>
            <p className='text-white text-sm'>{query}</p>
            <p className='text-neutral-400 text-sm'>No results found</p>
            <p className='text-neutral-400 text-sm'>Change your keyword</p>
          </div>
        </>
      )}

      {/* Has Results */}
      {!isLoading && results.length > 0 && (
        <>
          <h2 className='text-white text-lg font-semibold mb-4'>Found</h2>
          <div className='space-y-1'>
            {results.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.username}`}
                onClick={onSelect}
                className='flex items-center gap-3 px-2 py-3 hover:bg-neutral-800 rounded-lg transition-colors'
              >
                <Avatar className='w-10 h-10 border border-neutral-800'>
                  <AvatarImage
                    src={
                      user.avatar ||
                      user.avatarUrl ||
                      'https://github.com/shadcn.png'
                    }
                    alt={user.username}
                    loading='eager'
                  />
                  <AvatarFallback className='bg-neutral-800 text-white'>
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-white'>
                    {user.fullName || user.name || user.username}
                  </span>
                  <span className='text-xs text-neutral-400'>
                    @{user.username}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* No Query - Show empty state or recent searches */}
      {!isLoading && !query && (
        <div className='text-neutral-400 text-sm text-center pt-8'>
          Start typing to search for users
        </div>
      )}
    </div>
  );
};
