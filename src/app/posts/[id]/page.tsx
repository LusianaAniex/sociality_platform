'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  X,
  Smile,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommentSection } from '@/features/post/components/CommentSection';
import { LikesModal } from '@/features/post/components/LikesModal';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { Post } from '@/features/post/types';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Input } from '@/components/ui/input';

dayjs.extend(relativeTime);

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);

  // Comment Logic
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch post data
  const {
    data: queryData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/${id}`);
      const postData = response.data.data || response.data;
      setPost(postData);
      setIsLiked(postData.likedByMe);
      setLikesCount(postData.likeCount);
      return postData;
    },
    enabled: !!id,
  });

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Keep local state in sync if query data changes
  useEffect(() => {
    if (queryData) {
      setPost(queryData);
      setIsLiked(queryData.likedByMe);
      setLikesCount(queryData.likeCount);
      setIsBookmarked(queryData.isSaved ?? false);
    }
  }, [queryData]);

  const handleSave = async () => {
    if (isBookmarking || !post) return;

    // Optimistic update
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);
    setIsBookmarking(true);

    try {
      if (newBookmarkedState) {
        await axiosInstance.post(`/posts/${post.id}/save`);
      } else {
        await axiosInstance.delete(`/posts/${post.id}/save`);
      }
      toast.success(
        newBookmarkedState ? 'Post saved' : 'Post removed from saved'
      );
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // Revert on error
      setIsBookmarked(!newBookmarkedState);
      toast.error('Failed to update bookmark');
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleLike = async () => {
    if (isLiking || !post) return;
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

  const handlePostComment = async () => {
    if (!commentText.trim() || !post) return;
    setIsPostingComment(true);
    try {
      await axiosInstance.post(`/posts/${post.id}/comments`, {
        text: commentText,
      });
      setCommentText('');

      // Force immediate refetch to update the list and counts
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['comments', post.id] }),
        queryClient.invalidateQueries({ queryKey: ['post', post.id] }),
      ]);

      // Optimistic update for local UI responsiveness
      setPost((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null
      );

      // Success Toast
      toast.success('Success Post', {
        className: 'bg-green-600 text-white border-none',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error) {
      console.error('Failed to post comment:', error);
      // Error Toast
      toast.error('Failed to Post', {
        className: 'bg-red-600 text-white border-none',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsPostingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-black'>
        <Loader2 className='w-8 h-8 animate-spin text-neutral-500' />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className='flex justify-center items-center h-screen bg-black text-red-500'>
        Post not found.
      </div>
    );
  }

  const username = post.author.username;
  const avatarUrl = post.author.avatarUrl ?? undefined;
  const userLink = `/users/${post.author.username}`;
  const isSaved = post.isSaved ?? false;

  return (
    <div className='min-h-screen bg-black text-white flex justify-center items-center p-0 md:p-8'>
      {/* --- DESKTOP LAYOUT --- */}
      <div className='hidden md:flex w-full max-w-[1400px] h-[85vh] bg-black border border-neutral-800 rounded-xl overflow-hidden shadow-2xl'>
        {/* 1. LEFT SIDE: Image */}
        <div className='flex-1 bg-black flex items-center justify-center relative border-r border-neutral-800'>
          <div className='relative w-full h-full'>
            <Image
              src={post.imageUrl}
              alt={post.caption || 'Post image'}
              fill
              className='object-contain'
              priority
              sizes='(max-width: 768px) 100vw, 65vw'
            />
          </div>
        </div>

        {/* 2. RIGHT SIDE: Sidebar (Fixed Width) */}
        <div className='w-[400px] bg-black flex flex-col h-full border-l border-neutral-800'>
          {/* A. Header - Author Info & Close */}
          <div className='flex items-center justify-between p-4 border-b border-neutral-800 h-[70px] shrink-0'>
            <div className='flex items-center gap-3'>
              <Link href={userLink}>
                <Avatar className='w-8 h-8 ring-1 ring-neutral-800'>
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className='bg-neutral-800 text-white text-xs'>
                    {username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className='flex flex-col'>
                <Link
                  href={userLink}
                  className='text-sm font-semibold text-white hover:text-neutral-300'
                >
                  {username}
                </Link>
                <span className='text-xs text-neutral-500'>
                  {dayjs(post.createdAt).fromNow()}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className='text-neutral-400 hover:text-white transition-colors p-2'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* B. Scrollable Area */}
          <div className='flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6'>
            {/* Caption Block */}
            {post.caption && (
              <div className='flex gap-3'>
                <Link href={userLink} className='shrink-0'>
                  <Avatar className='w-8 h-8 ring-1 ring-neutral-800'>
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className='bg-neutral-800 text-white text-xs'>
                      {username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className='text-sm pt-0.5 text-white'>
                  <Link
                    href={userLink}
                    className='font-semibold mr-2 text-white hover:text-neutral-300'
                  >
                    {username}
                  </Link>
                  <span className='text-neutral-200'>{post.caption}</span>
                </div>
              </div>
            )}

            <div>
              <div className='text-sm font-semibold text-white mb-4'>
                Comments
              </div>
              {/* Comments List - Input Hidden */}
              <div className='-mx-4'>
                <CommentSection
                  postId={post.id}
                  variant='inline'
                  isOpen={true}
                  post={post}
                  hideInput={true}
                />
              </div>
            </div>
          </div>

          {/* C. Footer (Actions + Input) */}
          <div className='p-4 border-t border-neutral-800 bg-black flex flex-col gap-3 relative'>
            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className='absolute bottom-full left-4 z-50 mb-2'>
                <EmojiPicker
                  theme={Theme.DARK}
                  onEmojiClick={(emojiData) => {
                    setCommentText((prev) => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}

            {/* Action Icons */}
            <div className='flex justify-between items-center'>
              <div className='flex gap-4 items-center'>
                <button
                  onClick={handleLike}
                  className='group flex items-center gap-1.5'
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-neutral-400'}`}
                  />
                </button>
                <button
                  onClick={() => setIsLikesModalOpen(true)}
                  className='text-sm font-semibold hover:text-neutral-300 transition-colors'
                >
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </button>
                <button className='group flex items-center gap-1.5'>
                  <MessageCircle className='w-6 h-6 text-white group-hover:text-neutral-400 transform -scale-x-100' />
                  {post.commentCount > 0 && (
                    <span className='text-sm font-semibold'>
                      {post.commentCount}
                    </span>
                  )}
                </button>
                <button>
                  <Send className='w-6 h-6 text-white hover:text-neutral-400' />
                </button>
              </div>
              <button onClick={handleSave} disabled={isBookmarking}>
                <Bookmark
                  className={`w-6 h-6 transition-colors ${isBookmarked ? 'fill-white text-white' : 'text-white hover:text-neutral-400'}`}
                />
              </button>
            </div>

            {/* Input Field */}
            <div className='flex items-center gap-0 bg-neutral-900 rounded-lg px-3 py-1.5 border border-neutral-800'>
              <input
                type='text'
                placeholder='Add Comment'
                className='flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-neutral-500 focus:outline-none h-9'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
              />
              <button
                className='text-neutral-400 hover:text-white transition-colors p-2'
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className='w-5 h-5' />
              </button>
              <div className='w-px h-6 bg-neutral-700 mx-1'></div>
              <Button
                variant='ghost'
                className='text-white font-semibold hover:text-primary-200 hover:bg-transparent px-3'
                onClick={handlePostComment}
                disabled={!commentText.trim() || isPostingComment}
              >
                {isPostingComment ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE LAYOUT --- */}
      <div className='md:hidden w-full min-h-screen bg-black flex flex-col'>
        {/* Header with back button and title */}
        <div className='flex items-center justify-between p-4 border-b border-neutral-800'>
          <div className='flex items-center gap-4'>
            <button onClick={() => router.back()}>
              <ArrowLeft className='w-5 h-5' />
            </button>
            <span className='font-semibold'>Post</span>
          </div>
          <button onClick={handleSave} disabled={isBookmarking}>
            <Bookmark
              className={`w-5 h-5 ${isBookmarked ? 'fill-white text-white' : ''}`}
            />
          </button>
        </div>

        {/* Post Image */}
        <div className='relative w-full aspect-square bg-neutral-900'>
          <Image
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
            fill
            className='object-cover'
            sizes='100vw'
          />
        </div>

        {/* Action Icons */}
        <div className='flex items-center justify-between p-4'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <button onClick={handleLike}>
                <Heart
                  className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
              <button
                onClick={() => setIsLikesModalOpen(true)}
                className='text-sm font-semibold'
              >
                {likesCount}
              </button>
            </div>
            <button className='flex items-center gap-1'>
              <MessageCircle className='w-6 h-6 text-white' />
              <span className='text-sm font-semibold'>{post.commentCount}</span>
            </button>
            <button>
              <Send className='w-6 h-6 text-white' />
            </button>
          </div>
          <button onClick={handleSave} disabled={isBookmarking}>
            <Bookmark
              className={`w-6 h-6 ${isBookmarked ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        {/* Caption */}
        <div className='px-4 pb-4'>
          <span className='font-semibold mr-2'>{username}</span>
          <span className='text-sm text-neutral-300'>{post.caption}</span>
          <span className='text-xs text-neutral-500 block mt-1'>
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>

        {/* Comments Section */}
        <div className='px-4'>
          <CommentSection
            postId={post.id}
            variant='inline'
            isOpen={true}
            hideInput={true}
          />
        </div>

        {/* Add Comment Input - Mobile */}
        <div className='fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-neutral-800'>
          <div className='flex items-center gap-2'>
            <Avatar className='w-8 h-8'>
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback className='bg-neutral-700 text-white text-xs'>
                {username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 flex items-center bg-neutral-900 rounded-lg px-3 py-2'>
              <input
                type='text'
                placeholder='Add Comment'
                className='flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-neutral-500 focus:outline-none'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
              />
              <div className='flex items-center gap-1'>
                <button className='text-neutral-400 hover:text-white transition-colors'>
                  <Smile className='w-5 h-5' />
                </button>
                <Button
                  variant='ghost'
                  className='text-white font-semibold hover:text-primary-200 hover:bg-transparent px-3 py-1 h-auto'
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || isPostingComment}
                >
                  {isPostingComment ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Add padding at bottom for mobile to account for fixed input */}
        <div className='h-20' />
      </div>

      {isLikesModalOpen && post && (
        <LikesModal
          postId={post.id}
          isOpen={isLikesModalOpen}
          onClose={() => setIsLikesModalOpen(false)}
        />
      )}
    </div>
  );
}
