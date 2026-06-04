'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { TenantTable } from '@/components/TenantTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, CheckCircle, AlertTriangle, Calendar, Download, UserPlus } from 'lucide-react';
import { fetchTenants } from '@/lib/supabase-api';
import type { Tenant } from '@/types';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  useEffect(() => {
    fetchTenants().then(setTenants).catch(console.error).finally(() => setLoading(false));
  }, []);

  const uniqueProperties = [...new Set(tenants.map((t) => t.propertyName))];
  const filteredTenants = tenants.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (propertyFilter !== 'all' && t.propertyName !== propertyFilter) return false;
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
      alert(`Tenant ${tenantId} removed (demo)`);
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

  return (
    <div>
      <Header title="Tenant Management" subtitle="Overview of all current residents across your portfolio" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Tenants" value={tenants.length.toString()} subtitle="+4% this month" icon={Users} trend="+4% this month" trendUp />
          <StatsCard title="Paid Early" value={earlyCount.toString()} subtitle="This month" icon={CheckCircle} variant="success" />
          <StatsCard title="Overdue Payments" value={overdueCount.toString()} subtitle="Need attention" icon={AlertTriangle} variant="danger" />
          <StatsCard title="Leases Expiring" value={`${expiringCount}`} subtitle="In 30 days" icon={Calendar} variant="warning" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">All Properties</option>
              {uniqueProperties.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => alert('Exporting tenant list...')}><Download size={16} /> Export List</Button>
            <Link href="/tenants/new"><Button size="sm"><UserPlus size={16} /> Add New Tenant</Button></Link>
          </div>
        </div>

        <TenantTable tenants={filteredTenants} onDelete={handleDelete} />
      </div>
    </div>
  );
}
