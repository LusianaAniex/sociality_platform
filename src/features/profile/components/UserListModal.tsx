'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { UserProfile } from '@/features/profile/types';
import { UserSimpleCard } from './UserSimpleCard';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserProfile[];
  isLoading: boolean;
}

export function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  isLoading,
}: UserListModalProps) {
  // Ensure users is an array to prevent crashes
  const userList = Array.isArray(users) ? users : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='bg-black border-neutral-800 text-white sm:max-w-[425px] flex flex-col max-h-[80vh] p-0 gap-0'>
        <DialogHeader className='p-6 border-b border-neutral-800'>
          <DialogTitle className='text-xl font-bold'>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            List of {title.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden min-h-[300px] relative bg-black'>
          {isLoading ? (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Loader2 className='w-8 h-8 animate-spin text-primary-200' />
            </div>
          ) : userList.length === 0 ? (
            <div className='absolute inset-0 flex flex-col items-center justify-center text-neutral-400'>
              <p>No users found.</p>
            </div>
          ) : (
            <div className='h-full w-full p-4 overflow-y-auto custom-scrollbar'>
              <div className='flex flex-col gap-2'>
                {userList.map((user) => (
                  <UserSimpleCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
