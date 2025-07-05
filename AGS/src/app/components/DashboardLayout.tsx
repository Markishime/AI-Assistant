'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navigation from './Navigation';
import { useAuth } from './AuthProvider';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const publicPaths = ['/login', '/register'];

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
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
  }, [user, loading, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated and not on public path
  if (!user && !publicPaths.includes(pathname)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Navigation />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
}
