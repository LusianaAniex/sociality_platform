'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Heart, MessageCircle, Bookmark, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { axiosInstance } from '@/lib/axios';

// Setup Day.js to show "2 hours ago"
dayjs.extend(relativeTime);

// Define the shape of a Post (Interface)-matches the actual backend API response
export interface Post {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: {
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
  const commentsCount = post.commentCount;
  const isSaved = post.isSaved ?? false;
  // ADD STATE FOR LIKES (Optimistic UI)
  const [isLiked, setIsLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false); // To prevent spam-clicking

  // CREATE THE LIKE HANDLER
  const handleLike = async () => {
    if (isLiking) return;

    // Optimistically update the UI instantly
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      // Send request to backend.
      await axiosInstance.post(`/posts/${post.id}/like`);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // If it fails, revert the UI back to what it was
      setIsLiked(isLiked);
      setLikesCount(isLiked ? likesCount : likesCount - 1);
      // Optional: Add a toast notification here saying "Failed to like post"
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className='border-0 shadow-none bg-transparent text-base-white mb-6'>
      {/* HEADER: Author Info */}
      <CardHeader className='flex flex-row items-center gap-3 p-0 pb-4'>
        <Link href={userLink}>
          <Avatar className='w-10 h-10 border border-neutral-800'>
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className='bg-neutral-800 text-base-white'>
              {username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className='flex flex-col'>
          <Link
            href={userLink}
            className='text-body-sm font-semibold hover:text-primary-200 transition-colors'
          >
            {username}
          </Link>
          <span className='text-body-xs text-neutral-400'>
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
      </CardHeader>

      {/* BODY: Image & Caption */}
      <CardContent className='p-0'>
        <div className='relative aspect-square w-full bg-neutral-900 overflow-hidden'>
          <Image
            src={post.imageUrl}
            alt={post.caption}
            fill
            className='object-cover'
            priority={false} // Lazy load images
          />
        </div>
      </CardContent>

      {/* FOOTER: Actions & Caption */}
      <CardFooter className='flex flex-col items-start p-0 pt-4 gap-3'>
        {/* Action Buttons Row */}
        <div className='flex w-full justify-between items-center'>
          <div className='flex gap-5'>
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className='flex items-center gap-2 group active:scale-125 transition-transform'
            >
              <Heart
                className={`w-6 h-6 transition-colors ${isLiked ? 'fill-accent-red text-accent-red' : 'text-base-white group-hover:text-accent-red'}`}
              />
              <span className='text-body-sm font-semibold'>{likesCount}</span>
            </button>

            {/* Comment Button */}
            <Link
              href={`/posts/${post.id}`}
              className='flex items-center gap-2 group'
            >
              <MessageCircle className='w-6 h-6 text-base-white group-hover:text-primary-200 transition-colors' />
              <span className='text-body-sm font-semibold'>
                {commentsCount}
              </span>
            </Link>

            {/* Share/Send Button */}
            <button className='flex items-center gap-2 group'>
              <Send className='w-6 h-6 text-base-white group-hover:text-primary-200 transition-colors' />
              <span className='text-body-sm font-semibold'>0</span>
            </button>
          </div>

          {/* Save Button */}
          <button>
            <Bookmark
              className={`w-6 h-6 transition-colors ${isSaved ? 'fill-base-white text-base-white' : 'text-base-white hover:text-neutral-300'}`}
            />
          </button>
        </div>

        {/* CAPTION */}
        <div className='text-body-sm mt-1'>
          <span className='font-bold mr-2'>{username}</span>
          <span className='text-neutral-300'>{post.caption}</span>
        </div>

        {/* SHOW MORE COMMENTS LINK */}
        {commentsCount > 0 && (
          <Link
            href={`/posts/${post.id}`}
            className='text-body-sm font-medium text-primary-200 hover:text-primary-300 transition-colors'
          >
            Show More
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};
