/**
 * Author information embedded in posts and comments
 */
export interface Author {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Post model - matches the backend API response
 */
export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isSaved?: boolean;
  location?: string;
}

/**
 * Comment model
 */
export interface Comment {
  id: string;
  content: string;
  text?: string;
  createdAt: string;
  author: {
    id: string;
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
  postId: string;
  variant?: 'mobile' | 'desktop' | 'inline';
  isOpen?: boolean;
  onClose?: () => void;
  post?: Post; // For desktop modal to show image
}
