import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { FeedResponse } from '@/features/feed/types';

export const useExplore = () => {
  return useInfiniteQuery({
    queryKey: ['explore'],
    queryFn: async ({ pageParam = 1 }): Promise<FeedResponse> => {
      try {
        const response = await axiosInstance.get('/posts', {
          params: {
            page: pageParam,
            limit: 20,
          },
        });

        const backendData = response.data.data || response.data;

        // Handle different response structures
        let posts = [];
        if (Array.isArray(backendData)) {
          posts = backendData;
        } else if (Array.isArray(backendData?.posts)) {
          posts = backendData.posts;
        } else if (Array.isArray(backendData?.items)) {
          posts = backendData.items;
        } else if (Array.isArray(backendData?.data)) {
          posts = backendData.data;
        }

        const totalStyles =
          backendData?.pagination?.total || backendData?.total || posts.length;

        return {
          items: posts,
          pagination: {
            page: pageParam,
            limit: 20,
            total: totalStyles,
            totalPages: Math.ceil(totalStyles / 20) || 1,
            lastPage: Math.ceil(totalStyles / 20) || 1,
          },
        };
      } catch (error) {
        console.error('=== EXPLORE API ERROR ===', error);
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
