'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { TenantTable } from '@/components/TenantTable';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, CheckCircle, AlertTriangle, Calendar, Download, UserPlus } from 'lucide-react';
import { fetchTenants } from '@/lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { RoleGuard } from '@/components/RoleGuard';
import type { Tenant } from '@/types';

export default function TenantsPage() {
  return (
    <RoleGuard allowedRoles={['landlord']}>
      <TenantsContent />
    </RoleGuard>
  );
}

function TenantsContent() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadData = useCallback(() => {
    const landlordId = user?.role === 'landlord' ? user.id : undefined;
    setLoading(true);
    setError(null);
    fetchTenants(landlordId).then(setTenants).catch((e) => setError(e?.message || 'Failed to load tenants. Please try again.')).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const uniqueProperties = [...new Set(tenants.map((t) => t.propertyName))];
  const filteredTenants = tenants.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (propertyFilter !== 'all' && t.propertyName !== propertyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.name.toLowerCase().includes(q) &&
        !t.email.toLowerCase().includes(q) &&
        !t.phone?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const earlyCount = tenants.filter((t) => t.status === 'paid').length;
  const overdueCount = tenants.filter((t) => t.status === 'overdue').length;
  const expiringCount = tenants.filter((t) => {
    if (!t.leaseEnd) return false;
    const daysLeft = (new Date(t.leaseEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 30;
  }).length;

  const handleDelete = (tenantId: string) => {
    if (confirm('Are you sure you want to remove this tenant?')) {
      // TODO: implement real tenant deletion via Supabase
      console.warn('Tenant deletion not yet implemented:', tenantId);
    }
  };

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
      <Header title="Tenant Management" subtitle="Overview of all current residents across your portfolio" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Tenants" value={tenants.length.toString()} subtitle="Across all properties" icon={Users} />
          <StatsCard title="Paid Early" value={earlyCount.toString()} subtitle="This month" icon={CheckCircle} variant="success" />
          <StatsCard title="Overdue Payments" value={overdueCount.toString()} subtitle="Need attention" icon={AlertTriangle} variant="danger" />
          <StatsCard title="Leases Expiring" value={`${expiringCount}`} subtitle="In 30 days" icon={Calendar} variant="warning" />
        </div>

        <div className="bg-white p-4 rounded-[18px] border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
              placeholder="Search by name, email, or phone..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Properties</option>
              {uniqueProperties.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {(search || statusFilter !== 'all' || propertyFilter !== 'all') && (
            <>
              <div className="h-8 w-[1px] bg-outline-variant" />
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); setPropertyFilter('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear ({filteredTenants.length}/{tenants.length})
              </button>
            </>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm"><Download size={16} /> Export</Button>
            <Link href="/tenants/new"><Button size="sm"><UserPlus size={16} /> Add Tenant</Button></Link>
          </div>
        </div>

        <TenantTable tenants={filteredTenants} onDelete={handleDelete} />
      </div>
    </div>
  );
}
