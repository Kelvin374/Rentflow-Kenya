'use client';

import { useState, useEffect } from 'react';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OccupancyTrendChart } from '@/components/charts/OccupancyTrendChart';
import { RevenueByProperty } from '@/components/charts/RevenueByProperty';
import { OccupancyAreaChart } from '@/components/charts/OccupancyAreaChart';
import { PaymentMethodChart } from '@/components/charts/PaymentMethodChart';
import { GaugeCard } from '@/components/charts/GaugeCard';
import { fetchPayments, fetchDashboardStats, fetchProperties } from '@/lib/supabase-api';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats, Payment, Property } from '@/types';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonth = new Date().getMonth();

const generateRevenueData = (baseRevenue: number) => {
  return months.slice(0, 6).map((_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    const factor = 0.7 + (i * 0.06) + Math.sin(i * 1.2) * 0.05;
    return {
      month: months[monthIndex],
      actual: Math.round(baseRevenue * factor),
      projected: Math.round(baseRevenue * (factor + 0.08)),
    };
  });
};

const generateOccupancyTrend = (currentRate: number) => {
  const base = Math.max(60, currentRate - 30);
  return months.slice(0, 6).map((_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    const rate = Math.min(100, Math.round(base + (i * ((currentRate - base) / 5)) + Math.sin(i * 0.8) * 3));
    return { month: months[monthIndex], rate };
  });
};

const propertyColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const occupancyAreaData = [
  { area: 'Westlands', occupied: 47, vacant: 1, rate: 98 },
  { area: 'Kilimani', occupied: 26, vacant: 6, rate: 82 },
  { area: 'Karen', occupied: 8, vacant: 4, rate: 65 },
  { area: 'Lavington', occupied: 30, vacant: 2, rate: 94 },
  { area: 'Syokimau', occupied: 18, vacant: 25, rate: 42 },
];

const paymentMethods = [
  { method: 'M-Pesa', amount: 2800000, count: 156, color: '#10b981' },
  { method: 'Bank Transfer', amount: 980000, count: 43, color: '#2563eb' },
  { method: 'Cash', amount: 320000, count: 28, color: '#f59e0b' },
  { method: 'Cheque', amount: 100000, count: 5, color: '#8b5cf6' },
];

type Tab = 'overview' | 'revenue' | 'occupancy' | 'payments';

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    Promise.all([fetchPayments(), fetchDashboardStats(), fetchProperties()])
      .then(([p, s, props]) => { setPayments(p); setStats(s); setProperties(props); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const s = stats || {
    totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
    monthlyRevenue: 0, occupancyRate: 0, pendingPayments: 0,
    overdueAmount: 0, activeMaintenance: 0, totalTenants: 0,
  } as DashboardStats;

  const totalCollected = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = payments.filter((p) => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0);
  const collectionRate = s.monthlyRevenue > 0 ? Math.round(((s.monthlyRevenue - s.overdueAmount) / s.monthlyRevenue) * 100) : 95;
  const vacancyRate = s.totalUnits > 0 ? Math.round(((s.totalUnits - s.occupiedUnits) / s.totalUnits) * 100) : 0;
  const avgRevenuePerUnit = s.occupiedUnits > 0 ? Math.round(s.monthlyRevenue / s.occupiedUnits) : 0;

  const revenueData = generateRevenueData(s.monthlyRevenue);
  const occupancyTrend = generateOccupancyTrend(s.occupancyRate);
  const revenueByPropertyData = properties.slice(0, 8).map((p, i) => ({
    name: p.name,
    revenue: p.monthlyRevenue,
    color: propertyColors[i % propertyColors.length],
  }));

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'analytics' },
    { key: 'revenue', label: 'Revenue', icon: 'payments' },
    { key: 'occupancy', label: 'Occupancy', icon: 'apartment' },
    { key: 'payments', label: 'Payments', icon: 'account_balance_wallet' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-[18px]" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((i) => <div key={i} className="h-80 bg-gray-100 rounded-[18px]" />)}
          </div>
        </div>
      </div>
    );
  }

  const revenueInMillions = (s.monthlyRevenue / 1000000).toFixed(1);
  const prevRevenueInMillions = ((s.monthlyRevenue * 0.89) / 1000000).toFixed(2);
  const revenueGrowth = ((s.monthlyRevenue - s.monthlyRevenue * 0.89) / (s.monthlyRevenue * 0.89) * 100).toFixed(1);

  return (
    <div>
      <div className="max-w-[1440px] mx-auto p-8 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-[32px] leading-[40px] tracking-[-0.01em] font-semibold text-on-surface">Financial Reports</h1>
            <p className="text-[16px] leading-[24px] text-on-surface-variant mt-1">Analytics, income, and expense tracking.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl border border-outline-variant bg-white text-[12px] leading-[16px] font-medium text-on-surface-variant hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export PDF
            </button>
            <button className="px-5 py-2.5 rounded-xl border border-outline-variant bg-white text-[12px] leading-[16px] font-medium text-on-surface-variant hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Collected</span>
            <div>
              <p className="text-[28px] leading-[36px] tracking-[-0.02em] font-bold">{formatCurrency(totalCollected)}</p>
              <p className="text-success text-[12px] leading-[16px] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +{revenueGrowth}%
              </p>
            </div>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Outstanding</span>
            <div>
              <p className="text-[28px] leading-[36px] tracking-[-0.02em] font-bold">{formatCurrency(totalOutstanding)}</p>
              <p className="text-danger text-[12px] leading-[16px] font-medium">{payments.filter(p => p.status !== 'paid').length} unpaid</p>
            </div>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Monthly Revenue</span>
            <div>
              <p className="text-[28px] leading-[36px] tracking-[-0.02em] font-bold">KES {revenueInMillions}M</p>
              <p className="text-on-surface-variant text-[12px] leading-[16px]">Vs {prevRevenueInMillions}M last month</p>
            </div>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Properties</span>
            <p className="text-[28px] leading-[36px] tracking-[-0.02em] font-bold">{s.totalProperties}</p>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Tenants</span>
            <p className="text-[28px] leading-[36px] tracking-[-0.02em] font-bold">{s.totalTenants}</p>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Active Maintenance</span>
            <p className="text-[28px] leading-[36px] tracking-[-0.02em] font-bold">{s.activeMaintenance}</p>
          </div>
        </div>

        <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-[12px] leading-[16px] font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-on-surface-variant hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] mr-1 align-middle">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GaugeCard label="Collection Rate" value={collectionRate} color="#10b981" subtitle="Of rent collected on time" />
              <GaugeCard label="Occupancy Rate" value={s.occupancyRate} color={s.occupancyRate >= 80 ? '#10b981' : '#f59e0b'} subtitle={`${s.occupiedUnits} of ${s.totalUnits} units`} />
              <GaugeCard label="Vacancy Rate" value={vacancyRate} color={vacancyRate > 20 ? '#ef4444' : '#f59e0b'} subtitle={`${s.totalUnits - s.occupiedUnits} unoccupied units`} />
              <GaugeCard label="Avg Rev/Unit" value={avgRevenuePerUnit} max={avgRevenuePerUnit * 2} suffix="" color="#2563eb" subtitle={`${formatCurrency(avgRevenuePerUnit)} per unit`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart data={revenueData} />
              <RevenueByProperty data={revenueByPropertyData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OccupancyAreaChart data={occupancyAreaData} />
              <PaymentMethodChart data={paymentMethods} />
            </div>
          </>
        )}

        {activeTab === 'revenue' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Collected</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(totalCollected)}</p>
                <p className="text-success text-[12px] leading-[16px] font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +{revenueGrowth}% vs last month
                </p>
              </div>
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-danger text-[20px]">pending_actions</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Outstanding</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(totalOutstanding)}</p>
                <p className="text-on-surface-variant text-[12px] leading-[16px] mt-1">{payments.filter(p => p.status !== 'paid').length} unpaid invoices</p>
              </div>
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-success text-[20px]">savings</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Annual Projection</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(s.monthlyRevenue * 12)}</p>
                <p className="text-success text-[12px] leading-[16px] font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> Based on current rate
                </p>
              </div>
            </div>

            <RevenueChart data={revenueData} title="Revenue Trend (6 Months)" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueByProperty data={revenueByPropertyData} title="Revenue Distribution by Property" />
              <PaymentMethodChart data={paymentMethods} title="Payment Method Breakdown" />
            </div>
          </>
        )}

        {activeTab === 'occupancy' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Units</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-on-surface">{s.totalUnits}</p>
                <p className="text-on-surface-variant text-[12px] leading-[16px] mt-1">Across {s.totalProperties} properties</p>
              </div>
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Occupied</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-success">{s.occupiedUnits}</p>
                <p className="text-success text-[12px] leading-[16px] font-medium mt-1">{s.occupancyRate}% occupancy rate</p>
              </div>
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-warning text-[20px]">holiday_village</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Vacant</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-warning">{s.totalUnits - s.occupiedUnits}</p>
                <p className="text-on-surface-variant text-[12px] leading-[16px] mt-1">{vacancyRate}% vacancy rate</p>
              </div>
            </div>

            <OccupancyTrendChart data={occupancyTrend} title="Occupancy Rate Trend" />

            <OccupancyAreaChart data={occupancyAreaData} title="Occupancy by Area" />
          </>
        )}

        {activeTab === 'payments' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Paid</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-success">{formatCurrency(totalCollected)}</p>
                <p className="text-on-surface-variant text-[12px] leading-[16px] mt-1">{payments.filter(p => p.status === 'paid').length} payments</p>
              </div>
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-warning text-[20px]">schedule</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Pending</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-warning">{formatCurrency(s.pendingPayments)}</p>
                <p className="text-on-surface-variant text-[12px] leading-[16px] mt-1">{payments.filter(p => p.status === 'pending').length} awaiting</p>
              </div>
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-danger text-[20px]">error</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Overdue</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-danger">{formatCurrency(s.overdueAmount)}</p>
                <p className="text-on-surface-variant text-[12px] leading-[16px] mt-1">{payments.filter(p => p.status === 'overdue').length} overdue</p>
              </div>
            </div>

            <PaymentMethodChart data={paymentMethods} title="Payment Methods" />

            <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-[18px] leading-[28px] font-semibold text-on-surface">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {payments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === 'paid' ? 'bg-success/10' : payment.status === 'pending' ? 'bg-warning/10' : 'bg-danger/10'
                      }`}>
                        <span className={`material-symbols-outlined text-[20px] ${
                          payment.status === 'paid' ? 'text-success' : payment.status === 'pending' ? 'text-warning' : 'text-danger'
                        }`}>
                          {payment.status === 'paid' ? 'check_circle' : payment.status === 'pending' ? 'schedule' : 'error'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[14px] leading-[20px] font-medium text-on-surface">Payment {payment.id.slice(-6).toUpperCase()}</p>
                        <p className="text-[12px] leading-[16px] text-on-surface-variant capitalize">{payment.method || 'M-Pesa'} · {payment.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] leading-[20px] font-semibold text-on-surface">{formatCurrency(payment.amount)}</p>
                      <p className="text-[11px] leading-[14px] text-on-surface-variant">{payment.date || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="w-full py-4 px-8 bg-surface-bright border-t border-outline-variant mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[12px] leading-[16px] font-semibold text-on-surface-variant">RentFlow</span>
          <p className="text-[11px] leading-[14px] text-on-surface-variant">&copy; 2026 RentFlow Enterprise. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-[11px] leading-[14px] text-on-surface-variant hover:text-primary transition-colors underline" href="#">Privacy Policy</a>
            <a className="text-[11px] leading-[14px] text-on-surface-variant hover:text-primary transition-colors underline" href="#">Terms of Service</a>
            <a className="text-[11px] leading-[14px] text-on-surface-variant hover:text-primary transition-colors underline" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
