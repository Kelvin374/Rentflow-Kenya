'use client';

import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';

const landlordRoutes = ['/dashboard', '/properties', '/tenants', '/payments', '/maintenance', '/reports', '/settings'];
const adminRoutes = ['/admin', '/properties', '/tenants', '/payments', '/maintenance', '/reports', '/settings'];

function isLandlordRoute(pathname: string): boolean {
  return landlordRoutes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return <>{children}</>;

  if (user.role === 'admin' && isAdminRoute(pathname)) {
    return (
      <div className="min-h-screen bg-background flex overflow-hidden h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  if (user.role === 'landlord' && isLandlordRoute(pathname)) {
    return (
      <div className="min-h-screen bg-background flex overflow-hidden h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
