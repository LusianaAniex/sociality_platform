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
import { useProfileStats } from '@/hooks/useProfileStats';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user: currentUser, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const isCurrentUser =
    currentUser?.username?.toLowerCase() === username?.toLowerCase();

  const [activeTab, setActiveTab] = useState<'gallery' | 'saved' | 'likes'>(
    'gallery'
  );

  // 1. Fetch Profile Info - FIXED ENDPOINT
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<UserProfile>({
    queryKey: ['profile', username],
    queryFn: async () => {
      try {
        // Try the first endpoint that might work based on your backend
        const response = await axiosInstance.get(`/users/${username}`);

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
    queryKey: ['profile-posts', username, activeTab],
    queryFn: async () => {
      try {
        if (activeTab === 'saved') {
          // Only current user can see their saved posts usually
          const response = await axiosInstance.get('/me/saved');
          return response.data;
        }

        if (activeTab === 'likes') {
          // Fetch liked posts
          // Try /users/:username/likes or /users/:username/posts?type=liked
          // Assuming a dedicated endpoint or query param based on typical patterns
          // If direct endpoint doesn't exist, we might need to fallback to filtered posts
          try {
            const response = await axiosInstance.get(
              `/users/${username}/likes`
            );
            return response.data;
          } catch (e) {
            // Fallback: try posts with type=liked if the above fails
            console.warn('Failed to fetch /likes, trying /posts?type=liked');
            const response = await axiosInstance.get(
              `/users/${username}/posts?type=liked`
            );
            return response.data;
          }
        }

        // Default: Gallery (User's posts)
        const { data } = await axiosInstance.get(`/users/${username}/posts`);

        return data;
      } catch (error) {
        console.error('Posts fetch error:', error);
        throw error;
      }
    },
    enabled: !!profile, // Only fetch posts if profile exists
  });

  // 3. Fetch Profile Stats
  const { data: stats } = useProfileStats(username, !!profile);

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
    return (
      <div className='text-center py-20 text-white'>
        <h2 className='text-2xl font-bold mb-2'>User not found</h2>
        <p className='text-neutral-400'>The user @{username} doesn't exist.</p>
      </div>
    );
  }

  // Calculate total likes from posts
  const totalLikes = posts.reduce(
    (sum, post) => sum + (post.likeCount || 0),
    0
  );

  return (
    <main className='max-w-4xl mx-auto py-4 px-4 pb-20 md:py-8'>
      {/* 1. Header Section */}
      <ProfileHeader
        profile={profile}
        isCurrentUser={isCurrentUser}
        stats={stats}
        totalLikes={totalLikes}
      />

      {/* 2. Tabs (Gallery vs Saved vs Likes) */}
      <div className='flex border-t border-neutral-800 mb-1'>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${activeTab === 'gallery' ? 'border-b-2 border-white text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          <Grid3X3 className='w-4 h-4' />
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Gallery
          </span>
        </button>

        {/* Likes Tab - Available for everyone or just self? Usually public unless private profile. */}
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${activeTab === 'likes' ? 'border-b-2 border-white text-white' : 'text-neutral-500 hover:text-white'}`}
        >
          {/* Heart Icon for Likes */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-heart w-4 h-4'
          >
            <path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' />
          </svg>
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Likes
          </span>
        </button>

        {isCurrentUser && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${activeTab === 'saved' ? 'border-b-2 border-white text-white' : 'text-neutral-500 hover:text-white'}`}
          >
            <Bookmark className='w-4 h-4' />
            <span className='text-xs font-semibold uppercase tracking-wider'>
              Saved
            </span>
          </button>
        )}
      </div>

      {/* 3. Posts Grid */}
      {postsLoading ? (
        <div className='flex justify-center py-10'>
          <Loader2 className='animate-spin text-neutral-500' />
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-0.5'>
          {posts?.map((post, index) => (
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
                priority={index === 0}
              />
            </Link>
          ))}
          {/* Fallback if no posts */}
          {posts?.length === 0 && (
            <div className='col-span-3 flex flex-col items-center justify-center py-16 text-center px-4'>
              <div className='mb-6'>
                <h3 className='text-lg font-bold text-white mb-2'>
                  {activeTab === 'saved'
                    ? 'No saved posts'
                    : activeTab === 'likes'
                      ? 'No liked posts'
                      : 'No posts yet'}
                </h3>
                <p className='text-neutral-400 text-sm max-w-[280px] mx-auto leading-relaxed'>
                  {activeTab === 'saved'
                    ? 'Posts you save will appear here.'
                    : activeTab === 'likes'
                      ? 'Posts you like will appear here.'
                      : `@${username} hasn't shared any posts yet.`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
