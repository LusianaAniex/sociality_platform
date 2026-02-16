'use client';

import { FeedList } from '@/features/feed/components/FeedList';
import { useFeed } from '@/features/feed/hooks/useFeed';

export default function HomePage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useFeed();

  return (
    <main className='max-w-2xl mx-auto py-4 px-4'>
      <h1 className='text-2xl font-bold text-white mb-6'>Your Feed</h1>
      <FeedList
        data={data}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        status={status}
        error={error}
        emptyMessage='Your feed is empty! Follow some users to see their posts.'
      />
    </main>
  );
}
