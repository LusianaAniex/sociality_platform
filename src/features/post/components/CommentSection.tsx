'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Smile, X, Send } from 'lucide-react';
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
import { Comment, CommentSectionProps } from '@/features/post/types';

dayjs.extend(relativeTime);

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

// --- 2. EXTRACTED SHARED CONTENT COMPONENT ---
interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
  newComment: string;
  setNewComment: (value: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (value: boolean) => void;
  isPending: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleEmojiClick: (emojiObject: any) => void;
  handleClose: () => void;
  variant: 'mobile' | 'desktop' | 'inline';
  isMobile?: boolean;
}

const CommentsList = ({
  comments,
  isLoading,
  newComment,
  setNewComment,
  showEmojiPicker,
  setShowEmojiPicker,
  isPending,
  handleSubmit,
  handleEmojiClick,
  handleClose,
  variant,
  isMobile = false,
}: CommentsListProps) => (
  <div className='flex flex-col h-full bg-neutral-950 text-white w-full'>
    {/* HEADER */}
    <div className='flex items-center justify-between p-4 border-b border-neutral-800 shrink-0'>
      <h3 className='font-semibold text-lg'>Comments</h3>
      {/* Close Button: Explicitly calls onClose */}
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
          <div key={comment.id} className='flex gap-3'>
            <Link href={`/users/${comment.author?.username || '#'}`}>
              <Avatar className='w-8 h-8 ring-1 ring-neutral-800'>
                <AvatarImage src={comment.author?.avatarUrl ?? undefined} />
                <AvatarFallback className='bg-neutral-800 text-xs text-white'>
                  {comment.author?.username?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className='flex flex-col flex-1 gap-1'>
              <div className='flex items-baseline justify-between'>
                <Link
                  href={`/users/${comment.author?.username || '#'}`}
                  className='text-sm font-semibold hover:text-neutral-300 text-white'
                >
                  {comment.author?.username || 'Unknown'}
                </Link>
                <span className='text-[10px] text-neutral-500'>
                  {dayjs(comment.createdAt).fromNow()}
                </span>
              </div>
              <p className='text-sm text-neutral-300 leading-relaxed wrap-break-word'>
                {comment.content || comment.text || JSON.stringify(comment)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>

    {/* INPUT AREA */}
    <div className='shrink-0 bg-neutral-950 border-t border-neutral-800'>
      {showEmojiPicker && (
        <div className='px-4 pt-2'>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={'dark' as any}
            width='100%'
            height='250px'
          />
        </div>
      )}
      <form onSubmit={handleSubmit} className='p-3'>
        <div className='flex gap-2 items-center bg-neutral-900 rounded-full px-2 py-1 border border-neutral-800 focus-within:border-neutral-700 transition-colors'>
          <button
            type='button'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className='p-2 text-neutral-400 hover:text-white transition-colors'
          >
            <Smile className='w-5 h-5' />
          </button>
          <Input
            placeholder='Add a comment...'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isPending}
            className='flex-1 border-none bg-transparent text-white placeholder:text-neutral-500 focus-visible:ring-0 h-9'
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
  </div>
);

export const CommentSection = ({
  postId,
  variant = 'desktop',
  isOpen = false,
  onClose,
  post,
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const queryClient = useQueryClient();

  // Sync internal state with prop
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  // --- 1. DATA FETCHING ---
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/${postId}/comments`);

      // Handle response structure: { data: { comments: [], pagination: {} } }
      const responseData = response.data;
      const data = responseData.data || responseData;

      if (data.comments && Array.isArray(data.comments)) {
        return data.comments;
      }

      if (Array.isArray(data)) {
        return data;
      }

      return [];
    },
    enabled: internalOpen,
  });

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      return await axiosInstance.post(`/posts/${postId}/comments`, {
        text: text,
      });
    },
    onSuccess: (response) => {
      setNewComment('');
      setShowEmojiPicker(false);

      // Log the response to see what's returned
      console.log('Comment added response:', response.data);

      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });

      // Update the post's comment count in the cache
      queryClient.setQueriesData(
        { queryKey: ['post', postId] },
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            commentCount: (oldData.commentCount || 0) + 1,
          };
        }
      );

      // Also update feed posts if they exist in cache
      queryClient.setQueriesData({ queryKey: ['feed'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            if (!page || !page.posts || !Array.isArray(page.posts)) return page;
            return {
              ...page,
              posts: page.posts.map((p: any) =>
                p.id === postId
                  ? { ...p, commentCount: (p.commentCount || 0) + 1 }
                  : p
              ),
            };
          }),
        };
      });
    },
    onError: (error: any) => {
      console.error('Comment Post Error:', error);
      console.error('Error Response:', error.response?.data);
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

  // Unified close handler
  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  // Prepare props for shared content
  const contentProps = {
    comments,
    isLoading,
    newComment,
    setNewComment,
    showEmojiPicker,
    setShowEmojiPicker,
    isPending: mutation.isPending,
    handleSubmit,
    handleEmojiClick,
    handleClose,
    variant,
  };

  // --- 3. MOBILE VIEW (Sheet) ---
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
            <SheetDescription>View comments</SheetDescription>
          </SheetHeader>
          <CommentsList {...contentProps} isMobile />
        </SheetContent>
      </Sheet>
    );
  }

  // --- 3.5 INLINE VIEW (No Modal) ---
  if (variant === 'inline') {
    return <CommentsList {...contentProps} />;
  }

  // --- 4. DESKTOP VIEW (Dialog) ---
  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className='max-w-[1600px] w-[95vw] h-[90vh] p-0 gap-0 bg-black border-neutral-800 overflow-hidden flex flex-row shadow-2xl outline-none'
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>Post Detail</DialogTitle>
          <DialogDescription>View post and comments</DialogDescription>
        </DialogHeader>

        {/* LEFT: IMAGE - 65% */}
        <div className='w-[65%] relative bg-black flex items-center justify-center overflow-hidden'>
          {post?.imageUrl ? (
            <div className='relative w-full h-full flex items-center justify-center'>
              <Image
                src={post.imageUrl}
                alt='Post content'
                fill
                className='object-contain p-4'
                priority
                sizes='65vw'
              />
            </div>
          ) : (
            <div className='text-neutral-500'>No Image</div>
          )}
        </div>

        {/* RIGHT: COMMENTS - 35% */}
        <div className='w-[35%] border-l border-neutral-800 h-full flex flex-col bg-neutral-950'>
          <CommentsList {...contentProps} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
