'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import type { Property } from '@/types';

interface PropertyDrawerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PropertyTenant {
  name: string;
  unit: string;
  initials: string;
  status: string;
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function PropertyDrawer({ property, isOpen, onClose }: PropertyDrawerProps) {
  const [tenants, setTenants] = useState<PropertyTenant[]>([]);

  useEffect(() => {
    if (!property || !isOpen) return;

    async function loadTenants() {
      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, tenant_id')
        .eq('property_id', property!.id)
        .not('tenant_id', 'is', null);

      if (!units || units.length === 0) { setTenants([]); return; }

      const tenantIds = units.map((u) => u.tenant_id).filter(Boolean) as string[];
      if (tenantIds.length === 0) { setTenants([]); return; }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', tenantIds);

      const { data: payments } = await supabase
        .from('payments')
        .select('tenant_id, status')
        .in('tenant_id', tenantIds)
        .order('due_date', { ascending: false });

      const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]));
      const latestPayment = new Map<string, string>();
      for (const pay of payments || []) {
        if (!latestPayment.has(pay.tenant_id)) {
          latestPayment.set(pay.tenant_id, pay.status);
        }
      }

      setTenants(
        units.map((u) => {
          const name = profileMap.get(u.tenant_id!) || 'Unknown';
          return {
            name,
            unit: u.unit_number,
            initials: getInitials(name),
            status: latestPayment.get(u.tenant_id!) || 'pending',
          };
        })
      );
    }

    loadTenants();
  }, [property, isOpen]);

  if (!property) return null;

  const occupancyRate = Math.round((property.occupiedUnits / property.units) * 100);
  const yieldRate = '0.0';

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
              {property.images?.[0] || property.image ? (
                <img src={property.images?.[0] || property.image} alt={property.name} className="w-full h-full object-cover" />
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
              <p className="text-[18px] leading-[28px] font-semibold text-danger">
                {tenants.length > 0 ? `${Math.round((tenants.filter((t) => t.status !== 'paid').length / tenants.length) * 100)}%` : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-[12px] leading-[16px] font-medium mb-4 flex items-center justify-between">
              <span className="font-semibold">Occupancy</span>
              <span className="text-primary text-[11px] font-medium cursor-pointer hover:underline">View Detailed Report</span>
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[14px] leading-[20px] font-semibold">{property.occupiedUnits} / {property.units} Units Occupied</span>
                <span className="text-primary font-bold">{Math.round((property.occupiedUnits / property.units) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-outline-variant rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${(property.occupiedUnits / property.units) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[12px] leading-[16px] font-semibold mb-4">Tenants ({tenants.length})</h3>
            <div className="space-y-3">
              {tenants.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4">No tenants in this property</p>
              ) : tenants.slice(0, 4).map((tenant: PropertyTenant, i: number) => (
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
                View All Tenants
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
