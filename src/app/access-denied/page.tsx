'use client';

import { useRouter } from 'next/navigation';
import { useAuth, getDashboardRoute } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-danger/10 flex items-center justify-center mb-6">
          <ShieldOff size={40} className="text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">
          You do not have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <Button onClick={() => router.push(user ? getDashboardRoute(user.role) : '/login')}>
          {user ? 'Back to Dashboard' : 'Go to Login'}
        </Button>
      </div>
    </div>
  );
}
