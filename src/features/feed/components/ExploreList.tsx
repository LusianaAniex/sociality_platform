'use client';

import { useExploreFeed } from '../hooks/useExploreFeed';
import { PostCard } from '@/features/post/components/PostCard';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export const ExploreList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useExploreFeed();

  // Setup infinite scroll trigger
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Handle loading state
  if (status === 'pending') {
    return <div className='text-center p-10'>Loading explore feed...</div>;
  }

  // Handle error state
  if (status === 'error') {
    return (
      <div className='text-center p-10 text-red-500'>
        Error: {(error as Error).message}. <br />
        Please try logging in again.
      </div>
    );
  }

  // Debug: Log the data structure in detail
  console.log('Number of pages:', data?.pages.length);
  console.log('First page object:', data?.pages[0]);
  console.log(
    'First page keys:',
    data?.pages[0] ? Object.keys(data.pages[0]) : 'no data'
  );

  // Flatten pages into single list
  const posts =
    data?.pages
      .flatMap((page) => {
        const items = page.items || [];
        console.log('Processing page, found items:', items);
        return items;
      })
      .filter(Boolean) || [];

  // Debug: Log the data structure
  console.log('Explore data structure:', data);
  console.log('Filtered posts:', posts);

  if (posts.length === 0) {
    return (
      <div className='text-center py-20 bg-neutral-900 rounded-lg border border-neutral-800'>
        <h3 className='text-lg font-medium'>No posts yet!</h3>
        <p className='text-neutral-400'>Be the first to create a post.</p>
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
