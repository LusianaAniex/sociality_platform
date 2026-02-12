/**
 * Post-related TypeScript type definitions
 * Centralized types for the post feature
 */

/**
 * Author information embedded in posts and comments
 */
export interface Author {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Post model - matches the backend API response
 */
export interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isSaved?: boolean;
}

/**
 * Comment model
 */
export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl: string | null;
  };
}

/**
 * Props for PostCard component
 */
export interface PostCardProps {
  post: Post;
  priority?: boolean; // For LCP optimization on first post
}

/**
 * Props for CommentSection component
 */
export interface CommentSectionProps {
  postId: number;
  variant?: 'mobile' | 'desktop';
  isOpen?: boolean;
  onClose?: () => void;
  post?: Post; // For desktop modal to show image
}
