import { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  next: () => void;
  threshold?: number;
  children?: React.ReactNode;
  className?: string;
}

export function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  children,
  className,
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          next();
        }
      },
      { threshold, rootMargin: '100px' }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasMore, isLoading, next, threshold]);

  return (
    <div className={className}>
      {children}
      <div ref={observerTarget} className='h-4 w-full' aria-hidden='true' />
    </div>
  );
}
