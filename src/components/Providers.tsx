'use client';

import { type ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SidebarProvider } from '@/components/SidebarContext';
import { NotificationProvider } from '@/components/Notifications';
import { DashboardShell } from '@/components/DashboardShell';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SidebarProvider>
          <NotificationProvider>
            <ToastProvider>
              <DashboardShell>{children}</DashboardShell>
            </ToastProvider>
          </NotificationProvider>
        </SidebarProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
