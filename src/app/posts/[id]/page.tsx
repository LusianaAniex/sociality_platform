'use client';

import { CommentSection } from '@/features/post/components/CommentSection';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PostCard, Post } from '@/features/post/components/PostCard';
import { axiosInstance } from '@/lib/axios';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch the single post from your backend
        // Adjust the endpoint if your backend uses a different URL structure!
        const response = await axiosInstance.get(`/posts/${postId}`);

        // Assuming your backend sends the post inside response.data.data
        // Adjust this if your backend sends it directly as response.data
        setPost(response.data.data || response.data);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Could not load the post. It might have been deleted.');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-gray-500' />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className='text-center text-red-500 py-10 font-semibold'>
        {error || 'Post not found!'}
      </div>
    );
  }

  return (
    <div className='max-w-xl mx-auto py-6 flex flex-col gap-4'>
      {/* 1. Reuse our trusty PostCard! */}
      <PostCard post={post} />

      {/* 2. The Placeholder Comment Section */}
      <CommentSection postId={post.id} />
    </div>
  );
}
