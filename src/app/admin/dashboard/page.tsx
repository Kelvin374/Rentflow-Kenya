'use client';

import { useEffect, useState, useCallback } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { fetchDashboardStats, fetchProperties, fetchPayments, fetchMaintenance, fetchRevenueData } from '@/lib/supabase-api';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats, Property, Payment, MaintenanceRequest, RevenueData } from '@/types';

export default function AdminDashboardPage() {
  const [greeting, setGreeting] = useState('Dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning, Admin');
    else if (hour < 18) setGreeting('Good Afternoon, Admin');
    else setGreeting('Good Evening, Admin');
  }, []);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchDashboardStats(), fetchProperties(), fetchPayments(), fetchMaintenance(), fetchRevenueData()])
      .then(([s, p, pay, m, rev]) => {
        setStats(s);
        setProperties(p);
        setPayments(pay);
        setMaintenance(m);
        setRevenueData(rev);
      })
      .catch((e) => setError(e?.message || 'Failed to load admin dashboard. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const s = stats || {
    totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
    monthlyRevenue: 0, occupancyRate: 0, pendingPayments: 0,
    overdueAmount: 0, activeMaintenance: 0, totalTenants: 0,
  } as DashboardStats;

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const overduePayments = payments.filter((p) => p.status === 'overdue');
  const activeMaintenance = maintenance.filter((m) => m.status !== 'completed' && m.status !== 'cancelled');

  const recentPayments = payments.slice(0, 5);
  const recentMaintenance = maintenance.slice(0, 3);

  const displayRevenueData = revenueData.length > 0 ? revenueData : [{ month: 'No Data', amount: 0 }];
  const maxRevenue = Math.max(...displayRevenueData.map((d) => d.amount), 1);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 flex justify-between items-center px-6 bg-surface border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <header className="h-16 flex justify-between items-center px-6 bg-surface border-b border-outline-variant sticky top-0 z-40">
        <div className="flex items-center gap-8">
          <h2 className="text-[24px] leading-[32px] font-bold text-primary">{greeting}</h2>
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary"
              placeholder="Search analytics..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:bg-surface-container-high p-2 rounded-full transition-transform active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
            <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              AD
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Properties', value: s.totalProperties.toString(), icon: 'domain', trend: 'Active', trendUp: true },
            { label: 'Total Tenants', value: s.totalTenants.toString(), icon: 'groups', trend: 'Active', trendUp: true },
            { label: 'Total Units', value: s.totalUnits.toString(), icon: 'meeting_room', trend: `${s.occupiedUnits} occupied`, trendUp: true },
            { label: 'Active Maintenance', value: s.activeMaintenance.toString(), icon: 'build', trend: 'Open tickets', trendUp: s.activeMaintenance === 0 },
            { label: 'Monthly Revenue', value: formatCurrency(s.monthlyRevenue), icon: 'payments', trend: 'This month', trendUp: true, highlight: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface p-6 rounded-lg border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-secondary uppercase tracking-wider">{stat.label}</span>
                <span className="material-symbols-outlined text-primary bg-primary-fixed p-1 rounded">{stat.icon}</span>
              </div>
              <div className={`text-[24px] leading-[32px] font-bold ${stat.highlight ? 'text-primary' : ''}`}>{stat.value}</div>
              <div className={`text-xs mt-2 flex items-center gap-1 ${stat.trendUp ? 'text-green-600' : 'text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-sm">{stat.trendUp ? 'trending_up' : 'trending_flat'}</span>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface rounded-xl border border-outline-variant p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Revenue Analytics</h3>
                <p className="text-[14px] leading-[20px] text-on-surface-variant">Financial performance across all properties.</p>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {displayRevenueData.map((data) => (
                <div
                  key={data.month}
                  className="flex-1 bg-primary rounded-t-lg transition-all hover:opacity-80 cursor-pointer group relative"
                  style={{ height: `${(data.amount / maxRevenue) * 100}%`, opacity: 0.6 + (data.amount / maxRevenue) * 0.4 }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">{data.month}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-4">
              {displayRevenueData.map((data) => (
                <span key={data.month} className="text-xs text-on-surface-variant">{data.month}</span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-surface rounded-xl border border-outline-variant p-6 flex flex-col">
            <h3 className="font-bold text-sm text-on-surface mb-4">Payment Status</h3>
            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Paid</span>
                  <span className="font-bold text-green-600">{paidPayments.length}</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Pending</span>
                  <span className="font-bold text-yellow-600">{pendingPayments.length}</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{ width: `${payments.length > 0 ? (pendingPayments.length / payments.length) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Overdue</span>
                  <span className="font-bold text-red-600">{overduePayments.length}</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: `${payments.length > 0 ? (overduePayments.length / payments.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Collection Rate</span>
                <span className="font-bold">{payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface mb-4">Properties ({properties.length})</h3>
            <div className="space-y-3">
              {properties.slice(0, 4).map((prop) => (
                <div key={prop.id} className="p-3 rounded-lg bg-surface-container-low flex gap-3 items-center">
                  <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">domain</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{prop.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{prop.location}</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary">{prop.units} units</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface mb-4">Recent Payments</h3>
            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">No payments recorded</p>
              ) : recentPayments.map((pay) => (
                <div key={pay.id} className="p-3 rounded-lg bg-surface-container-low flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    pay.status === 'paid' ? 'bg-green-100' : pay.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      pay.status === 'paid' ? 'text-green-600' : pay.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {pay.status === 'paid' ? 'check_circle' : pay.status === 'pending' ? 'schedule' : 'error'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{pay.tenantName}</p>
                    <p className="text-[10px] text-on-surface-variant">{pay.unitNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{formatCurrency(pay.amount)}</p>
                    <p className="text-[10px] text-on-surface-variant capitalize">{pay.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface mb-4">Active Maintenance ({activeMaintenance.length})</h3>
            <div className="space-y-3">
              {recentMaintenance.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-4">No active maintenance</p>
              ) : recentMaintenance.map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-surface-container-low flex gap-3 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    m.priority === 'urgent' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      m.priority === 'urgent' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {m.category === 'plumbing' ? 'plumbing' : m.category === 'electrical' ? 'bolt' : 'build'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{m.description}</p>
                    <p className="text-[10px] text-on-surface-variant">{m.propertyName}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    m.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {m.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-8"></div>
      </div>

      <footer className="bg-surface-container-highest border-t border-outline-variant px-6 py-2 flex justify-between items-center shrink-0">
        <p className="text-xs text-on-surface-variant">© 2026 RentFlow Kenya. All rights reserved.</p>
        <div className="flex gap-8">
          <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Help Center</a>
          <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
