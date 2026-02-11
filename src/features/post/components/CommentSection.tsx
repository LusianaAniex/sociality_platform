'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axios';

dayjs.extend(relativeTime);


export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl: string | null;
  };
}

interface CommentSectionProps {
  postId: number;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch comments on load
  // 1. Fetch comments on load
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${postId}/comments`);

        // Let's print the response so we can see exactly what the backend sends!
        console.log('Comments from backend:', response.data);

        // Try to grab the data payload
        const fetchedData = response.data.data || response.data;

        // THE FIX: Only set comments if the data is actually an Array!
        if (Array.isArray(fetchedData)) {
          setComments(fetchedData);
        } else {
          // If it's null or an object, just fallback to an empty array
          setComments([]); //Safe fallback
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        setComments([]); // Fallback on error too
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // 2. Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Sending the comment text to the backend
      const response = await axiosInstance.post(`/posts/${postId}/comments`, {
        text: newComment,
      });

      const createdComment = response.data.data || response.data;

      // Instantly add the new comment to the top of the list
      setComments((prev) => [createdComment, ...prev]);
      setNewComment(''); // Clear the input field
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white border md:rounded-lg p-4 shadow-sm flex flex-col gap-6'>
      <h3 className='font-semibold text-lg border-b pb-2'>Comments</h3>

      {/* INPUT FORM */}
      <form onSubmit={handleSubmit} className='flex gap-3 items-center'>
        <Input
          placeholder='Add a comment...'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting || isLoading}
          className='flex-1 rounded-full bg-gray-50'
        />
        <Button
          type='submit'
          disabled={!newComment.trim() || isSubmitting}
          size='icon'
          className='rounded-full shrink-0'
        >
          {isSubmitting ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Send className='w-4 h-4' />
          )}
        </Button>
      </form>

      {/* COMMENT LIST */}
      <div className='flex flex-col gap-5'>
        {isLoading ? (
          <div className='text-center text-sm text-gray-500 py-4'>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <p className='text-sm text-center text-gray-500 py-4'>
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className='flex gap-3'>
              <Link href={`/users/${comment.author?.username || ''}`}>
                <Avatar className='w-8 h-8'>
                  <AvatarImage src={comment.author?.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {comment.author?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className='flex flex-col flex-1'>
                <div className='flex items-baseline gap-2'>
                  <Link
                    href={`/users/${comment.author?.username || ''}`}
                    className='text-sm font-semibold hover:underline'
                  >
                    {comment.author?.username || 'Unknown'}
                  </Link>
                  <span className='text-xs text-gray-500'>
                    {dayjs(comment.createdAt).fromNow()}
                  </span>
                </div>
                {/* Display the comment text */}
                <p className='text-sm text-gray-800 mt-1'>{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
