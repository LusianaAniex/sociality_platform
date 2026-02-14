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
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Handle loading state
  if (status === 'pending') {
    return (
      <div className='flex justify-center items-center p-10'>
        <Loader2 className='animate-spin h-8 w-8' />
        <span className='ml-2'>Loading explore feed...</span>
      </div>
    );
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

  // Debug: Log the actual data structure to see what we're getting
  console.log('Full data object:', data);
  console.log('Pages:', data?.pages);

  // Try different ways to access the posts based on common API response structures
  const posts =
    data?.pages
      .flatMap((page) => {
        // Check for different possible data structures
        if (page?.items) {
          console.log('Found items array:', page.items);
          return page.items;
        } else if ((page as any)?.posts) {
          console.log('Found posts array:', (page as any).posts);
          return (page as any).posts;
        } else if (Array.isArray(page)) {
          console.log('Page is an array:', page);
          return page;
        } else if ((page as any)?.data) {
          console.log('Found data array:', (page as any).data);
          return (page as any).data;
        } else if ((page as any)?.results) {
          console.log('Found results array:', (page as any).results);
          return (page as any).results;
        } else {
          // If none of the above, log the page structure to help debug
          console.log('Unknown page structure:', page);
          return [];
        }
      })
      .filter((post) => post && post.id) || []; // Ensure we have valid posts with IDs

  console.log('Final posts array:', posts);

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
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} priority={index === 0} />
      ))}

      {/* Loading Indicator at bottom */}
      {hasNextPage && (
        <div ref={ref} className='flex justify-center p-4'>
          {isFetchingNextPage && <Loader2 className='animate-spin' />}
        </div>
      )}
    </div>
  );
};
