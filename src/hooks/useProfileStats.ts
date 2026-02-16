import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

interface PostWithLikes {
  likeCount?: number;
  [key: string]: unknown;
}

export function useProfileStats(username: string, isEnabled: boolean = true) {
  return useQuery<ProfileStats>({
    queryKey: ['profile-stats', username],
    queryFn: async () => {
      try {
        const [postsRes, followersRes, followingRes] = await Promise.allSettled(
          [
            axiosInstance.get<ApiResponse>(`/users/${username}/posts`),
            axiosInstance.get<ApiResponse>(`/users/${username}/followers`),
            axiosInstance.get<ApiResponse>(`/users/${username}/following`),
          ]
        );

        const getCount = (
          result: PromiseSettledResult<any>,
          field: string
        ): number => {
          if (result.status === 'fulfilled') {
            // Axios response.data is the actual payload
            const payload = result.value.data;

            // Check for API Wrapper pattern: { success: true, data: ... }
            const data = payload?.data || payload;

            // Strategy 1: Direct number
            if (typeof data === 'number') return data;

            // Strategy 2: Explicit count fields
            if (typeof data?.total === 'number') return data.total;
            if (typeof data?.count === 'number') return data.count;

            // Strategy 3: Array length (direct)
            if (Array.isArray(data)) return data.length;

            // Strategy 4: Array in common nested properties
            const arrayFields = [
              'data',
              'items',
              'results',
              'posts',
              'users',
              'followers',
              'following',
            ];
            for (const key of arrayFields) {
              if (Array.isArray(data?.[key])) return data[key].length;
            }

            // Strategy 5: Check ANY key that holds an array (fallback)
            if (typeof data === 'object' && data !== null) {
              for (const key in data) {
                if (Array.isArray((data as Record<string, unknown>)[key])) {
                  return ((data as Record<string, unknown>)[key] as unknown[])
                    .length;
                }
              }
            }

            // Debug log if we fail to find a count
            console.warn(
              `[useProfileStats] Could not extract count for ${field}:`,
              payload
            );
          } else {
            console.error(
              `[useProfileStats] Failed to fetch ${field}:`,
              result.reason
            );
          }
          return 0;
        };

        const postsCount = getCount(postsRes, 'posts');

        // Calculate likes received from the posts we fetched
        let calculatedLikes = 0;
        if (postsRes.status === 'fulfilled') {
          const payload = postsRes.value.data;
          const data = payload?.data || payload;
          let postsArray: PostWithLikes[] = [];

          if (Array.isArray(data)) postsArray = data;
          else if (data && typeof data === 'object') {
            // Try to find the array again using the same logic as getCount
            const arrayFields = ['data', 'items', 'results', 'posts'];
            for (const key of arrayFields) {
              const value = (data as Record<string, unknown>)[key];
              if (Array.isArray(value)) {
                postsArray = value as PostWithLikes[];
                break;
              }
            }
            // If still not found, check all keys
            if (postsArray.length === 0) {
              for (const key in data) {
                const value = (data as Record<string, unknown>)[key];
                if (Array.isArray(value)) {
                  postsArray = value as PostWithLikes[];
                  break;
                }
              }
            }
          }

          if (postsArray.length > 0) {
            calculatedLikes = postsArray.reduce(
              (sum: number, post: PostWithLikes) => sum + (post.likeCount || 0),
              0
            );
          }
        }

        return {
          postsCount,
          followersCount: getCount(followersRes, 'followers'),
          followingCount: getCount(followingRes, 'following'),
          likesCount: calculatedLikes,
        };
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        return {
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          likesCount: 0,
        };
      }
    },
    enabled: isEnabled && !!username,
    staleTime: 30000,
  });
}
