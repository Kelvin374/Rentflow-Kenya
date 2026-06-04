'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, TrendingUp, Users, Banknote, AlertTriangle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { RevenueChart } from '@/components/RevenueChart';
import { PropertyCard } from '@/components/PropertyCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { fetchDashboardStats, fetchProperties, fetchMaintenance, fetchRevenueData } from '@/lib/supabase-api';
import type { DashboardStats, Property, MaintenanceRequest, RevenueData } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchProperties(),
      fetchMaintenance(),
      fetchRevenueData(),
    ]).then(([s, p, m, r]) => {
      setStats(s);
      setProperties(p);
      setMaintenance(m);
      setRevenueData(r);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

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

  const statsData = stats || {
    totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
    monthlyRevenue: 0, occupancyRate: 0, pendingPayments: 0, overdueAmount: 0,
    activeMaintenance: 0, totalTenants: 0,
  };
  const activeMaintenance = maintenance.filter((m) => m.status !== 'completed').slice(0, 3);

  return (
    <div>
      <Header title="Portfolio Overview" subtitle="Nairobi Region" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Welcome back, managing {statsData.totalUnits} units across Nairobi today.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/reports"><Button variant="outline" size="sm">Report</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Properties" value={statsData.totalProperties.toString()} subtitle="+1 this month" icon={Building2} variant="primary" trend="+1 this month" trendUp />
          <StatsCard title="Monthly Income" value={formatCurrency(statsData.monthlyRevenue)} subtitle="92% Collected" icon={Banknote} variant="success" trend="92% Collected" trendUp />
          <StatsCard title="Occupancy Rate" value={`${statsData.occupancyRate}%`} subtitle={`${statsData.occupiedUnits} / ${statsData.totalUnits} Units Occupied`} icon={Users} variant="primary" />
          <StatsCard title="Overdue Payments" value={formatCurrency(statsData.overdueAmount)} subtitle="3 Tenants Late" icon={AlertTriangle} variant="danger" trend="3 Tenants Late" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} />
          </div>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Maintenance</h3>
              <p className="text-xs text-gray-400">{statsData.activeMaintenance} ACTIVE</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeMaintenance.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No active maintenance requests</p>
              ) : activeMaintenance.map((req) => (
                <Link key={req.id} href={`/maintenance/${req.id}`} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${getStatusColor(req.priority)}`}>
                    {req.category === 'plumbing' ? '🔧' : req.category === 'electrical' ? '⚡' : req.category === 'painting' ? '🎨' : '🔨'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{req.description}</p>
                    <p className="text-xs text-gray-400">
                      {req.priority.toUpperCase()} &bull; {req.propertyName}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
                </Link>
              ))}
              <Link href="/maintenance"><Button variant="ghost" size="sm" className="w-full text-primary">View All Requests</Button></Link>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Managed Properties</h2>
            <Link href="/properties"><Button variant="ghost" size="sm" className="text-primary">Explore Portfolio <ArrowRight size={16} /></Button></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.slice(0, 3).map((p) => (
              <PropertyCard key={p.id} property={p} href={`/properties/${p.id}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
