'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Grid3X3, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileHeader from '@/features/profile/components/ProfileHeader';
import { PostCard } from '@/features/post/components/PostCard';
import { UserProfile } from '@/features/profile/types';
import { Post } from '@/features/post/types';
import { FeedResponse } from '@/features/feed/types';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setCredentials } from '@/store/authSlice';
import { useEffect } from 'react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user: currentUser, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  console.log('Username from params:', username); // Debug log

  const isCurrentUser =
    currentUser?.username?.toLowerCase() === username?.toLowerCase();

  // 1. Fetch Profile Info - FIXED ENDPOINT
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<UserProfile>({
    queryKey: ['profile', username],
    queryFn: async () => {
      console.log('Fetching profile for:', username); // Debug log
      try {
        // Try the first endpoint that might work based on your backend
        const response = await axiosInstance.get(`/users/${username}`);
        console.log('Profile API response:', response); // Debug log

        // Handle nested data structures common in backends
        if (response.data && response.data.data) {
          return response.data.data;
        }

        return response.data;
      } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
    },
  });

  // Sync profile data with Redux if it's the current user and data has changed
  useEffect(() => {
    if (isCurrentUser && profile && currentUser && token) {
      // Check if avatar or other key details need update in Redux
      const profileAvatar =
        profile.avatar ||
        profile.avatarUrl ||
        profile.profilePicture ||
        profile.profileImage;
      const currentAvatar = currentUser.avatar;

      if (profileAvatar && profileAvatar !== currentAvatar) {
        console.log('Syncing updated profile to Redux store');
        dispatch(
          setCredentials({
            user: {
              ...currentUser,
              avatar: profileAvatar,
              // Update other fields if necessary
            },
            token,
          })
        );
      }
    }
  }, [isCurrentUser, profile, currentUser, dispatch, token]);

  // 2. Fetch User's Posts - FIXED ENDPOINT
  const {
    data: feedData,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery<FeedResponse>({
    queryKey: ['profile-posts', username],
    queryFn: async () => {
      console.log('Fetching posts for:', username); // Debug log
      try {
        // Try different possible endpoints for posts
        const { data } = await axiosInstance.get(`/users/${username}/posts`);
        console.log('Posts data received:', data); // Debug log
        return data;
      } catch (error) {
        console.error('Posts fetch error:', error);
        throw error;
      }
    },
    enabled: !!profile, // Only fetch posts if profile exists
  });

  // Ensure posts is always an array
  let posts: Post[] = [];

  if (Array.isArray(feedData)) {
    posts = feedData;
  } else if (feedData?.items && Array.isArray(feedData.items)) {
    posts = feedData.items;
  } else if (feedData?.posts && Array.isArray(feedData.posts)) {
    posts = feedData.posts;
  } else if (feedData?.data && Array.isArray(feedData.data)) {
    posts = feedData.data;
  } else {
    // Fallback or check if data is wrapped further
    // e.g. feedData.data.posts
    const possibleData = feedData as any;
    if (possibleData?.data?.posts && Array.isArray(possibleData.data.posts)) {
      posts = possibleData.data.posts;
    } else if (
      possibleData?.data?.items &&
      Array.isArray(possibleData.data.items)
    ) {
      posts = possibleData.data.items;
    }
  }

  // Handle errors
  if (profileError) {
    console.error('Profile error:', profileError);
    return (
      <div className='text-center py-20 text-red-500'>
        Error loading profile. Please try again.
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className='flex justify-center py-20'>
        <Loader2 className='animate-spin text-white' />
      </div>
    );
  }

  if (!profile) {
    console.log('Profile not found for username:', username); // Debug log
    return (
      <div className='text-center py-20 text-white'>
        <h2 className='text-2xl font-bold mb-2'>User not found</h2>
        <p className='text-neutral-400'>The user @{username} doesn't exist.</p>
      </div>
    );
  }

  return (
    <main className='max-w-4xl mx-auto py-4 px-4 pb-20 md:py-8'>
      {/* 1. Header Section */}
      <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />

      {/* 2. Tabs (Gallery vs Saved) */}
      <div className='flex border-t border-neutral-800 mb-1'>
        <button className='flex-1 flex items-center justify-center gap-2 py-3 border-b-2 border-white text-white'>
          <Grid3X3 className='w-4 h-4' />
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Gallery
          </span>
        </button>
        <button className='flex-1 flex items-center justify-center gap-2 py-3 text-neutral-500 hover:text-white transition-colors'>
          <Bookmark className='w-4 h-4' />
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Saved
          </span>
        </button>
      </div>

      {/* 3. Posts Grid */}
      {postsLoading ? (
        <div className='flex justify-center py-10'>
          <Loader2 className='animate-spin text-neutral-500' />
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-0.5'>
          {posts?.map((post) => (
            // For the Grid View, we usually just show the image
            <Link
              href={`/posts/${post.id}`}
              key={post.id}
              className='relative aspect-square bg-neutral-900 overflow-hidden group cursor-pointer'
            >
              <Image
                src={
                  post.imageUrl ||
                  post.image ||
                  post.media?.[0]?.url ||
                  '/placeholder-post.jpg'
                }
                alt='Post'
                fill
                sizes='(max-width: 768px) 33vw, 33vw'
                className='object-cover group-hover:scale-105 transition-transform duration-300'
              />
            </Link>
          ))}
          {/* Fallback if no posts */}
          {posts?.length === 0 && (
            <div className='col-span-3 flex flex-col items-center justify-center py-16 text-center px-4'>
              <div className='mb-6'>
                <h3 className='text-lg font-bold text-white mb-2'>
                  No posts yet
                </h3>
                <p className='text-neutral-400 text-sm max-w-[280px] mx-auto leading-relaxed'>
                  @{username} hasn't shared any posts yet.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
