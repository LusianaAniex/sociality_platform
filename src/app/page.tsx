import { FeedList } from '@/features/feed/components/FeedList';

export default function HomePage() {
  return (
    <div className='space-y-6'>
      <header>
        <h1 className='text-2xl font-bold'>Your Feed</h1>
        <p className='text-gray-500'>Welcome back to Sociality!</p>
      </header>

      {/* Placeholder for the Feed content */}
      <section>
        <FeedList />
      </section>
    </div>
  );
}
