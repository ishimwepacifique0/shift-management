'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { getCurrentUser, loadFromStorage } from '@/feature/auth/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, status, isInitialized } = useSelector((state: RootState) => state.auth);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // First, try to load from storage (cookies)
    dispatch(loadFromStorage());
    setHasCheckedAuth(true);
  }, [dispatch]);

  useEffect(() => {
    // If not authenticated after loading from storage, try to get current user
    if (hasCheckedAuth && !isAuthenticated && status === 'idle') {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, status, hasCheckedAuth]);

  useEffect(() => {
    // If still not authenticated after all checks, redirect to login
    if (hasCheckedAuth && isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, hasCheckedAuth, router]);

  // Show loading only while checking authentication
  if (!hasCheckedAuth || status === 'loading') {
    return (
      <div className="flex bg-gradient-to-br h-screen justify-center dark:from-slate-950 dark:to-slate-800 dark:via-slate-900 from-slate-50 items-center to-slate-100 via-white">
        <div className="text-center">
          <div className="border-b-2 border-blue-600 h-12 rounded-full w-12 animate-spin mb-4 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}