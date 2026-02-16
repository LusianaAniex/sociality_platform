import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.union([z.number(), z.string()]),
  username: z.string(),
  fullName: z.string().optional().or(z.null()), // API might return null?
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().optional().nullable(),
  website: z.string().nullable().optional(),
  postCount: z.number().optional(),
  followerCount: z.number().optional(),
  followingCount: z.number().optional(),
  isFollowing: z.boolean().optional(),

  // Optional aliases for compatibility
  name: z.string().optional(),
  displayName: z.string().optional(),
  handle: z.string().optional(),
  avatar: z.string().optional(),
  profilePicture: z.string().optional(),
  profileImage: z.string().optional(),
  biography: z.string().optional(),
  url: z.string().optional(),
  postsCount: z.number().optional(),
  totalPosts: z.number().optional(),
  followersCount: z.number().optional(),
  followingsCount: z.number().optional(),

  // Snake case aliases
  post_count: z.number().optional(),
  follower_count: z.number().optional(),
  following_count: z.number().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
