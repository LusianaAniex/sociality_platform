'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axios'; // Ensure this path is correct
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { useQueryClient } from '@tanstack/react-query';

interface FollowButtonProps {
  userId: string | number;
  username: string; // Used for the API endpoint
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
}

export function FollowButton({
  userId,
  username,
  initialIsFollowing,
  onFollowChange,
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const isSelf =
    currentUser?.username === username || currentUser?.id === userId;

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || !username) return;

    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);
    setIsLoading(true);

    if (onFollowChange) {
      onFollowChange(newIsFollowing);
    }

    try {
      if (newIsFollowing) {
        // Follow endpoint
        await axiosInstance.post(`/follow/${username}`);
      } else {
        // Unfollow endpoint
        await axiosInstance.delete(`/follow/${username}`);
      }

      toast.success(
        newIsFollowing ? `Followed @${username}` : `Unfollowed @${username}`
      );
    } catch (error: any) {
      console.error('Failed to toggle follow:', error);

      // Better error logging
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('URL:', error.config?.url);
        console.error('Method:', error.config?.method);
      }

      // Revert on error
      setIsFollowing(!newIsFollowing);
      if (onFollowChange) {
        onFollowChange(!newIsFollowing);
      }

      // Show more specific error message if available
      const errorMessage =
        error.response?.data?.message ||
        (newIsFollowing ? 'Failed to follow user' : 'Failed to unfollow user');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      // Invalidate queries to update profile page counts/status
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      // Also invalidate feed to show new posts from followed users
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  };

  if (isSelf) return null; // Don't show follow button for self

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={isFollowing ? 'secondary' : 'default'}
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
