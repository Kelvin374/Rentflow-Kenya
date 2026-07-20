'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MaintenanceBoard } from '@/components/MaintenanceBoard';
import { StatsCard } from '@/components/StatsCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Wrench, Clock, Users, TrendingUp, Plus, Construction } from 'lucide-react';
import { fetchLandlordMaintenance } from '@/lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { RoleGuard } from '@/components/RoleGuard';
import type { MaintenanceRequest } from '@/types';

export default function MaintenancePage() {
  return (
    <RoleGuard allowedRoles={['landlord']}>
      <MaintenanceContent />
    </RoleGuard>
  );
}

function MaintenanceContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLandlordMaintenance(user?.id || '').then(setRequests).catch((e: any) => setError(e?.message || 'Failed to load maintenance requests. Please try again.')).finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  useRealtimeSubscription(
    'maintenance-list',
    [{ event: '*', table: 'maintenance_requests' }],
    () => loadData()
  );

  const active = requests.filter((m) => m.status !== 'completed').length;
  const completed = requests.filter((m) => m.status === 'completed').length;
  const avgTime = requests.length > 0
    ? requests.reduce((s, m) => s + (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60), 0) / requests.length
    : 0;
  const resolutionRate = requests.length > 0 ? Math.round((completed / requests.length) * 100) : 0;

  const filteredRequests = requests.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && m.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !m.description?.toLowerCase().includes(q) &&
        !m.propertyName?.toLowerCase().includes(q) &&
        !m.unitNumber?.toLowerCase().includes(q) &&
        !m.tenantName?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div>
      <Header title="Maintenance Tracking" subtitle={`Managing ${active} active maintenance requests across your portfolio`} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Submitted" value={requests.filter(m => m.status === 'submitted').length.toString()} icon={Wrench} variant="warning" />
          <StatsCard title="In Progress" value={requests.filter(m => m.status === 'in_progress').length.toString()} icon={Construction} variant="primary" />
          <StatsCard title="Completed" value={completed.toString()} subtitle="This month" icon={TrendingUp} variant="success" />
          <StatsCard title="Resolution Rate" value={`${resolutionRate}%`} subtitle="Completed vs total" icon={TrendingUp} variant="success" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
              placeholder="Search by description, property, unit, or tenant..."
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
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          {(search || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <>
              <div className="h-8 w-[1px] bg-outline-variant" />
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear ({filteredRequests.length}/{requests.length})
              </button>
            </>
          )}
          <div className="ml-auto">
            <Link href="/maintenance/new"><Button><Plus size={16} /> New Ticket</Button></Link>
          </div>
        </div>

        <MaintenanceBoard requests={filteredRequests} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolution Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">{resolutionRate}%</p>
                <p className="text-xs text-gray-400 mt-1">Based on completed vs total requests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Time to Fix</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(avgTime)} Hours</p>
                <p className="text-xs text-gray-400 mt-1">Includes procurement and transit time</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">{resolutionRate}%</p>
                <p className="text-xs text-gray-400 mt-1">Based on completed vs total requests</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
