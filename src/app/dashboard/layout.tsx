'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (user && user.role === 'admin') {
    router.push('/admin/dashboard');
    return null;
  }

  if (user && user.role === 'tenant') {
    router.push('/tenant/dashboard');
    return null;
  }

  return <>{children}</>;
}
