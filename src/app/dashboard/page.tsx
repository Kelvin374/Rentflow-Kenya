'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { formatCurrency } from '@/lib/utils';
import { fetchDashboardStats, fetchProperties, fetchMaintenance, fetchRevenueData } from '@/lib/supabase-api';
import type { DashboardStats, Property, MaintenanceRequest, RevenueData } from '@/types';
import { useToast } from '@/components/Toast';

const properties = [
  {
    id: 1,
    name: 'Riverside Heights',
    location: 'Riverside, Nairobi',
    totalUnits: 48,
    occupied: 45,
    vacant: 3,
    monthlyRev: 'KES 1.85M',
    status: 'Optimal',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU9E8bNbofpZLkBQiv3xAxthfB3SDiDV6Q736cjGVaSKk8kAe1WkRr8r7sip8nNvhjnG9fKkugSuBWypfmoIIJVw8K-jWK7UhI-ftCGmM9Jvn9b01y1dbc9IOpRwpFzwP8fNZe5lRalCCLHq-GNV8MJ2UYWoShZyCKgFva-QdB6gu_r5biZE1IXltN3G37ZK9WhoTeblzZAYwAevFNahzUyUGHPhZR2ya1ltq58k5yISBRVYHjSFpX',
  },
  {
    id: 2,
    name: 'Kilimani Square',
    location: 'Kilimani, Nairobi',
    totalUnits: 32,
    occupied: 31,
    vacant: 1,
    monthlyRev: 'KES 920K',
    status: 'Optimal',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlHNrEhhwQDlNz7ZYpCDkHbU7Cb99hhwam4ILkTiWsET1SUEqw0YIdrPLfiuo0u-tGni7X3MCudI4eXaDnIJiqQHq-YM9r45U410KMEUVVYNrTHBUB1wMqS8sJG1bKsBHSHHSz2rAciBNDCmkAmW7v1Ips9UYBaxAcbxM3br10YXvEASYXXUm3NMW5xVaaFfDcHUzwlQGj0luWyi_8B8C82N8bA-miOn46db3FvQG9bX5Sh7-YSTyK',
  },
  {
    id: 3,
    name: 'Karen Greens',
    location: 'Karen, Nairobi',
    totalUnits: 12,
    occupied: 10,
    vacant: 2,
    monthlyRev: 'KES 1.44M',
    status: 'Action Needed',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnrpWiPMeotBUySTSS4rswOxD9Wgen0ltGKfbGdzmll-tisp8UtLP03U4HurJCAmz_qSDagm76PPIahsseNRdBK_GN-ncc7A4QUoxJQYGeHAiLw-0G4Aa2v-C2tmo3RLSdxC_fNXSz_bYq5J0fqzTsP9U4lmoyqAst20Gm-j9NRitVGide-0w3xaV6O-s8uybTv3E_9C6LRch80fGwERvkapJ5QXdNsJd97ZxB-dZRK00oCCfoGhBj',
  },
];

const maintenanceRequests = [
  { id: 1, title: 'Leaking Pipe - Unit 4B', priority: 'Urgent', property: 'Riverside Heights', time: '2h ago', icon: 'plumbing', color: 'error' },
  { id: 2, title: 'Faulty Light Switch', priority: 'Pending', property: 'Kilimani Square', time: '1d ago', icon: 'bolt', color: 'tertiary' },
  { id: 3, title: 'AC Servicing', priority: 'In Progress', property: 'Karen Greens', time: '3d ago', icon: 'ac_unit', color: 'secondary' },
];

const recentApplications = [
  { id: 1, name: 'Sarah Wangari', property: 'Riverside Heights', unit: 'Unit 12C', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_c9rW2ZCadV9GNMLkSrGpp1_EK1dnGrTI_uONhYJVe7rjISwIhKOuom5UDKvYOgTYF4qyZHvqn6cYzTCqelbq6Qp2kRZdfhHUDl7r9Pyqrz-3bXJYoUH_sAD6xajbqVxObQL43pqeX0taDBuBh9FbS1dO_Uo5pXqaMpKLf9n85yHplwoRC2S6J3I-6vuFOQ8MqKHYyD5xVDWmPKr_kUW4LbuS7uaB7oBctDcR59ctNKKloFM5nOb8' },
  { id: 2, name: 'James Otieno', property: 'Karen Greens', unit: 'Unit 4', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkdmEuWWWO07iPHlRRrOaF7K83VIYJO2rGTJlVrkHO71XFdsgKOBVdQynGqdPa9ByLKBsJWpyzkhbvAZeVp2_ZP8yJMQR4iAYMLWtvashXwax6rKx4ANTBL1JhaowtiJpXEckzh6p2O7nVbBU36CHFcYzudakT6xUUv93Y6XbzQSBVyZTQl32ccKa8WcuKAEdbaUTS05487YzbHnNGvtcqqySFk2zOyJ3dxkDn5PbO4MaBvsNBUYLT' },
  { id: 3, name: 'The Mwangis', property: 'Riverside Heights', unit: 'Unit 8A', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbtRht6fE320JRmv061xK_TUYprzD-OGAapKcbslMmp5-z35TjliSXCHgCLNIyFu9Hb3ylZ4YCrDviqbm-19h7W9WfRRm3oorghJDanXQWjt1AafJfOsOjEcGHXBBJGtFvwaL3AoUEEiNtqxbn0xZDrms_km9kgDx4BF_3UUfioNgdNlt13YitI4WHuipP9voTnoO-P4-8ZFml0FORHal3AtiSSZnEVDjdGaOT-wBkZZ_14JH3GwdE' },
];

const revenueData = [
  { month: 'Jun', height: '40%', active: false },
  { month: 'Jul', height: '55%', active: false },
  { month: 'Aug', height: '50%', active: false },
  { month: 'Sep', height: '75%', active: false },
  { month: 'Oct', height: '90%', active: true },
  { month: 'Nov', height: '82%', active: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; property: any } | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statsData = stats || {
    totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
    monthlyRevenue: 0, occupancyRate: 0, pendingPayments: 0, overdueAmount: 0,
    activeMaintenance: 0, totalTenants: 0,
  };

  return (
    <div>
      <Header title="Dashboard" />

      <div className="p-6 max-w-[1280px] mx-auto w-full space-y-6">
        {/* Quick Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Properties */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-primary transition-colors cursor-default">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
              </div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">+2 this month</span>
            </div>
            <div className="mt-6">
              <p className="text-[14px] leading-[20px] text-on-surface-variant">Total Properties</p>
              <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">{statsData.totalProperties}</h3>
            </div>
          </div>

          {/* Occupied Units */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-tertiary transition-colors cursor-default">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-tertiary/10 rounded-lg text-tertiary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_pin</span>
              </div>
              <span className="text-xs font-medium text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">94% rate</span>
            </div>
            <div className="mt-6">
              <p className="text-[14px] leading-[20px] text-on-surface-variant">Occupied Units</p>
              <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">{statsData.occupiedUnits}</h3>
            </div>
          </div>

          {/* Vacant Units */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-error transition-colors cursor-default">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-error/10 rounded-lg text-error">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
              </div>
              <span className="text-xs font-medium text-error bg-error/10 px-2 py-1 rounded-full">-5 since Oct</span>
            </div>
            <div className="mt-6">
              <p className="text-[14px] leading-[20px] text-on-surface-variant">Vacant Units</p>
              <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">{statsData.vacantUnits}</h3>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg flex flex-col justify-between transition-transform hover:scale-[1.02] cursor-default">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/20 rounded-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">KES vs LY +12%</span>
            </div>
            <div className="mt-6">
              <p className="text-[14px] leading-[20px] opacity-80">Monthly Revenue</p>
              <h3 className="text-[30px] leading-[38px] tracking-tight font-bold">{formatCurrency(statsData.monthlyRevenue)}</h3>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col h-96">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="font-semibold text-sm text-on-surface">Rental Income Growth</h4>
                <p className="text-[14px] leading-[20px] text-on-surface-variant">Monthly collections across all properties</p>
              </div>
              <select className="bg-surface-container-low border-none rounded-lg text-xs py-1 focus:ring-0">
                <option>Last 6 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
            <div className="flex-grow flex items-end justify-between gap-4 pt-4">
              {revenueData.map((data) => (
                <div key={data.month} className="flex flex-col items-center gap-2 w-full h-full justify-end">
                  <div
                    className={`w-full rounded-t-lg transition-all hover:opacity-80 ${
                      data.active
                        ? 'bg-primary-container shadow-md'
                        : 'bg-primary-fixed-dim/40'
                    }`}
                    style={{ height: data.height }}
                  />
                  <span className={`text-xs text-on-surface-variant ${data.active ? 'font-bold' : ''}`}>{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy Donut */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col">
            <h4 className="font-semibold text-sm text-on-surface mb-8">Occupancy Status</h4>
            <div className="flex-grow flex flex-col justify-center items-center relative">
              <div className="w-48 h-48 rounded-full border-[16px] border-primary flex items-center justify-center relative">
                <div className="text-center">
                  <span className="text-[36px] leading-[44px] tracking-tight font-bold text-on-surface">94%</span>
                  <p className="text-xs font-medium text-on-surface-variant">Capacity</p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-[14px] leading-[20px] text-on-surface-variant">Occupied</span>
                </div>
                <span className="font-semibold text-sm">{statsData.occupiedUnits} Units</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                  <span className="text-[14px] leading-[20px] text-on-surface-variant">Vacant</span>
                </div>
                <span className="font-semibold text-sm">{statsData.vacantUnits} Units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Overview Table */}
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
                        <div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden flex-shrink-0">
                          <img className="w-full h-full object-cover" src={property.image} alt={property.name} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface">{property.name}</p>
                          <p className="text-[14px] leading-[20px] text-on-surface-variant">{property.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base">{property.totalUnits}</td>
                    <td className="px-6 py-4 text-base">{property.occupied}</td>
                    <td className="px-6 py-4 text-base">{property.vacant}</td>
                    <td className="px-6 py-4 text-sm font-bold">{property.monthlyRev}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        property.status === 'Optimal'
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            property,
                          });
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

        {/* Bottom Sections: Maintenance & Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {/* Recent Maintenance Requests */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-sm text-on-surface">Active Maintenance</h4>
              <Link href="/maintenance" className="text-primary text-xs font-medium hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {maintenanceRequests.map((req) => (
                <div key={req.id} className="flex gap-4 p-4 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all">
                  <div className={`h-10 w-10 rounded-full bg-${req.color}/10 text-${req.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="material-symbols-outlined">{req.icon}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <p className="font-semibold text-sm text-on-surface">{req.title}</p>
                      <span className={`text-xs font-bold ${
                        req.priority === 'Urgent' ? 'text-error' : 'text-on-surface-variant'
                      }`}>{req.priority}</span>
                    </div>
                    <p className="text-[14px] leading-[20px] text-on-surface-variant">{req.property} &bull; Reported {req.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-sm text-on-surface">Recent Applications</h4>
              <Link href="/leases" className="text-primary text-xs font-medium hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all">
                  <img className="h-10 w-10 rounded-full object-cover" src={app.avatar} alt={app.name} />
                  <div className="flex-grow">
                    <p className="font-semibold text-sm text-on-surface">{app.name}</p>
                    <p className="text-[14px] leading-[20px] text-on-surface-variant">{app.property} &bull; {app.unit}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Application from ${app.name} rejected`, 'error');
                      }}
                      className="p-1 hover:bg-error/10 text-error rounded-md transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Application from ${app.name} approved!`, 'success');
                      }}
                      className="p-1 hover:bg-tertiary/10 text-tertiary rounded-md transition-colors"
                    >
                      <span className="material-symbols-outlined">check</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
            <button
              onClick={() => {
                showToast('Vacancy report downloaded', 'success');
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
            <hr className="border-outline-variant my-1" />
            <button
              onClick={() => {
                showToast('Tenants notified of vacancy', 'info');
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-3 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              Advertise Vacancy
            </button>
          </div>
        </>
      )}
    </div>
  );
}
