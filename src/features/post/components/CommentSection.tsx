'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Smile,
  X,
  Send,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { axiosInstance } from '@/lib/axios';
import { Comment, CommentSectionProps, Post } from '@/features/post/types';

dayjs.extend(relativeTime);

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

// --- SUB-COMPONENTS ---

// 1. Comment Item
const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className='flex gap-3 group'>
    <Link href={`/users/${comment.author?.username || '#'}`}>
      <Avatar className='w-8 h-8 ring-1 ring-neutral-800'>
        <AvatarImage src={comment.author?.avatarUrl ?? undefined} />
        <AvatarFallback className='bg-neutral-800 text-xs text-white'>
          {comment.author?.username?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
    </Link>
    <div className='flex flex-col flex-1 gap-1'>
      <div className='flex items-baseline gap-2'>
        <Link
          href={`/users/${comment.author?.username || '#'}`}
          className='text-sm font-semibold hover:text-neutral-300 text-white'
        >
          {comment.author?.username || 'Unknown'}
        </Link>
        <span className='text-sm text-neutral-300 leading-relaxed wrap-break-word'>
          {comment.content || comment.text || ''}
        </span>
      </div>
      <div className='flex items-center gap-3 mt-1'>
        <span className='text-[10px] text-neutral-500'>
          {dayjs(comment.createdAt).fromNow()}
        </span>
        <button className='text-[10px] font-semibold text-neutral-500 hover:text-neutral-300'>
          Reply
        </button>
      </div>
    </div>
    <button className='opacity-0 group-hover:opacity-100 transition-opacity self-center'>
      <Heart className='w-3 h-3 text-neutral-500 hover:text-red-500' />
    </button>
  </div>
);

// 2. Comment Input
interface CommentInputProps {
  newComment: string;
  setNewComment: (val: string) => void;
  isPending: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (val: boolean) => void;
  handleEmojiClick: (val: any) => void;
  variant?: 'mobile' | 'desktop' | 'inline';
}

const CommentInput = ({
  newComment,
  setNewComment,
  isPending,
  handleSubmit,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  variant,
}: CommentInputProps) => {
  return (
    <div className='shrink-0 bg-neutral-950 border-t border-neutral-800 relative z-20'>
      {showEmojiPicker && (
        <div className='absolute bottom-full left-0 w-full'>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={'dark' as any}
            width='100%'
            height='250px'
          />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={`p-3 ${variant === 'desktop' ? 'px-4 py-3' : ''}`}
      >
        <div className='flex gap-2 items-center'>
          <button
            type='button'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className='p-2 text-neutral-400 hover:text-white transition-colors'
          >
            <Smile className='w-6 h-6' />
          </button>
          <Input
            placeholder='Add a comment...'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isPending}
            className='flex-1 border-none bg-transparent text-white placeholder:text-neutral-500 focus-visible:ring-0 h-10 text-sm'
          />
          <Button
            type='submit'
            disabled={!newComment.trim() || isPending}
            variant='ghost'
            size='sm'
            className='text-blue-500 hover:text-blue-400 font-semibold px-3 hover:bg-transparent'
          >
            {isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// 3. Desktop Sidebar (New Design)
interface DesktopSidebarProps {
  post?: Post;
  comments: Comment[];
  isLoading: boolean;
  onClose: () => void;
  inputProps: CommentInputProps;
}

const DesktopSidebar = ({
  post,
  comments,
  isLoading,
  onClose,
  inputProps,
}: DesktopSidebarProps) => {
  // ADDED STATE
  const [isLiked, setIsLiked] = useState(post?.likedByMe ?? false);
  const [likesCount, setLikesCount] = useState(post?.likeCount ?? 0);
  const [isLiking, setIsLiking] = useState(false);

  // Sync state if post changes
  useEffect(() => {
    if (post) {
      setIsLiked(post.likedByMe);
      setLikesCount(post.likeCount);
    }
  }, [post]);

  const handleLike = async () => {
    if (isLiking || !post) return;
    const newIsLiked = !isLiked;

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    setIsLiking(true);

    try {
      await axiosInstance.post(`/posts/${post.id}/like`);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (!newIsLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  if (!post) return null;

  return (
    <div className='flex flex-col h-full bg-black text-white w-full border-l border-neutral-800'>
      {/* HEADER */}
      <div className='flex items-center justify-between p-4 border-b border-neutral-800 shrink-0 h-[72px]'>
        <div className='flex items-center gap-3'>
          <Link href={`/users/${post.author.username}`}>
            <Avatar className='w-8 h-8 ring-1 ring-neutral-800'>
              <AvatarImage src={post.author.avatarUrl ?? undefined} />
              <AvatarFallback className='bg-neutral-800 text-xs text-white'>
                {post.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className='flex flex-col'>
            <Link
              href={`/users/${post.author.username}`}
              className='text-sm font-semibold hover:text-neutral-300'
            >
              {post.author.username}
            </Link>
            {post.location && (
              <span className='text-xs text-neutral-400'>{post.location}</span>
            )}
            {!post.location && (
              <span className='text-xs text-neutral-400'>Original Audio</span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <button className='text-neutral-400 hover:text-white'>
            <MoreHorizontal className='w-5 h-5' />
          </button>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className='flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6'>
        {/* Caption as first item */}
        {post.caption && (
          <div className='flex gap-3'>
            <Link href={`/users/${post.author.username}`}>
              <Avatar className='w-8 h-8 ring-1 ring-neutral-800'>
                <AvatarImage src={post.author.avatarUrl ?? undefined} />
                <AvatarFallback className='bg-neutral-800 text-xs text-white'>
                  {post.author.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className='flex flex-col flex-1 gap-1'>
              <div className='flex items-baseline gap-2'>
                <Link
                  href={`/users/${post.author.username}`}
                  className='text-sm font-semibold hover:text-neutral-300 text-white'
                >
                  {post.author.username}
                </Link>
                <span className='text-sm text-neutral-300 leading-relaxed'>
                  {post.caption}
                </span>
              </div>
              <span className='text-[10px] text-neutral-500 mt-1'>
                {dayjs(post.createdAt).fromNow()}
              </span>
            </div>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className='flex justify-center py-10'>
            <Loader2 className='w-6 h-6 animate-spin text-neutral-500' />
          </div>
        ) : comments.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 text-neutral-500 space-y-2'>
            <p className='text-sm'>No comments yet.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className='p-4 border-t border-neutral-800 shrink-0 flex flex-col gap-3'>
        <div className='flex justify-between items-center'>
          <div className='flex gap-4'>
            <Heart
              onClick={handleLike}
              className={`w-6 h-6 cursor-pointer transition-colors ${
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-white hover:text-neutral-400'
              }`}
            />
            <MessageCircle className='w-6 h-6 text-white hover:text-neutral-400 cursor-pointer' />
            <Send className='w-6 h-6 text-white hover:text-neutral-400 cursor-pointer' />
          </div>
          <Bookmark className='w-6 h-6 text-white hover:text-neutral-400 cursor-pointer' />
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm font-semibold'>{likesCount} likes</span>
          <span className='text-[10px] text-neutral-500 uppercase'>
            {dayjs(post.createdAt).format('MMMM D, YYYY')}
          </span>
        </div>
      </div>

      {/* INPUT */}
      <CommentInput {...inputProps} variant='desktop' />
    </div>
  );
};

// 4. Mobile/Inline List (Legacy/Simplified)
interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
  handleClose: () => void;
  variant: 'mobile' | 'desktop' | 'inline';
  isMobile?: boolean;
  inputProps: CommentInputProps;
  hideInput?: boolean;
}

const CommentsList = ({
  comments,
  isLoading,
  handleClose,
  variant,
  inputProps,
  hideInput,
}: CommentsListProps) => (
  <div className='flex flex-col h-full bg-neutral-950 text-white w-full'>
    {/* HEADER - Only for Mobile/Inline usually */}
    <div className='hidden p-4 border-b border-neutral-800 shrink-0'>
      <h3 className='font-semibold text-lg'>Comments</h3>
      {variant !== 'inline' && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          className='p-2 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer'
          type='button'
        >
          <X className='w-5 h-5 text-neutral-400 hover:text-white' />
        </button>
      )}
    </div>

    {/* LIST */}
    <div className='flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar'>
      {isLoading ? (
        <div className='flex justify-center py-10'>
          <Loader2 className='w-6 h-6 animate-spin text-neutral-500' />
        </div>
      ) : comments.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-full text-neutral-500 space-y-2'>
          <p className='text-sm'>No comments yet.</p>
          <p className='text-xs'>Start the conversation!</p>
        </div>
      ) : (
        comments.map((comment: Comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>

    {/* INPUT */}
    {!hideInput && <CommentInput {...inputProps} />}
  </div>
);

// --- MAIN COMPONENT ---

export const CommentSection = ({
  postId,
  variant = 'desktop',
  isOpen = false,
  onClose,
  post,
  hideInput = false,
}: CommentSectionProps & { hideInput?: boolean }) => {
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const queryClient = useQueryClient();

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  // --- DATA FETCHING ---
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/${postId}/comments`);
      const responseData = response.data;
      const data = responseData.data || responseData;
      return data.comments && Array.isArray(data.comments)
        ? data.comments
        : Array.isArray(data)
          ? data
          : [];
    },
    enabled: internalOpen,
  });

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      return await axiosInstance.post(`/posts/${postId}/comments`, { text });
    },
    onSuccess: (response) => {
      setNewComment('');
      setShowEmojiPicker(false);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.setQueriesData({ queryKey: ['post', postId] }, (old: any) =>
        old ? { ...old, commentCount: (old.commentCount || 0) + 1 } : old
      );
      queryClient.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((p: any) => {
            if (!p?.posts || !Array.isArray(p.posts)) return p;
            return {
              ...p,
              posts: p.posts.map((post: any) =>
                post.id === postId
                  ? { ...post, commentCount: (post.commentCount || 0) + 1 }
                  : post
              ),
            };
          }),
        };
      });
    },
    onError: (error: any) => {
      console.error('Comment Post Error:', error);
      alert(
        `Failed to post comment: ${error.response?.data?.message || 'Unknown error'}`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    mutation.mutate(newComment);
  };

  const handleEmojiClick = (emojiObject: any) => {
    setNewComment((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const inputProps: CommentInputProps = {
    newComment,
    setNewComment,
    isPending: mutation.isPending,
    handleSubmit,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiClick,
    variant,
  };

  // --- RENDER ---

  if (variant === 'mobile') {
    return (
      <Sheet open={internalOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side='bottom'
          className='h-[85vh] p-0 bg-neutral-950 border-neutral-800 text-white'
          showCloseButton={false}
        >
          <SheetHeader className='sr-only'>
            <SheetTitle>Comments</SheetTitle>
          </SheetHeader>
          <CommentsList
            comments={comments}
            isLoading={isLoading}
            handleClose={handleClose}
            variant={variant}
            inputProps={inputProps}
            isMobile
          />
        </SheetContent>
      </Sheet>
    );
  }

  if (variant === 'inline') {
    return (
      <CommentsList
        comments={comments}
        isLoading={isLoading}
        handleClose={handleClose}
        variant={variant}
        inputProps={inputProps}
        hideInput={hideInput}
      />
    );
  }

  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className='max-w-[calc(100vw-60px)] h-[calc(100vh-60px)] p-0 gap-0 bg-black border-neutral-800 overflow-hidden flex flex-row shadow-2xl outline-none sm:rounded-none md:rounded-r-lg'
        style={{
          width: '1200px',
          maxWidth: '95vw',
          height: '90vh',
          maxHeight: '1000px',
        }}
        showCloseButton={true}
        closeButtonClassName='right-4 top-4 z-50 text-white bg-black/50 p-1 rounded-full hover:bg-black/80'
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>Post Detail</DialogTitle>
        </DialogHeader>

        {/* LEFT: IMAGE */}
        <div className='flex-1 relative bg-black flex items-center justify-center overflow-hidden border-r border-neutral-800'>
          {post?.imageUrl && (
            <div className='relative w-full h-full'>
              <Image
                src={post.imageUrl}
                alt='Post content'
                fill
                className='object-contain'
                priority
                sizes='65vw'
              />
            </div>
          )}
        </div>

        {/* RIGHT: SIDEBAR - Fixed width 450px or 500px depending on screen? Using standard Flex basis */}
        <div className='w-[400px] lg:w-[500px] shrink-0 h-full flex flex-col bg-black'>
          <DesktopSidebar
            post={post}
            comments={comments}
            isLoading={isLoading}
            onClose={handleClose}
            inputProps={inputProps}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
