'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TenantSidebar } from '@/components/TenantSidebar';

export default function TenantDashboardLayout({ children }: { children: React.ReactNode }) {
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

  if (user && user.role !== 'tenant') {
    router.push('/access-denied');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden h-screen">
      <TenantSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {children}
      </div>
    </div>
  );
}
