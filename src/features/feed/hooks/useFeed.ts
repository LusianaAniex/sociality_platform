import { useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Post } from '@/features/post/components/PostCard';

// 1. Define the API Response structure
// The backend returns { items: Post[], pagination: { page: 1, limit: 20, total: 0 } }
interface FeedResponse {
  items: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// 2. The Fetch Function
const fetchFeed = async ({ pageParam = 1 }) => {
  try {
    // We call /feed?page=1
    const response = await axiosInstance.get(`/feed?page=${pageParam}`);
    console.log('Feed API Response:', response.data);
    // Backend returns: { success: true, message: 'OK', data: { data: Post[], meta: {...} } }
    // We return response.data.data to get { data: Post[], meta: {...} }
    return response.data.data;
  } catch (error) {
    console.error('Feed API Error:', error);
    throw error;
  }
};

// 3. The Hook
export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'], // Unique ID for this data
    queryFn: fetchFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage: FeedResponse) => {
      // Logic: If there are more items to load, next page is +1
      const totalPages = Math.ceil(
        lastPage.pagination.total / lastPage.pagination.limit
      );
      if (lastPage.pagination.page < totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};
