import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Post } from "@/features/post/components/PostCard";

// 1. Define the API Response structure
// The backend usually returns { data: Post[], meta: { page: 1, lastPage: 5 } }
interface FeedResponse {
  data: Post[];
  meta: {
    page: number;
    last_page: number;
    total: number;
  };
}

// 2. The Fetch Function
const fetchFeed = async ({ pageParam = 1 }) => {
  // We call /feed?page=1
  const response = await axiosInstance.get(`/feed?page=${pageParam}`);
  return response.data;
};

// 3. The Hook
export const useFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"], // Unique ID for this data
    queryFn: fetchFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage: FeedResponse) => {
      // Logic: If current page < last page, next page is +1. Else, stop.
      if (lastPage.meta.page < lastPage.meta.last_page) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
  });
};