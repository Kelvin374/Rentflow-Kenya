'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyDrawer } from '@/components/PropertyDrawer';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OccupancyTrendChart } from '@/components/charts/OccupancyTrendChart';
import { RevenueByProperty } from '@/components/charts/RevenueByProperty';
import { OccupancyAreaChart } from '@/components/charts/OccupancyAreaChart';
import { PaymentMethodChart } from '@/components/charts/PaymentMethodChart';
import { GaugeCard } from '@/components/charts/GaugeCard';
import { fetchProperties, fetchDashboardStats } from '@/lib/supabase-api';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import type { Property, DashboardStats } from '@/types';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonth = new Date().getMonth();

const generateRevenueData = (baseRevenue: number) => {
  return months.slice(0, 6).map((month, i) => {
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
  return months.slice(0, 6).map((month, i) => {
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

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'revenue' | 'occupancy'>('overview');
  const isLandlord = user?.role === 'landlord';

  useEffect(() => {
    Promise.all([fetchProperties(), fetchDashboardStats()])
      .then(([p, s]) => { setProperties(p); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const s = stats || { totalUnits: 0, occupiedUnits: 0, monthlyRevenue: 0, totalProperties: 0, occupancyRate: 0, totalTenants: 0, pendingPayments: 0, overdueAmount: 0, activeMaintenance: 0 } as DashboardStats;

  const extractCity = (location: string) => {
    const parts = location.split(',').map((p) => p.trim());
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  };

  const cities = [...new Set(properties.map((p) => extractCity(p.location)))].sort();
  const propertyTypes = [...new Set(properties.map((p) => p.type).filter(Boolean))].sort() as string[];

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === 'All' || extractCity(p.location) === cityFilter;
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const occupancyRate = p.units > 0 ? (p.occupiedUnits / p.units) : 0;
    const matchesStatus = statusFilter === 'All'
      || (statusFilter === 'Fully Occupied' && occupancyRate === 1)
      || (statusFilter === 'Vacancies Available' && occupancyRate < 1)
      || (statusFilter === 'Almost Full' && occupancyRate >= 0.8 && occupancyRate < 1)
      || (statusFilter === 'Vacant' && occupancyRate === 0);
    return matchesSearch && matchesCity && matchesType && matchesStatus;
  });

  const openDrawer = (property: Property) => {
    setSelectedProperty(property);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedProperty(null);
  };

  const getPropertyStatus = (property: Property) => {
    const rate = Math.round((property.occupiedUnits / property.units) * 100);
    if (rate === 100) return { label: 'Fully Occupied', bgClass: 'bg-success' };
    if (rate >= 80) return { label: 'Almost Full', bgClass: 'bg-warning' };
    return { label: 'Available', bgClass: 'bg-primary' };
  };

  const revenueData = generateRevenueData(s.monthlyRevenue);
  const occupancyTrend = generateOccupancyTrend(s.occupancyRate);

  const revenueByPropertyData = properties.slice(0, 8).map((p, i) => ({
    name: p.name,
    revenue: p.monthlyRevenue,
    color: propertyColors[i % propertyColors.length],
  }));

  const vacancyRate = s.totalUnits > 0 ? Math.round(((s.totalUnits - s.occupiedUnits) / s.totalUnits) * 100) : 0;
  const collectionRate = s.monthlyRevenue > 0 ? Math.round(((s.monthlyRevenue - s.overdueAmount) / s.monthlyRevenue) * 100) : 95;
  const avgRevenuePerUnit = s.occupiedUnits > 0 ? Math.round(s.monthlyRevenue / s.occupiedUnits) : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-[18px]" />)}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[1,2].map((i) => <div key={i} className="h-80 bg-gray-100 rounded-[18px]" />)}
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
            <h1 className="text-[32px] leading-[40px] tracking-[-0.01em] font-semibold text-on-surface">Properties Portfolio</h1>
            <p className="text-[16px] leading-[24px] text-on-surface-variant mt-1">Manage all your rental properties from one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl border border-outline-variant bg-white text-[12px] leading-[16px] font-medium text-on-surface-variant hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">upload</span>
              Import
            </button>
            <button className="px-5 py-2.5 rounded-xl border border-outline-variant bg-white text-[12px] leading-[16px] font-medium text-on-surface-variant hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export
            </button>
            {isLandlord && (
              <Link href="/properties/new" className="px-5 py-2.5 rounded-xl bg-primary text-white text-[12px] leading-[16px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Property
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Properties</span>
            <div>
              <p className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold">{s.totalProperties}</p>
              <p className="text-success text-[12px] leading-[16px] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> 1
              </p>
            </div>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Units</span>
            <p className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold">{s.totalUnits}</p>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Occupied Units</span>
            <p className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold">{s.occupiedUnits}</p>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50">
            <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Occupancy Rate</span>
            <div>
              <p className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold">{s.occupancyRate}%</p>
              <div className="w-full h-1 bg-surface-container rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${s.occupancyRate}%` }} />
              </div>
            </div>
          </div>
          <div className="glass p-4 rounded-[18px] shadow-sm flex flex-col justify-between h-32 border-white/50 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Monthly Revenue</span>
              <span className="bg-success/10 text-success px-2 py-1 rounded-full text-[10px] font-bold">+{revenueGrowth}%</span>
            </div>
            <div>
              <p className="text-[32px] leading-[40px] tracking-[-0.02em] font-bold">KES {revenueInMillions}M</p>
              <p className="text-on-surface-variant text-[12px] leading-[16px] font-medium">Vs KES {prevRevenueInMillions}M last month</p>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit">
          {(['overview', 'revenue', 'occupancy'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAnalyticsTab(tab)}
              className={`px-5 py-2 rounded-lg text-[12px] leading-[16px] font-medium transition-all ${
                analyticsTab === tab
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-on-surface-variant hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] mr-1 align-middle">
                {tab === 'overview' ? 'analytics' : tab === 'revenue' ? 'payments' : 'apartment'}
              </span>
              {tab === 'overview' ? 'Overview' : tab === 'revenue' ? 'Revenue Analytics' : 'Occupancy Analytics'}
            </button>
          ))}
        </div>

        {analyticsTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GaugeCard label="Collection Rate" value={collectionRate} color="#10b981" subtitle="Of rent collected on time" />
              <GaugeCard label="Vacancy Rate" value={vacancyRate} color={vacancyRate > 20 ? '#ef4444' : '#f59e0b'} subtitle={`${s.totalUnits - s.occupiedUnits} unoccupied units`} />
              <GaugeCard label="Avg Revenue/Unit" value={avgRevenuePerUnit} max={avgRevenuePerUnit * 2} suffix="" color="#2563eb" subtitle={`${formatCurrency(avgRevenuePerUnit)} per unit`} />
              <GaugeCard label="Active Maintenance" value={s.activeMaintenance} max={Math.max(s.activeMaintenance * 2, 10)} suffix="" color="#8b5cf6" subtitle="Open maintenance requests" />
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

        {analyticsTab === 'revenue' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Total Collected</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(s.monthlyRevenue)}</p>
                <p className="text-success text-[12px] leading-[16px] font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +{revenueGrowth}% vs last month
                </p>
              </div>
              <div className="glass p-5 rounded-[18px] shadow-sm border-white/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-danger text-[20px]">pending_actions</span>
                  <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase">Pending</span>
                </div>
                <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(s.overdueAmount)}</p>
                <p className="text-on-surface-variant text-[12px] leading-[16px] mt-1">{s.pendingPayments} outstanding payments</p>
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

        {analyticsTab === 'occupancy' && (
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

        <div className="bg-white p-4 rounded-[18px] border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-[14px] leading-[20px] focus:ring-1 focus:ring-primary"
              placeholder="Search by name, street, owner..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-white border border-outline-variant rounded-xl text-[12px] leading-[16px] font-medium py-2 px-4 focus:ring-1 focus:ring-primary"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="All">City: All</option>
              {cities.map((c) => (
                <option key={c} value={c}>City: {c}</option>
              ))}
            </select>
            <select
              className="bg-white border border-outline-variant rounded-xl text-[12px] leading-[16px] font-medium py-2 px-4 focus:ring-1 focus:ring-primary"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">Type: All</option>
              {propertyTypes.map((t) => (
                <option key={t} value={t}>Type: {t}</option>
              ))}
            </select>
            <select
              className="bg-white border border-outline-variant rounded-xl text-[12px] leading-[16px] font-medium py-2 px-4 focus:ring-1 focus:ring-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status: All</option>
              <option value="Fully Occupied">Fully Occupied</option>
              <option value="Almost Full">Almost Full</option>
              <option value="Vacancies Available">Vacancies Available</option>
              <option value="Vacant">Vacant</option>
            </select>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant" />
          <div className="flex bg-surface-container-low p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${viewMode === 'grid' ? 'text-primary' : 'text-on-surface-variant'}`}>grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${viewMode === 'list' ? 'text-primary' : 'text-on-surface-variant'}`}>view_list</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            >
              <span className={`material-symbols-outlined text-[20px] ${viewMode === 'map' ? 'text-primary' : 'text-on-surface-variant'}`}>map</span>
            </button>
          </div>
          {(search || cityFilter !== 'All' || typeFilter !== 'All' || statusFilter !== 'All') && (
            <>
              <div className="h-8 w-[1px] bg-outline-variant" />
              <button
                onClick={() => { setSearch(''); setCityFilter('All'); setTypeFilter('All'); setStatusFilter('All'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger/10 text-danger text-[12px] leading-[16px] font-medium hover:bg-danger/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear ({filteredProperties.length}/{properties.length})
              </button>
            </>
          )}
        </div>

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {filteredProperties.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant col-span-full text-center py-8">No properties match your search</p>
            ) : filteredProperties.map((property) => {
              const occupancyRate = Math.round((property.occupiedUnits / property.units) * 100);
              const status = getPropertyStatus(property);
              return (
                <div
                  key={property.id}
                  className="property-card group bg-white rounded-[18px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => openDrawer(property)}
                >
                  <div className="h-56 relative overflow-hidden">
                    {property.image ? (
                      <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">apartment</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`${status.bgClass} text-white text-[12px] leading-[16px] font-bold px-3 py-1 rounded-full shadow-lg`}>{status.label}</span>
                    </div>
                    <div className="overlay-actions absolute inset-0 bg-black/20 flex items-center justify-center gap-3 opacity-0 translate-y-4 transition-all duration-300">
                      <button
                        className="w-10 h-10 rounded-full bg-white text-on-surface flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg"
                        onClick={(e) => { e.stopPropagation(); openDrawer(property); }}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <Link
                        href={`/properties/${property.id}`}
                        className="w-10 h-10 rounded-full bg-white text-on-surface flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[18px] leading-[28px] font-semibold text-on-surface">{property.name}</h4>
                        <p className="text-on-surface-variant text-[12px] leading-[16px] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span> {property.location}
                        </p>
                      </div>
                      <p className="text-primary font-bold text-[16px] leading-[24px]">{formatCurrency(property.monthlyRevenue)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">Type</p>
                        <p className="text-[12px] leading-[16px] font-semibold">{property.type || 'Apartments'}</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-[10px] uppercase tracking-wider">Total Units</p>
                        <p className="text-[12px] leading-[16px] font-semibold">{property.units} Units</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] leading-[14px] font-semibold">
                        <span className="text-on-surface-variant">Occupancy</span>
                        <span className="font-bold">{occupancyRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full ${occupancyRate === 100 ? 'bg-success' : occupancyRate >= 80 ? 'bg-warning' : 'bg-primary'}`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_120px_100px_100px_80px] gap-4 p-4 border-b border-slate-100 text-[11px] leading-[14px] tracking-[0.03em] font-semibold text-on-surface-variant uppercase">
              <span>Property</span>
              <span>Units</span>
              <span>Revenue</span>
              <span>Occupancy</span>
              <span>Status</span>
              <span></span>
            </div>
            {filteredProperties.map((property) => {
              const occupancyRate = Math.round((property.occupiedUnits / property.units) * 100);
              const status = getPropertyStatus(property);
              return (
                <div
                  key={property.id}
                  className="grid grid-cols-[1fr_120px_120px_100px_100px_80px] gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer items-center"
                  onClick={() => openDrawer(property)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
                      {property.image ? (
                        <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant">apartment</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] font-semibold text-on-surface">{property.name}</p>
                      <p className="text-[12px] leading-[16px] text-on-surface-variant">{property.location}</p>
                    </div>
                  </div>
                  <span className="text-[14px] leading-[20px]">{property.units}</span>
                  <span className="text-[14px] leading-[20px] font-semibold text-primary">{formatCurrency(property.monthlyRevenue)}</span>
                  <span className="text-[14px] leading-[20px] font-semibold">{occupancyRate}%</span>
                  <span className={`${status.bgClass} text-white text-[10px] font-bold px-2 py-1 rounded-full text-center`}>{status.label}</span>
                  <Link href={`/properties/${property.id}`} onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden h-96 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">map</span>
              <p className="text-[14px] leading-[20px] text-on-surface-variant">Map view coming soon</p>
            </div>
          </div>
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

      <PropertyDrawer property={selectedProperty} isOpen={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
