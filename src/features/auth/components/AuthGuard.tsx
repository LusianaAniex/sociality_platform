'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/hooks/useRedux';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    // We check both Redux state and localStorage (via store initialization)
    // If not authenticated, redirect to login
    if (!isAuthenticated || !token) {
      // Allow a brief moment for Redux to rehydrate from localStorage if needed
      // But since our store initializes relevant state from localStorage synchronously
      // (in authSlice.ts), this check should be immediate.

      // Double check localStorage directly for safety if Redux is lagging (unlikely but safe)
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!storedToken) {
        console.log(
          `[AuthGuard] Unauthorized access to ${pathname}. Redirecting to /login`
        );
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else {
        // Token exists in storage but maybe redux not ready?
        // For now assume if redux says no, it's no, unless we want to force re-check.
        // Given authSlice logic, it reads from storage on init.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
  }, [isAuthenticated, token, router, pathname]);

  if (isLoading || (!isAuthenticated && !token)) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-black text-white'>
        <Loader2 className='w-8 h-8 animate-spin text-primary-200 mb-4' />
        <p className='text-neutral-400'>Verifying session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
