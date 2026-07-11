'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyDrawerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const occupancyHistory = [60, 75, 90, 95, 100, 100];

const topTenants = [
  { name: 'John Doe', unit: 'A-402', initials: 'JD', status: 'paid' },
  { name: 'Sarah Miller', unit: 'B-105', initials: 'SM', status: 'paid' },
  { name: 'James Kariuki', unit: 'C-201', initials: 'JK', status: 'paid' },
  { name: 'Grace Wanjiku', unit: 'D-304', initials: 'GW', status: 'pending' },
];

export function PropertyDrawer({ property, isOpen, onClose }: PropertyDrawerProps) {
  if (!property) return null;

  const occupancyRate = Math.round((property.occupiedUnits / property.units) * 100);
  const yieldRate = property.monthlyRevenue > 0 ? ((property.monthlyRevenue * 12) / (property.units * 50000) * 100).toFixed(1) : '0.0';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 z-[55] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] transition-transform duration-500 ease-out border-l border-outline-variant flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface">{property.name}</h2>
            <p className="text-[14px] leading-[20px] text-on-surface-variant">Detailed Overview & Performance</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            <div className="col-span-2 h-48 bg-surface-container">
              {property.image ? (
                <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">apartment</span>
                </div>
              )}
            </div>
            <div className="h-24 bg-surface-container">
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">living</span>
              </div>
            </div>
            <div className="h-24 bg-surface-container">
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">bedroom_parent</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] uppercase text-on-surface-variant tracking-wider mb-1">Total Yield</p>
              <p className="text-[18px] leading-[28px] font-semibold text-success">{yieldRate}%</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] uppercase text-on-surface-variant tracking-wider mb-1">Delinquency</p>
              <p className="text-[18px] leading-[28px] font-semibold text-danger">0.0%</p>
            </div>
          </div>

          <div>
            <h3 className="text-[12px] leading-[16px] font-medium mb-4 flex items-center justify-between">
              <span className="font-semibold">Occupancy History</span>
              <span className="text-primary text-[11px] font-medium cursor-pointer hover:underline">View Detailed Report</span>
            </h3>
            <div className="h-32 flex items-end gap-1.5 bg-slate-50 rounded-xl p-4">
              {occupancyHistory.map((val, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${i === occupancyHistory.length - 1 ? 'bg-primary' : 'bg-primary-container'}`}
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[12px] leading-[16px] font-semibold mb-4">Top Tenants</h3>
            <div className="space-y-3">
              {topTenants.slice(0, 2).map((tenant, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold text-[10px]">{tenant.initials}</div>
                    <div>
                      <p className="text-[14px] leading-[20px] font-semibold">{tenant.name}</p>
                      <p className="text-[10px] text-on-surface-variant">Unit {tenant.unit}</p>
                    </div>
                  </div>
                  <span className={`text-[12px] font-medium ${tenant.status === 'paid' ? 'text-success' : 'text-warning'}`}>
                    {tenant.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              ))}
              <button className="w-full py-2 text-center text-primary text-[12px] font-medium hover:underline">
                View All {property.units} Tenants
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <Link
            href={`/properties/${property.id}`}
            className="w-full py-3 bg-primary text-white rounded-xl text-[12px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Manage Entire Property
          </Link>
        </div>
      </div>
    </>
  );
}
