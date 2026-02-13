'use client';

import { UserProfile } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface ProfileHeaderProps {
  profile: UserProfile | null | undefined;
  isCurrentUser: boolean;
}

export default function ProfileHeader({
  profile,
  isCurrentUser,
}: ProfileHeaderProps) {
  // Initialize follower count state
  const [isFollowing, setIsFollowing] = useState(profile?.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(
    profile?.followerCount || profile?.followersCount || 0
  );

  // Update effect to sync with new profile data if it changes
  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.isFollowing ?? false);
      setFollowerCount(profile.followerCount || profile.followersCount || 0);
    }
  }, [profile]);

  // Debug: Log the profile data
  useEffect(() => {
    console.log('ProfileHeader received profile:', profile);
  }, [profile]);

  const handleFollowToggle = async () => {
    // Optimistic update
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);

    // Update follower count based on action
    if (newIsFollowing) {
      setFollowerCount((prev) => prev + 1);
    } else {
      setFollowerCount((prev) => Math.max(0, prev - 1)); // Prevent negative count
    }

    try {
      // API call placeholder - Replace with actual mutation
      // await followUserMutation.mutateAsync(profile.id);
    } catch (error) {
      // Revert on error
      setIsFollowing(!newIsFollowing);
      setFollowerCount((prev) => (newIsFollowing ? prev - 1 : prev + 1));
      console.error('Failed to update follow status:', error);
    }
  };

  // If profile is null or undefined, show nothing or a loading state
  if (!profile) {
    return <div>Loading profile...</div>;
  }

  // Check if the profile has the expected properties
  const displayName =
    profile.fullName || profile.name || profile.displayName || 'User';
  const displayUsername = profile.username || profile.handle || 'unknown';
  const displayAvatarUrl =
    profile.avatarUrl ||
    profile.avatar ||
    profile.profilePicture ||
    profile.profileImage;
  const displayBio = profile.bio || profile.biography || '';
  const displayWebsite = profile.website || profile.url || '';
  const displayPostCount =
    profile.postCount ||
    profile.postsCount ||
    profile.totalPosts ||
    profile.post_count ||
    0;

  // followerCount is handled by state
  const displayFollowingCount =
    profile.followingCount ||
    profile.followingsCount ||
    profile.following_count ||
    0;

  return (
    <div className='flex flex-col gap-6 mb-8'>
      {/* MOBILE LAYOUT */}
      <div className='md:hidden'>
        <div className='flex items-center gap-4 mb-4'>
          {/* Avatar */}
          <Avatar className='w-20 h-20 border-2 border-neutral-800'>
            <AvatarImage src={displayAvatarUrl} alt={displayUsername} />
            <AvatarFallback className='text-xl bg-neutral-800 text-white'>
              {displayName?.[0]?.toUpperCase() ||
                displayUsername?.[0]?.toUpperCase() ||
                '?'}
            </AvatarFallback>
          </Avatar>

          {/* Name & Handle */}
          <div className='flex-1 min-w-0'>
            <h1 className='text-lg font-bold text-white truncate'>
              {displayName}
            </h1>
            <p className='text-sm text-neutral-400'>@{displayUsername}</p>
          </div>
        </div>

        {/* Bio */}
        <div className='mb-4'>
          <p className='text-sm text-white whitespace-pre-wrap'>{displayBio}</p>
          {displayWebsite && (
            <a
              href={displayWebsite}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-blue-400 hover:underline block mt-1 truncate'
            >
              {displayWebsite}
            </a>
          )}
        </div>

        {/* Buttons */}
        <div className='flex gap-2 mb-6'>
          {isCurrentUser ? (
            <Button
              variant='outline'
              className='flex-1 border-neutral-700 text-white hover:bg-neutral-800 rounded-lg h-9'
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={handleFollowToggle}
              className={`flex-1 rounded-lg h-9 ${isFollowing ? 'bg-neutral-800 text-white' : 'bg-primary-200 text-base-white hover:bg-primary-300'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          <Button
            variant='outline'
            size='icon'
            className='w-9 h-9 border-neutral-700 text-white hover:bg-neutral-800 rounded-lg'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-send'
            >
              <path d='m22 2-7 20-4-9-9-4Z' />
              <path d='M22 2 11 13' />
            </svg>
          </Button>
        </div>

        {/* Mobile Stats (Evenly Spaced) */}
        <div className='flex justify-between border-t border-neutral-800 pt-4'>
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>
              {displayPostCount}
            </div>
            <div className='text-xs text-neutral-400'>Post</div>
          </div>
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>{followerCount}</div>
            <div className='text-xs text-neutral-400'>Followers</div>
          </div>
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>
              {displayFollowingCount}
            </div>
            <div className='text-xs text-neutral-400'>Following</div>
          </div>
          {/* Added Likes stats based on design */}
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>567</div>
            <div className='text-xs text-neutral-400'>Likes</div>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className='hidden md:flex gap-8 items-start'>
        {/* Avatar (Large) */}
        <Avatar className='w-32 h-32 border-4 border-base-black'>
          <AvatarImage src={displayAvatarUrl} alt={displayUsername} />
          <AvatarFallback className='text-4xl bg-neutral-800 text-white'>
            {displayName?.[0]?.toUpperCase() ||
              displayUsername?.[0]?.toUpperCase() ||
              '?'}
          </AvatarFallback>
        </Avatar>

        {/* Right Column */}
        <div className='flex-1 flex flex-col gap-5'>
          {/* Row 1: Name, Handle, Buttons */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-white'>{displayName}</h1>
              <p className='text-base text-neutral-400'>@{displayUsername}</p>
            </div>
            <div className='flex gap-3'>
              {isCurrentUser ? (
                <Button
                  variant='outline'
                  className='border-neutral-700 text-white hover:bg-neutral-800 rounded-full px-6'
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={handleFollowToggle}
                  className={`rounded-full px-6 ${isFollowing ? 'bg-neutral-800 text-white' : 'bg-primary-200 text-base-white hover:bg-primary-300'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
              <Button
                variant='outline'
                size='icon'
                className='rounded-full w-10 h-10 border-neutral-700 text-white hover:bg-neutral-800'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-send'
                >
                  <path d='m22 2-7 20-4-9-9-4Z' />
                  <path d='M22 2 11 13' />
                </svg>
              </Button>
            </div>
          </div>

          {/* Row 2: Bio */}
          <div>
            <p className='text-base text-white whitespace-pre-wrap max-w-2xl'>
              {displayBio}
            </p>
            {displayWebsite && (
              <a
                href={displayWebsite}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-blue-400 hover:underline block mt-1'
              >
                {displayWebsite}
              </a>
            )}
          </div>

          {/* Row 3: Stats */}
          <div className='flex gap-10 mt-2'>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>
                {displayPostCount}
              </div>
              <div className='text-sm text-neutral-400'>Post</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>
                {followerCount}
              </div>
              <div className='text-sm text-neutral-400'>Followers</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>
                {displayFollowingCount}
              </div>
              <div className='text-sm text-neutral-400'>Following</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>567</div>
              <div className='text-sm text-neutral-400'>Likes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
