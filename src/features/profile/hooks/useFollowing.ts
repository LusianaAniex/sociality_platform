import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { z } from 'zod';
import { UserProfile, UserProfileSchema } from '@/features/profile/types';

interface FollowingResponse {
  success: boolean;
  data: UserProfile[];
}

export function useFollowing(username: string, isEnabled: boolean = false) {
  return useQuery({
    queryKey: ['following', username],
    queryFn: async () => {
      const response = await axiosInstance.get<FollowingResponse>(
        `/users/${username}/following`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = response.data;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let candidate: any = [];
      if (Array.isArray(data)) candidate = data;
      else if (data?.data && Array.isArray(data.data)) candidate = data.data;
      else if (data?.data?.items && Array.isArray(data.data.items))
        candidate = data.data.items;
      else if (data?.items && Array.isArray(data.items)) candidate = data.items;
      else if (data?.following && Array.isArray(data.following))
        candidate = data.following;

      const result = z.array(UserProfileSchema).safeParse(candidate);
      if (result.success) return result.data;

      console.warn(`[useFollowing] schema validation failed`, result.error);
      return [];
    },
    enabled: isEnabled && !!username,
    staleTime: 60 * 1000,
  });
}
