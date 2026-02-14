'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { FollowButton } from '@/features/profile/components/FollowButton';
import { Loader2, X } from 'lucide-react';
import Link from 'next/link';

interface LikesModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Liker {
  id: string;
  username: string;
  name?: string; // properties might vary based on API
  fullName?: string;
  full_name?: string; // snake_case support
  avatarUrl?: string; // properties might vary based on API
  avatar_url?: string; // snake_case support
  profilePicture?: string;
  profile_picture?: string; // snake_case support
  isFollowing?: boolean;
}

export function LikesModal({ postId, isOpen, onClose }: LikesModalProps) {
  const {
    data: likers,
    isLoading,
    isError,
  } = useQuery<Liker[]>({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(`/posts/${postId}/likes`);
        const responseData = response.data;

        // Check if response.data is an object
        if (responseData && typeof responseData === 'object') {
          // Check for the nested structure
          if (responseData.data) {
            const nestedData = responseData.data;

            // Check if nestedData itself is an array
            if (Array.isArray(nestedData)) return nestedData;

            // Check if nestedData has a data property that's an array
            if (nestedData.data && Array.isArray(nestedData.data))
              return nestedData.data;

            // Check if nestedData has users property
            if (nestedData.users && Array.isArray(nestedData.users))
              return nestedData.users;

            // Check if nestedData has likes property
            if (nestedData.likes && Array.isArray(nestedData.likes))
              return nestedData.likes;
          }

          // Check other common patterns at top level
          if (Array.isArray(responseData)) return responseData;
          if (responseData.users && Array.isArray(responseData.users))
            return responseData.users;
          if (responseData.likes && Array.isArray(responseData.likes))
            return responseData.likes;
        }

        return [];
      } catch (error) {
        console.error('Error fetching likes:', error);
        return [];
      }
    },
    enabled: isOpen, // Only fetch when modal is open
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-neutral-900 border-neutral-800 text-white p-0 gap-0 max-w-md w-full overflow-hidden rounded-xl'>
        <DialogHeader className='p-4 border-b border-neutral-800 flex flex-row items-center justify-between'>
          <DialogTitle className='text-base font-bold text-center w-full'>
            Likes
          </DialogTitle>
          <DialogDescription className='sr-only'>
            List of users who liked this post
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar p-2'>
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='w-6 h-6 animate-spin text-neutral-500' />
            </div>
          ) : isError ? (
            <div className='text-center py-8 text-neutral-500'>
              Failed to load likes.
            </div>
          ) : likers && likers.length > 0 ? (
            likers.map((user) => (
              <div
                key={user.id}
                className='flex items-center justify-between p-3 hover:bg-neutral-800/50 rounded-lg transition-colors'
              >
                <Link
                  href={`/users/${user.username}`}
                  className='flex items-center gap-3 flex-1 min-w-0'
                  onClick={onClose} // Close modal on navigation
                >
                  <Avatar className='w-10 h-10 border border-neutral-800'>
                    <AvatarImage
                      src={
                        user.avatarUrl ||
                        user.profilePicture ||
                        user.avatar_url ||
                        user.profile_picture
                      }
                      alt={user.username}
                    />
                    <AvatarFallback className='bg-neutral-800 text-xs'>
                      {user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col min-w-0'>
                    <span className='font-semibold text-sm truncate'>
                      {user.name ||
                        user.fullName ||
                        user.full_name ||
                        user.username}
                    </span>
                    <span className='text-xs text-neutral-400 truncate'>
                      @{user.username}
                    </span>
                  </div>
                </Link>

                <FollowButton
                  username={user.username}
                  initialIsFollowing={user.isFollowing ?? false}
                />
              </div>
            ))
          ) : (
            <div className='text-center py-8 text-neutral-500'>
              No likes yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
