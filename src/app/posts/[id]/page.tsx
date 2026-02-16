'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CommentSection } from '@/features/post/components/CommentSection';
import { Post } from '@/features/post/types';

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;

  const {
    data: post,
    isLoading,
    error,
  } = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/posts/${postId}`);
        // Handle { success: true, data: ... } or direct return
        const data = response.data?.data || response.data;
        return data;
      } catch (error) {
        console.error('Post fetch error:', error);
        throw error;
      }
    },
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-60px)]'>
        <Loader2 className='animate-spin text-white w-8 h-8' />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className='flex flex-col items-center justify-center h-[calc(100vh-60px)] text-white gap-4'>
        <h2 className='text-2xl font-bold'>Post not found</h2>
        <p className='text-neutral-400'>
          The post you are looking for does not exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <main className='min-h-[calc(100vh-60px)] flex items-center justify-center p-4'>
      <CommentSection
        postId={postId}
        post={post}
        variant='page'
        isOpen={true} // Always open as it's a page
      />
    </main>
  );
}
