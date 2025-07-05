'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

const publicPaths = ['/login', '/register'];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      // If not authenticated and not on a public path, redirect to login
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
        return;
      }
      
      // If authenticated and on login page, redirect to home
      if (user && pathname === '/login') {
        router.push('/');
        return;
      }
    }
  }, [user, loading, pathname, router, mounted]);

  // Don't render anything during SSR or initial mount
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show content if user is authenticated or on public path
  if (user || publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
}
