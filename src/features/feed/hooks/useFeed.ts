import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { FeedResponse } from '@/features/feed/types';

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 1 }): Promise<FeedResponse> => {
      try {
        // ✅ USE THE WORKING ENDPOINT from your probe
        // Reverting to /posts with type='following' as /feed always returning null,might not be implemented
        const response = await axiosInstance.get(`/posts`, {
          params: {
            page: pageParam,
            limit: 20,
            type: 'following',
          },
        });

        // Your API returns { success: true, message: 'OK', data: { posts: [...], pagination: {...} } }
        const backendData = response.data.data;

        // The posts are in 'posts' array, not 'items'
        const posts = backendData.posts || []; // Changed from posts || items
        const pagination = backendData.pagination || {
          page: pageParam,
          limit: 20,
          total: posts.length,
          totalPages: 1,
        };

        return {
          items: posts, // Keep as 'items' for your component
          pagination: {
            page: pagination.page || pageParam,
            limit: pagination.limit || 20,
            total: pagination.total || posts.length,
            totalPages: pagination.totalPages || 1,
            lastPage: pagination.totalPages || 1,
          },
        };
      } catch (error) {
        console.error('=== FEED API ERROR ===', error);
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};
