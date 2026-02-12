import { useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Post } from '@/features/post/components/PostCard';

// API Response structure matching the feed endpoint
interface ExploreResponse {
  items: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Fetch all posts from the platform (not just followed users)
const fetchExploreFeed = async ({ pageParam = 1 }) => {
  try {
    // Try using /posts endpoint to get all public posts
    const response = await axiosInstance.get(`/posts?page=${pageParam}`);
    console.log('Explore Full API Response:', response);
    console.log('Explore response.data:', response.data);
    console.log('Explore response.data.data:', response.data.data);

    // Backend returns: { success: true, message: 'OK', data: { data: Post[], meta: {...} } }
    // We return response.data.data to match the feed hook pattern
    const result = response.data.data;
    console.log('Explore parsed result:', result);

    // Transform to match expected structure if needed
    if (result && Array.isArray(result.data)) {
      return {
        items: result.data,
        pagination: {
          page: result.meta?.page || pageParam,
          limit: result.meta?.limit || 10,
          total: result.meta?.total || result.data.length,
        },
      };
    }

    // If already in correct format
    return result;
  } catch (error) {
    console.error('Explore API Error:', error);
    throw error;
  }
};

// Hook for explore feed
export const useExploreFeed = () => {
  return useInfiniteQuery({
    queryKey: ['explore-feed'],
    queryFn: fetchExploreFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage: ExploreResponse) => {
      if (!lastPage || !lastPage.pagination) {
        return undefined;
      }
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
