import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

// Setup Day.js to show "2 hours ago"
dayjs.extend(relativeTime);

// Define the shape of a Post (Interface)
// This matches the actual backend API response
export interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: {
    // Backend returns 'author' not 'user'
    id: number;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  likeCount: number; 
  commentCount: number; 
  likedByMe: boolean; 
  isSaved?: boolean; 
}

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  // Map backend fields to display values
  const username = post.author.username;
  const avatarUrl = post.author.avatarUrl ?? undefined; // Convert null to undefined for Avatar component
  const userLink = `/users/${post.author.username}`;

  // Use backend field names directly
  const likesCount = post.likeCount;
  const commentsCount = post.commentCount;
  const isLiked = post.likedByMe;
  const isSaved = post.isSaved ?? false;

  return (
    <Card className='border-0 shadow-none md:border md:shadow-sm'>
      {/* 1. HEADER: Author Info */}
      <CardHeader className='flex flex-row items-center gap-3 p-4'>
        <Link href={userLink}>
          <Avatar>
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className='flex flex-col'>
          <Link
            href={userLink}
            className='text-sm font-semibold hover:underline'
          >
            {username}
          </Link>
          <span className='text-xs text-gray-500'>
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
      </CardHeader>

      {/* 2. BODY: Image & Caption */}
      <CardContent className='p-0'>
        {/* Image Container with Aspect Ratio */}
        <div className='relative aspect-square w-full bg-gray-100 overflow-hidden'>
          <Image
            src={post.imageUrl}
            alt={post.caption}
            fill
            className='object-cover'
            priority={false} // Lazy load images
          />
        </div>
      </CardContent>

      {/* 3. FOOTER: Actions & Caption */}
      <CardFooter className='flex flex-col items-start p-4 gap-3'>
        {/* Action Buttons Row */}
        <div className='flex w-full justify-between'>
          <div className='flex gap-4'>
            {/* Like Button */}
            <button className='flex items-center gap-1 group'>
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-700 group-hover:text-red-500'
                }`}
              />
            </button>

            {/* Comment Button */}
            <Link
              href={`/posts/${post.id}`}
              className='flex items-center gap-1'
            >
              <MessageCircle className='w-6 h-6 text-gray-700 hover:text-blue-500' />
            </Link>

            {/* Share Button (Optional) */}
            <Share2 className='w-6 h-6 text-gray-700 hover:text-green-500 cursor-pointer' />
          </div>

          {/* Save Button */}
          <button>
            <Bookmark
              className={`w-6 h-6 transition-colors ${
                isSaved
                  ? 'fill-black text-black'
                  : 'text-gray-700 hover:text-black'
              }`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <div className='text-sm font-semibold'>
          {likesCount.toLocaleString()} likes
        </div>

        {/* Caption */}
        <div className='text-sm'>
          <span className='font-semibold mr-2'>{username}</span>
          <span className='text-gray-800'>{post.caption}</span>
        </div>

        {/* View all comments link */}
        {commentsCount > 0 && (
          <Link
            href={`/posts/${post.id}`}
            className='text-xs text-gray-500 hover:text-gray-700'
          >
            View all {commentsCount} comments
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};
