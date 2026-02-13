export interface UserProfile {
  id: number | string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  bio?: string;
  website?: string | null;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;

  // Optional aliases for compatibility
  name?: string;
  displayName?: string;
  handle?: string;
  avatar?: string;
  profilePicture?: string;
  profileImage?: string;
  biography?: string;
  url?: string;
  postsCount?: number;
  totalPosts?: number;
  followersCount?: number;
  followingsCount?: number;

  // Snake case aliases
  post_count?: number;
  follower_count?: number;
  following_count?: number;
}
