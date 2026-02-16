'use client';

import { FeedList } from '@/features/feed/components/FeedList';
import { useExplore } from '@/features/explore/hooks/useExplore';

export default function ExplorePage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useExplore();

  return (
    <main className='max-w-2xl mx-auto py-4 px-4'>
      <h1 className='text-2xl font-bold text-white mb-6'>Explore</h1>
      <FeedList
        data={data}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        status={status}
        error={error}
        emptyMessage='No posts to explore yet. Check back later!'
      />
    </main>
  );
}
