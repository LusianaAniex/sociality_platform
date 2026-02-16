'use client';

import { UserProfile } from '../types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FollowButton } from './FollowButton';
import { useState, useEffect } from 'react';

interface ProfileHeaderProps {
  profile: UserProfile | null | undefined;
  isCurrentUser: boolean;
  stats?: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    likesCount: number;
  };
  totalLikes?: number;
}

export default function ProfileHeader({
  profile,
  isCurrentUser,
  stats,
  totalLikes,
}: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(profile?.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  // Update stats when props change
  useEffect(() => {
    // 1. Set stats from the hook if available
    if (stats) {
      setFollowerCount(stats.followersCount);
      setPostCount(stats.postsCount);
      setFollowingCount(stats.followingCount);
      // NOTE: We do NOT set likesCount from stats here because useProfileStats
      // fetches "liked posts" instead of "received likes".
      // We wait for the 'totalLikes' prop below.
    }
    // 2. Fallback to profile object if stats are missing
    else if (profile) {
      setFollowerCount(profile.followerCount || profile.followersCount || 0);
      setPostCount(
        profile.postCount ||
          profile.postsCount ||
          profile.totalPosts ||
          profile.post_count ||
          0
      );
      setFollowingCount(
        profile.followingCount ||
          profile.followingsCount ||
          profile.following_count ||
          0
      );
    }

    // 3. Always prioritize the explicitly passed totalLikes for the Likes stat
    // This is calculated from the actual posts on the page
    if (typeof totalLikes === 'number') {
      setLikesCount(totalLikes);
    }
  }, [profile, stats, totalLikes]);

  // Update following status from profile
  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.isFollowing ?? false);
    }
  }, [profile]);

  if (!profile) {
    return <div className='text-neutral-400'>Loading profile...</div>;
  }

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

  return (
    <div className='flex flex-col gap-6 mb-8'>
      {/* MOBILE LAYOUT */}
      <div className='md:hidden'>
        <div className='flex items-center gap-4 mb-4'>
          <Avatar className='w-20 h-20 border-2 border-neutral-800'>
            <AvatarImage src={displayAvatarUrl} alt={displayUsername} />
            <AvatarFallback className='text-xl bg-neutral-800 text-white'>
              {displayName?.[0]?.toUpperCase() ||
                displayUsername?.[0]?.toUpperCase() ||
                '?'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <h1 className='text-lg font-bold text-white truncate'>
              {displayName}
            </h1>
            <p className='text-sm text-neutral-400'>@{displayUsername}</p>
          </div>
        </div>

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

        <div className='flex gap-2 mb-6'>
          {isCurrentUser ? (
            <Link href='/edit-profile' className='flex-1'>
              <Button className='w-full bg-black hover:bg-primary-300 text-white border border-neutral-800 rounded-full h-9 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.9)] transition-all duration-300'>
                Edit Profile
              </Button>
            </Link>
          ) : (
            <FollowButton
              userId={profile.id}
              username={profile.username}
              initialIsFollowing={isFollowing}
              onFollowChange={(newIsFollowing) => {
                setIsFollowing(newIsFollowing);
                if (newIsFollowing) {
                  setFollowerCount((prev) => prev + 1);
                } else {
                  setFollowerCount((prev) => Math.max(0, prev - 1));
                }
              }}
              className='flex-1 h-9'
            />
          )}
        </div>

        {/* Mobile Stats */}
        <div className='flex justify-between border-t border-neutral-800 pt-4'>
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>{postCount}</div>
            <div className='text-xs text-neutral-400'>Posts</div>
          </div>
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>{followerCount}</div>
            <div className='text-xs text-neutral-400'>Followers</div>
          </div>
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>{followingCount}</div>
            <div className='text-xs text-neutral-400'>Following</div>
          </div>
          <div className='text-center'>
            <div className='font-bold text-lg text-white'>{likesCount}</div>
            <div className='text-xs text-neutral-400'>Likes</div>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className='hidden md:flex gap-8 items-start'>
        <Avatar className='w-32 h-32 border-4 border-base-black'>
          <AvatarImage src={displayAvatarUrl} alt={displayUsername} />
          <AvatarFallback className='text-4xl bg-neutral-800 text-white'>
            {displayName?.[0]?.toUpperCase() ||
              displayUsername?.[0]?.toUpperCase() ||
              '?'}
          </AvatarFallback>
        </Avatar>

        <div className='flex-1 flex flex-col gap-5'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-white'>{displayName}</h1>
              <p className='text-base text-neutral-400'>@{displayUsername}</p>
            </div>
            <div className='flex gap-3'>
              {isCurrentUser ? (
                <Link href='/edit-profile'>
                  <Button className='bg-black hover:bg-primary-300 text-white rounded-full px-6 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.9)] transition-all duration-300'>
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <FollowButton
                  userId={profile.id}
                  username={profile.username}
                  initialIsFollowing={isFollowing}
                  onFollowChange={(newIsFollowing) => {
                    setIsFollowing(newIsFollowing);
                    if (newIsFollowing) {
                      setFollowerCount((prev) => prev + 1);
                    } else {
                      setFollowerCount((prev) => Math.max(0, prev - 1));
                    }
                  }}
                  className='px-6 rounded-full'
                />
              )}
            </div>
          </div>

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

          {/* Desktop Stats */}
          <div className='flex gap-10 mt-2'>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>{postCount}</div>
              <div className='text-sm text-neutral-400'>Posts</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>
                {followerCount}
              </div>
              <div className='text-sm text-neutral-400'>Followers</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>
                {followingCount}
              </div>
              <div className='text-sm text-neutral-400'>Following</div>
            </div>
            <div className='text-center'>
              <div className='font-bold text-xl text-white'>{likesCount}</div>
              <div className='text-sm text-neutral-400'>Likes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
