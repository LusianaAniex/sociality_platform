'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axios'; // Ensure this path is correct
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';

interface FollowButtonProps {
  username: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string; // Allow custom styling
}

export function FollowButton({
  username,
  initialIsFollowing,
  onFollowChange,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const isSelf = currentUser?.username === username;

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click events (like navigating to profile)
    if (isLoading) return;

    // Optimistic update
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);
    setIsLoading(true);

    if (onFollowChange) {
      onFollowChange(newIsFollowing);
    }

    try {
      if (newIsFollowing) {
        await axiosInstance.post(`/users/${username}/follow`);
      } else {
        await axiosInstance.delete(`/users/${username}/unfollow`);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Revert on error
      setIsFollowing(!newIsFollowing);
      if (onFollowChange) {
        onFollowChange(!newIsFollowing);
      }
      toast.error(
        newIsFollowing ? 'Failed to follow user' : 'Failed to unfollow user'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSelf) return null; // Don't show follow button for self

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={isFollowing ? 'secondary' : 'default'} // 'secondary' usually gray/outline-ish, 'default' primary color
      className={`rounded-full px-4 h-8 text-xs font-semibold ${
        isFollowing
          ? 'bg-transparent border border-neutral-700 text-white hover:bg-neutral-800'
          : 'bg-primary-200 text-base-white hover:bg-primary-300'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className='w-3 h-3 animate-spin' />
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </Button>
  );
}
