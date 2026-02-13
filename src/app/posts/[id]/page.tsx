'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentSection } from '@/features/post/components/CommentSection';
import { axiosInstance } from '@/lib/axios';
import { Post } from '@/features/post/types';

dayjs.extend(relativeTime);

export default function PostDetailPage() {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch post data
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/${id}`);
      const postData = response.data.data || response.data;
      // Initialize like state
      setIsLiked(postData.likedByMe);
      setLikesCount(postData.likeCount);
      return postData;
    },
    enabled: !!id,
  });

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      await axiosInstance.post(`/posts/${post.id}/like`);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setIsLiked(isLiked);
      setLikesCount(isLiked ? likesCount : likesCount - 1);
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-gray-500' />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className='text-center text-red-500 py-10 font-semibold'>
        Post not found or deleted.
      </div>
    );
  }

  const username = post.author.username;
  const avatarUrl = post.author.avatarUrl ?? undefined;
  const userLink = `/users/${post.author.username}`;
  const isSaved = post.isSaved ?? false;

  return (
    <div className='min-h-screen bg-neutral-950'>
      {/* Mobile Layout */}
      <div className='md:hidden'>
        <div className='max-w-xl mx-auto'>
          {/* Back Button */}
          <Link
            href='/'
            className='flex items-center text-sm text-neutral-400 hover:text-base-white px-4 py-4 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-1' /> Back to Feed
          </Link>

          {/* Post Header */}
          <div className='flex items-center gap-3 px-4 pb-4'>
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
                className='text-body-sm font-semibold hover:text-primary-200 transition-colors text-base-white'
              >
                {username}
              </Link>
              <span className='text-body-xs text-neutral-400'>
                {dayjs(post.createdAt).fromNow()}
              </span>
            </div>
          </div>

          {/* Post Image */}
          <div className='relative aspect-square w-full bg-neutral-900'>
            <Image
              src={post.imageUrl}
              alt={post.caption}
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Actions */}
          <div className='flex justify-between items-center px-4 py-4'>
            <div className='flex gap-5'>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className='flex items-center gap-2 group active:scale-125 transition-transform'
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isLiked
                      ? 'fill-accent-red text-accent-red'
                      : 'text-base-white group-hover:text-accent-red'
                  }`}
                />
                <span className='text-body-sm font-semibold text-base-white'>
                  {likesCount}
                </span>
              </button>

              <div className='flex items-center gap-2'>
                <MessageCircle className='w-6 h-6 text-base-white' />
                <span className='text-body-sm font-semibold text-base-white'>
                  {post.commentCount}
                </span>
              </div>

              <button className='flex items-center gap-2'>
                <Send className='w-6 h-6 text-base-white' />
                <span className='text-body-sm font-semibold text-base-white'>
                  0
                </span>
              </button>
            </div>

            <button>
              <Bookmark
                className={`w-6 h-6 transition-colors ${
                  isSaved
                    ? 'fill-base-white text-base-white'
                    : 'text-base-white hover:text-neutral-300'
                }`}
              />
            </button>
          </div>

          {/* Caption */}
          <div className='px-4 pb-4'>
            <div className='text-body-sm'>
              <span className='font-bold text-base-white mr-2'>{username}</span>
              <span className='text-neutral-300'>{post.caption}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className='hidden md:flex md:h-screen'>
        {/* Back Button - Fixed Top */}
        <Link
          href='/'
          className='absolute top-6 left-6 z-10 flex items-center text-sm text-neutral-400 hover:text-base-white transition-colors'
        >
          <ArrowLeft className='w-4 h-4 mr-1' /> Back to Feed
        </Link>

        {/* Left Side - Post Image */}
        <div className='flex-1 flex items-center justify-center bg-black'>
          <div className='relative w-full h-full max-w-3xl'>
            <Image
              src={post.imageUrl}
              alt={post.caption}
              fill
              className='object-contain'
              priority
            />
          </div>
        </div>

        {/* Right Side - Comments Sidebar */}
        <div className='w-[400px] lg:w-[500px] bg-white border-l border-neutral-800 flex flex-col'>
          {/* Post Header */}
          <div className='flex items-center gap-3 p-4 border-b border-gray-200'>
            <Link href={userLink}>
              <Avatar className='w-10 h-10'>
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback className='bg-gray-200'>
                  {username[0].toUpperCase()}
                </AvatarFallback>
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
          </div>

          {/* Caption */}
          <div className='p-4 border-b border-gray-200'>
            <div className='flex gap-3'>
              <Link href={userLink}>
                <Avatar className='w-8 h-8'>
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className='bg-gray-200'>
                    {username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <span className='font-semibold text-sm mr-2'>{username}</span>
                <span className='text-sm text-gray-800'>{post.caption}</span>
              </div>
            </div>
          </div>

          {/* Comments - Takes remaining space */}
          <div className='flex-1 overflow-hidden'>
            <CommentSection
              postId={post.id}
              variant='inline'
              isOpen={true}
              post={post}
            />
          </div>

          {/* Actions Bar */}
          <div className='p-4 border-t border-gray-200'>
            <div className='flex justify-between items-center mb-2'>
              <div className='flex gap-4'>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className='active:scale-125 transition-transform'
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isLiked
                        ? 'fill-accent-red text-accent-red'
                        : 'text-gray-800 hover:text-accent-red'
                    }`}
                  />
                </button>
                <MessageCircle className='w-6 h-6 text-gray-800' />
                <Send className='w-6 h-6 text-gray-800' />
              </div>
              <button>
                <Bookmark
                  className={`w-6 h-6 transition-colors ${
                    isSaved
                      ? 'fill-gray-800 text-gray-800'
                      : 'text-gray-800 hover:text-gray-500'
                  }`}
                />
              </button>
            </div>
            <div className='text-sm font-semibold'>{likesCount} likes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
