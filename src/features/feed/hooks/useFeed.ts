import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Post } from '@/features/post/components/PostCard'; // Ensure Post is exported from PostCard.tsx

// 1. Internal Interface (What our components expect)
export interface FeedResponse {
  items: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  };
}

export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam = 1 }): Promise<FeedResponse> => {
      try {
        // Fetch data
        const response = await axiosInstance.get(`/feed`, {
          params: { page: pageParam },
        });

        // 2. MAPPING (Crucial Step)
        console.log('=== FEED API DEBUG ===');
        console.log('Full Response:', response);
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
        console.log('Response Data Type:', typeof response.data);
        console.log(
          'Response Data Keys:',
          response.data ? Object.keys(response.data) : 'no data'
        );

        // Backend structure: { success: true, message: 'OK', data: { items: [...], pagination: {...} } }
        const backendData = response.data.data;

        console.log('Backend Data:', backendData);
        console.log('Backend Data Type:', typeof backendData);
        console.log(
          'Backend Data Keys:',
          backendData ? Object.keys(backendData) : 'no backend data'
        );
        console.log('Backend Items:', backendData?.items);
        console.log('Backend Pagination:', backendData?.pagination);
        console.log('=====================');

        if (!backendData || !backendData.items || !backendData.pagination) {
          console.error('Unexpected API response structure:', response.data);
          console.error(
            'Expected: { data: { items: [...], pagination: {...} } }'
          );
          console.error('Got:', JSON.stringify(response.data, null, 2));
          throw new Error('Invalid feed data structure received from server');
        }

        return {
          items: backendData.items, // Backend already has 'items'
          pagination: {
            page: backendData.pagination.page,
            limit: backendData.pagination.limit,
            total: backendData.pagination.total,
            lastPage: backendData.pagination.totalPages,
          },
        };
      } catch (error) {
        console.error('=== FEED API ERROR ===');
        console.error('Error:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error('Axios Error Response:', axiosError.response);
          console.error('Axios Error Status:', axiosError.response?.status);
          console.error('Axios Error Data:', axiosError.response?.data);
        }
        console.error('=====================');
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.lastPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};
