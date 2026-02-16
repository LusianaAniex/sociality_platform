import { PostCard } from '@/features/post/components/PostCard';
import { Loader2 } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { InfiniteData } from '@tanstack/react-query';
import { FeedResponse } from '@/features/feed/types';

interface FeedListProps {
  data: InfiniteData<FeedResponse> | undefined;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  status: 'pending' | 'error' | 'success';
  error: Error | null;
  title?: string;
  emptyMessage?: string;
}

export const FeedList = ({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status,
  error,
  title,
  emptyMessage = 'No posts yet!',
}: FeedListProps) => {
  if (status === 'pending') {
    return <div className='text-center p-10'>Loading...</div>;
  }

  if (status === 'error') {
    return (
      <div className='text-center p-10 text-red-500'>
        Error: {(error as Error).message}. <br />
        Please try logging in again.
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) || [];

  if (posts.length === 0) {
    return (
      <div className='text-center py-20 bg-neutral-900/50 rounded-lg border border-neutral-800'>
        <h3 className='text-lg font-medium text-white'>{emptyMessage}</h3>
        <p className='text-neutral-500 mt-2'>
          Check back later or follow more users.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 pb-20'>
      {title && <h2 className='text-xl font-bold text-white mb-2'>{title}</h2>}

      <Virtuoso
        useWindowScroll
        data={posts}
        endReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        itemContent={(index: number, post: FeedResponse['items'][0]) => (
          <div className='mb-6'>
            <PostCard post={post} priority={index === 0} />
          </div>
        )}
        components={{
          Footer: () => (
            <div className='flex justify-center p-4'>
              {isFetchingNextPage && (
                <Loader2 className='animate-spin text-white' />
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};
