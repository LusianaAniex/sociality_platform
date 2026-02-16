'use client';

import { FeedList } from '@/features/feed/components/FeedList';
import { useFeed } from '@/features/feed/hooks/useFeed';
import AuthGuard from '@/features/auth/components/AuthGuard';

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
    <AuthGuard>
      <main className='max-w-2xl mx-auto py-4 px-4'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-white'>Your Feed</h1>
        </div>
        <FeedList
          data={data}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          status={status}
          error={error}
          title=''
          emptyMessage='Your feed is empty! Follow some users to see their posts.'
        />
      </main>
    </AuthGuard>
  );
}
