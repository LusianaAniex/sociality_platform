'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axios'; // Ensure this path is correct
import { toast } from 'sonner';
import { Loader2, CheckCheck } from 'lucide-react';
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
      className={`rounded-full bg-primary-300 text-white px-4 h-9 font-semibold transition-all duration-300 ${
        isFollowing
          ? 'bg-black border border-primary-300 text-primary-300 hover:bg-neutral-900 shadow-[0_0_10px_rgba(167,139,250,0.3)]'
          : 'bg-primary-300 text-white hover:bg-primary-400'
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className='w-4 h-4 animate-spin' />
      ) : isFollowing ? (
        <div className='flex items-center gap-2'>
          <CheckCheck className='w-4 h-4' />
          <span>Following</span>
        </div>
      ) : (
        'Follow'
      )}
    </Button>
  );
}
