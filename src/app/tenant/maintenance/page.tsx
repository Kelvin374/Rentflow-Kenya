'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { fetchTenantMaintenanceRequests, fetchTenantDashboardData } from '@/lib/supabase-api';
import { formatDistance } from '@/lib/utils';
import { ErrorMessage } from '@/components/ErrorMessage';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar } from '@/components/Avatar';
import { useSidebar } from '@/components/SidebarContext';
import { useToast } from '@/components/Toast';
import type { MaintenanceRequest } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: 'plumbing',
  electrical: 'electrical_services',
  security: 'security',
  painting: 'format_paint',
  water: 'water_drop',
  cleaning: 'cleaning_services',
  general: 'build',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-error/10 text-error',
  normal: 'bg-warning/10 text-warning',
  low: 'bg-success/10 text-success',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-warning/10 text-warning',
  assigned: 'bg-primary/10 text-primary',
  in_progress: 'bg-tertiary/10 text-tertiary',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function TenantMaintenancePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { openMobile } = useSidebar();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [propertyData, setPropertyData] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [reqs, dashboard] = await Promise.all([
        fetchTenantMaintenanceRequests(user.id),
        fetchTenantDashboardData(user.id, user.name),
      ]);
      setRequests(reqs);
      if (dashboard.property) setPropertyData(dashboard.property);
    } catch (e: any) {
      setError(e?.message || 'Failed to load maintenance requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'tenant') { router.push('/dashboard'); return; }
    loadData();
  }, [user, isAuthenticated, isLoading, router, loadData]);

  const filteredRequests = requests.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !m.description?.toLowerCase().includes(q) &&
        !m.propertyName?.toLowerCase().includes(q) &&
        !m.unitNumber?.toLowerCase().includes(q) &&
        !m.category?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const active = requests.filter((m) => m.status !== 'completed' && m.status !== 'cancelled').length;
  const completed = requests.filter((m) => m.status === 'completed').length;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 relative h-full">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-6 h-16 bg-surface border-b border-outline-variant sticky top-0 z-40">
        <div className="flex items-center gap-4 flex-1">
          <div className="md:hidden">
            <button onClick={openMobile} className="p-2 hover:bg-surface-container-high rounded-full">
              <span className="material-symbols-outlined text-primary">menu</span>
            </button>
          </div>
          <h1 className="text-xl font-bold text-on-surface">Maintenance</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="w-px h-6 bg-outline-variant mx-2" />
          <div className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-low p-1 rounded-lg transition-colors">
            <Avatar src={user?.avatar} name={user?.name || ''} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="font-semibold text-sm leading-none">{user?.name}</p>
              <p className="text-[10px] text-on-surface-variant">Verified Tenant</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-warning/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-warning">pending</span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Active</span>
            </div>
            <p className="text-[24px] leading-[32px] font-bold text-on-surface">{active}</p>
            <p className="text-sm text-on-surface-variant">Open Requests</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-success/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-success">check_circle</span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Done</span>
            </div>
            <p className="text-[24px] leading-[32px] font-bold text-on-surface">{completed}</p>
            <p className="text-sm text-on-surface-variant">Completed</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">build</span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Total</span>
            </div>
            <p className="text-[24px] leading-[32px] font-bold text-on-surface">{requests.length}</p>
            <p className="text-sm text-on-surface-variant">All Requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[18px] border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
              placeholder="Search by description, category..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {(search || statusFilter !== 'all') && (
            <>
              <div className="h-8 w-[1px] bg-outline-variant" />
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear
              </button>
            </>
          )}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-outline text-5xl mb-4 block">build</span>
            <h3 className="text-lg font-semibold text-on-surface mb-2">No maintenance requests</h3>
            <p className="text-sm text-on-surface-variant">You haven't submitted any maintenance requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">
                        {CATEGORY_ICONS[request.category] || 'build'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-on-surface capitalize">{request.category}</h3>
                      <p className="text-xs text-on-surface-variant">{request.propertyName} — Unit {request.unitNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[request.priority] || ''}`}>
                      {request.priority.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[request.status] || ''}`}>
                      {STATUS_LABELS[request.status] || request.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mb-3">{request.description}</p>

                {request.progress !== undefined && request.progress > 0 && request.status !== 'completed' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Progress</span>
                      <span className="font-bold">{request.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${request.progress}%` }} />
                    </div>
                  </div>
                )}

                {request.assignedTo && (
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Assigned to: <span className="font-medium">{request.assignedTo}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {new Date(request.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {request.completedAt && (
                    <span className="flex items-center gap-1 text-success">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Completed {new Date(request.completedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
