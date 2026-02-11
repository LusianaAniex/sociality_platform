'use client';

import { useFeed } from '../hooks/useFeed'; // Import our new hook
import { PostCard } from '@/features/post/components/PostCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // Spinner icon
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer'; // installed this for auto-scroll

export const FeedList = () => {
  // 1. Use the Hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useFeed();

  // 2. Setup "Infinite Scroll" trigger
  // When this invisible element (ref) comes into view, load more!
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // 3. Handle States
  if (status === 'pending') {
    return <div className='text-center p-10'>Loading your feed...</div>;
  }

  if (status === 'error') {
    return (
      <div className='text-center p-10 text-red-500'>
        Error: {(error as Error).message}. <br />
        Please try logging in again.
      </div>
    );
  }

  // 4. Flatten the pages (Page 1 + Page 2 + ...) into one list
  const posts = data?.pages.flatMap((page) => page.items) || [];

  if (posts.length === 0) {
    return (
      <div className='text-center py-20 bg-white rounded-lg border'>
        <h3 className='text-lg font-medium'>No posts yet!</h3>
        <p className='text-gray-500'>Follow some users to see their updates.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 pb-20'>
      {/* Render Posts */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Loading Indicator at bottom */}
      <div ref={ref} className='flex justify-center p-4'>
        {isFetchingNextPage && <Loader2 className='animate-spin' />}
      </div>
    </div>
  );
};
