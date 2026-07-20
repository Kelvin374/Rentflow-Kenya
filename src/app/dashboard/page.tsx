'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { formatCurrency } from '@/lib/utils';
import { fetchLandlordStats, fetchLandlordProperties, fetchLandlordMaintenance } from '@/lib/supabase-api';
import type { DashboardStats, Property, MaintenanceRequest } from '@/types';

const categoryIcons: Record<string, string> = {
  plumbing: 'plumbing', electrical: 'bolt', security: 'lock', painting: 'format_paint',
  water: 'water_drop', cleaning: 'cleaning_services', general: 'build',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; property: Property } | null>(null);

  const loadData = useCallback(() => {
    if (!user || authLoading) return;
    setLoading(true);
    setError(null);
    const landlordId = user.id;
    Promise.all([
      fetchLandlordStats(landlordId),
      fetchLandlordProperties(landlordId),
      fetchLandlordMaintenance(landlordId),
    ])
      .then(([s, p, m]) => { setStats(s); setProperties(p); setMaintenance(m); })
      .catch((e) => setError(e?.message || 'Failed to load dashboard data. Please try again.'))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!user || user.role === 'admin') { router.push('/admin/dashboard'); return; }
    if (user.role === 'tenant') { router.push('/tenant/dashboard'); return; }
    loadData();
  }, [user, authLoading, isAuthenticated, router, loadData]);

  useRealtimeSubscription(
    'dashboard-payments',
    [{ event: '*', table: 'payments' }],
    () => loadData(),
    !!user && user.role === 'landlord'
  );

  useRealtimeSubscription(
    'dashboard-maintenance',
    [{ event: '*', table: 'maintenance_requests' }],
    () => loadData(),
    !!user && user.role === 'landlord'
  );

  const statsData = stats || {
    totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
    monthlyRevenue: 0, occupancyRate: 0, pendingPayments: 0, overdueAmount: 0,
    activeMaintenance: 0, totalTenants: 0,
  };

  const isEmpty = !loading && properties.length === 0;

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Dashboard" />
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" />

      <div className="p-4 md:p-6 max-w-[1280px] mx-auto w-full space-y-6">
        {/* Empty State */}
        {isEmpty && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">apartment</span>
            </div>
            <h3 className="text-[24px] leading-[32px] font-bold text-on-surface mb-2">Welcome to RentFlow!</h3>
            <p className="text-on-surface-variant max-w-md mx-auto mb-8">
              Get started by adding your first property. You can track units, collect payments, and manage tenants all in one place.
            </p>
            <Link
              href="/properties/new"
              className="bg-primary text-on-primary px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Your First Property
            </Link>
          </div>
        )}

        {/* Quick Stats Bento */}
        {!isEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-primary transition-colors cursor-default">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-[14px] leading-[20px] text-on-surface-variant">Total Properties</p>
                <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">{statsData.totalProperties}</h3>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-tertiary transition-colors cursor-default">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-tertiary/10 rounded-lg text-tertiary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_pin</span>
                </div>
                {statsData.totalUnits > 0 && (
                  <span className="text-xs font-medium text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">{statsData.occupancyRate}% occupied</span>
                )}
              </div>
              <div className="mt-6">
                <p className="text-[14px] leading-[20px] text-on-surface-variant">Occupied Units</p>
                <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">{statsData.occupiedUnits}<span className="text-lg text-on-surface-variant font-normal"> / {statsData.totalUnits}</span></h3>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-error transition-colors cursor-default">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-error/10 rounded-lg text-error">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-[14px] leading-[20px] text-on-surface-variant">Vacant Units</p>
                <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">{statsData.vacantUnits}</h3>
              </div>
            </div>

            <div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-default">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/20 rounded-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-[14px] leading-[20px] opacity-80">Monthly Revenue</p>
                <h3 className="text-[30px] leading-[38px] tracking-tight font-bold">{formatCurrency(statsData.monthlyRevenue)}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Occupancy Donut */}
            <div className="lg:col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col">
              <h4 className="font-semibold text-sm text-on-surface mb-8">Occupancy Status</h4>
              <div className="flex-grow flex flex-col justify-center items-center relative">
                <div
                  className="w-48 h-48 rounded-full border-[16px] border-primary flex items-center justify-center relative"
                  style={statsData.totalUnits > 0 ? {} : { borderColor: 'var(--md-sys-color-outline-variant)' }}
                >
                  <div className="text-center">
                    <span className="text-[36px] leading-[44px] tracking-tight font-bold text-on-surface">
                      {statsData.totalUnits > 0 ? `${statsData.occupancyRate}%` : '0%'}
                    </span>
                    <p className="text-xs font-medium text-on-surface-variant">Capacity</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-[14px] leading-[20px] text-on-surface-variant">Occupied</span>
                  </div>
                  <span className="font-semibold text-sm">{statsData.occupiedUnits} Units</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary-container" />
                    <span className="text-[14px] leading-[20px] text-on-surface-variant">Vacant</span>
                  </div>
                  <span className="font-semibold text-sm">{statsData.vacantUnits} Units</span>
                </div>
              </div>
            </div>

            {/* Recent Payments Summary */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col">
              <h4 className="font-semibold text-sm text-on-surface mb-4">Payment Overview</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-tertiary/5 rounded-xl p-4">
                  <p className="text-xs text-on-surface-variant mb-1">Collected This Month</p>
                  <p className="text-[22px] leading-[28px] font-bold text-on-surface">{formatCurrency(statsData.monthlyRevenue)}</p>
                </div>
                <div className="bg-error/5 rounded-xl p-4">
                  <p className="text-xs text-on-surface-variant mb-1">Pending</p>
                  <p className="text-[22px] leading-[28px] font-bold text-on-surface">{formatCurrency(statsData.pendingPayments)}</p>
                </div>
                <div className="bg-error/5 rounded-xl p-4">
                  <p className="text-xs text-on-surface-variant mb-1">Overdue</p>
                  <p className="text-[22px] leading-[28px] font-bold text-error">{formatCurrency(statsData.overdueAmount)}</p>
                </div>
                <div className="bg-secondary/5 rounded-xl p-4">
                  <p className="text-xs text-on-surface-variant mb-1">Active Tenants</p>
                  <p className="text-[22px] leading-[28px] font-bold text-on-surface">{statsData.totalTenants}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Overview Table */}
        {!isEmpty && (
          <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-outline-variant">
              <h4 className="text-[24px] leading-[32px] font-semibold text-on-surface">Property Overview</h4>
              <Link
                href="/properties/new"
                className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Property
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Total Units</th>
                    <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Occupied</th>
                    <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Vacant</th>
                    <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Monthly Rev.</th>
                    <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {properties.map((property) => (
                    <tr
                      key={property.id}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined">apartment</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-on-surface">{property.name}</p>
                            <p className="text-[14px] leading-[20px] text-on-surface-variant">{property.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base">{property.units}</td>
                      <td className="px-6 py-4 text-base">{property.occupiedUnits}</td>
                      <td className="px-6 py-4 text-base">{property.units - property.occupiedUnits}</td>
                      <td className="px-6 py-4 text-sm font-bold">{formatCurrency(property.monthlyRevenue)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          property.occupiedUnits === property.units
                            ? 'bg-tertiary/10 text-tertiary'
                            : property.occupiedUnits > 0
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-error/10 text-error'
                        }`}>
                          {property.occupiedUnits === property.units ? 'Fully Occupied'
                            : property.occupiedUnits > 0 ? 'Partially Occupied' : 'Vacant'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenu({ x: e.clientX, y: e.clientY, property });
                          }}
                          className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Active Maintenance */}
        {!isEmpty && maintenance.length > 0 && (
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-sm text-on-surface">Active Maintenance</h4>
              <Link href="/maintenance" className="text-primary text-xs font-medium hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {maintenance.slice(0, 5).map((req) => (
                <div key={req.id} className="flex gap-4 p-4 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">{categoryIcons[req.category] || 'build'}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="font-semibold text-sm text-on-surface">{req.description.substring(0, 40)}{req.description.length > 40 ? '...' : ''}</p>
                      <span className={`text-xs font-bold ${
                        req.priority === 'urgent' ? 'text-error' : 'text-on-surface-variant'
                      }`}>{req.priority}</span>
                    </div>
                    <p className="text-[14px] leading-[20px] text-on-surface-variant">
                      {req.propertyName} {req.unitNumber ? `• ${req.unitNumber}` : ''} &bull; {req.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant py-2 min-w-[180px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => {
                router.push(`/properties/${contextMenu.property.id}`);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              View Details
            </button>
            <button
              onClick={() => {
                router.push(`/properties/${contextMenu.property.id}/edit`);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Property
            </button>
            <hr className="border-outline-variant my-1" />
            <button
              onClick={() => {
                router.push('/properties/new');
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Property
            </button>
          </div>
        </>
      )}
    </div>
  );
}
