// app/profile/[username]/page.tsx
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
import { useEffect, useState } from 'react';
import { useProfileStats } from '@/hooks/useProfileStats'; // Import the hook

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user: currentUser, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const isCurrentUser =
    currentUser?.username?.toLowerCase() === username?.toLowerCase();

  const [activeTab, setActiveTab] = useState<'gallery' | 'saved'>('gallery');

  // 1. Fetch Profile Info
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<UserProfile>({
    queryKey: ['profile', username],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/users/${username}`);

        // Handle nested data structures
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

  // 2. Fetch Profile Stats (NEW)
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useProfileStats(username, !!profile);

  // 3. Fetch User's Posts / Saved Posts
  const {
    data: feedData,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery<FeedResponse>({
    queryKey: ['profile-posts', username, activeTab],
    queryFn: async () => {
      try {
        if (activeTab === 'saved') {
          // Only current user can see their saved posts
          if (!isCurrentUser) {
            return { items: [] };
          }
          const response = await axiosInstance.get('/me/saved');
          return response.data;
        }

        // Default: Gallery (User's posts)
        const { data } = await axiosInstance.get(`/users/${username}/posts`);
        return data;
      } catch (error) {
        console.error('Posts fetch error:', error);
        throw error;
      }
    },
    enabled: !!profile,
  });

  // Sync profile data with Redux
  useEffect(() => {
    if (isCurrentUser && profile && currentUser && token) {
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
            },
            token,
          })
        );
      }
    }
  }, [isCurrentUser, profile, currentUser, dispatch, token]);

  // Refetch stats when posts change (for likes count)
  useEffect(() => {
    if (!postsLoading && feedData) {
      refetchStats();
    }
  }, [feedData, postsLoading, refetchStats]);

  // Parse posts array
  let posts: Post[] = [];
  if (Array.isArray(feedData)) {
    posts = feedData;
  } else if (feedData?.items && Array.isArray(feedData.items)) {
    posts = feedData.items;
  } else if (feedData?.posts && Array.isArray(feedData.posts)) {
    posts = feedData.posts;
  } else if (feedData?.data && Array.isArray(feedData.data)) {
    posts = feedData.data;
  }

  // Handle errors
  if (profileError) {
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

  return (
    <main className='max-w-4xl mx-auto py-4 px-4 pb-20 md:py-8'>
      {/* 1. Header Section with Stats */}
      <ProfileHeader
        profile={profile}
        isCurrentUser={isCurrentUser}
        stats={stats} // Pass the stats object
      />

      {/* Show loading indicator for stats if needed */}
      {statsLoading && (
        <div className='flex justify-center py-2'>
          <Loader2 className='animate-spin text-neutral-500 h-4 w-4' />
        </div>
      )}

      {/* 2. Tabs */}
      <div className='flex border-t border-neutral-800 mb-1'>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
            activeTab === 'gallery'
              ? 'border-b-2 border-white text-white'
              : 'text-neutral-500 hover:text-white'
          }`}
        >
          <Grid3X3 className='w-4 h-4' />
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Gallery
          </span>
        </button>
        {isCurrentUser && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
              activeTab === 'saved'
                ? 'border-b-2 border-white text-white'
                : 'text-neutral-500 hover:text-white'
            }`}
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
          {posts?.length === 0 && (
            <div className='col-span-3 flex flex-col items-center justify-center py-16 text-center px-4'>
              <div className='mb-6'>
                <h3 className='text-lg font-bold text-white mb-2'>
                  {activeTab === 'saved' ? 'No saved posts' : 'No posts yet'}
                </h3>
                <p className='text-neutral-400 text-sm max-w-[280px] mx-auto leading-relaxed'>
                  {activeTab === 'saved'
                    ? 'Posts you save will appear here.'
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