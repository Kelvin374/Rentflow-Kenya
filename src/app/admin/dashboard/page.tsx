'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';

const revenueData = [
  { month: 'Jan', height: '40%', opacity: 20 },
  { month: 'Feb', height: '55%', opacity: 30 },
  { month: 'Mar', height: '45%', opacity: 40 },
  { month: 'Apr', height: '70%', opacity: 50 },
  { month: 'May', height: '65%', opacity: 60 },
  { month: 'Jun', height: '85%', opacity: 100 },
  { month: 'Jul', height: '75%', opacity: 40 },
  { month: 'Aug', height: '90%', opacity: 50 },
];

const universityData = [
  { name: 'Strathmore University', percentage: 42, opacity: 100 },
  { name: 'UoN (Main Campus)', percentage: 28, opacity: 80 },
  { name: 'USIU-Africa', percentage: 18, opacity: 60 },
  { name: 'Kenyatta University', percentage: 12, opacity: 40 },
];

const alerts = [
  { icon: 'shield_lock', title: 'Suspicious Account Activity', desc: '3 unusual login attempts from Kisumu (ID: #8821)' },
  { icon: 'campaign', title: 'API Latency Spike', desc: 'Payment gateway response time > 800ms' },
];

const approvalQueue = [
  { icon: 'add_home', title: 'Elite Heights Unit 4B', subtitle: 'Added by Sarah K.' },
  { icon: 'person_add', title: 'Landlord Verification', subtitle: 'James Mwangi - ID Review' },
];

const liveFeed = [
  { color: 'bg-primary', title: 'New Tenant Lease Signed', desc: 'University View Apartments - Studio A', time: '2 minutes ago' },
  { color: 'bg-green-500', title: 'Payment Confirmed', desc: 'KSh 35,000 via M-Pesa (Ref: QAZ123)', time: '15 minutes ago' },
  { color: 'bg-tertiary-container', title: 'Maintenance Request', desc: 'Leaking pipe - Westlands Hub', time: '1 hour ago' },
];

export default function AdminDashboardPage() {
  const [greeting, setGreeting] = useState('Dashboard');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning, Admin');
    else if (hour < 18) setGreeting('Good Afternoon, Admin');
    else setGreeting('Good Evening, Admin');
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* TopAppBar */}
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
          <button className="hover:bg-surface-container-high p-2 rounded-full transition-transform active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">apps</span>
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
            <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: '12,842', icon: 'person', trend: '+14.2%', trendUp: true },
            { label: 'Landlords', value: '1,405', icon: 'real_estate_agent', trend: '+5.8%', trendUp: true },
            { label: 'Tenants', value: '11,437', icon: 'groups', trend: '+18.4%', trendUp: true },
            { label: 'Properties', value: '4,129', icon: 'domain', trend: 'Stable', trendUp: false },
            { label: 'Monthly Revenue', value: 'KSh 4.2M', icon: 'payments', trend: '+22.1%', trendUp: true, highlight: true },
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Analytics (Large) */}
          <div className="lg:col-span-8 bg-surface rounded-xl border border-outline-variant p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Revenue Analytics</h3>
                <p className="text-[14px] leading-[20px] text-on-surface-variant">Financial performance across all Kenyan university hubs.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1 rounded-full text-xs bg-primary-container text-on-primary-container">6 Months</button>
                <button className="px-4 py-1 rounded-full text-xs border border-outline-variant hover:bg-surface-container">1 Year</button>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {revenueData.map((data) => (
                <div
                  key={data.month}
                  className="flex-1 bg-primary rounded-t-lg transition-all hover:opacity-80 cursor-pointer group relative"
                  style={{ height: data.height, opacity: data.opacity / 100 }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">{data.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* University Distribution (Small) */}
          <div className="lg:col-span-4 bg-surface rounded-xl border border-outline-variant p-6 flex flex-col">
            <h3 className="font-bold text-sm text-on-surface mb-4">University Distribution</h3>
            <div className="space-y-4 flex-1">
              {universityData.map((uni) => (
                <div key={uni.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{uni.name}</span>
                    <span className="font-bold">{uni.percentage}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${uni.percentage}%`, opacity: uni.opacity / 100 }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-primary text-xs font-bold flex items-center justify-center gap-1 hover:underline">
              View All Hubs <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Alerts and Queues */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Critical Security Alerts */}
          <div className="bg-error-container/30 border border-error/20 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-error font-bold">warning</span>
              <h3 className="font-bold text-sm text-on-error-container">Critical Security Alerts</h3>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="bg-surface/60 p-4 rounded-lg border border-error/10 flex gap-4">
                  <span className="material-symbols-outlined text-error">{alert.icon}</span>
                  <div>
                    <p className="text-xs font-bold">{alert.title}</p>
                    <p className="text-sm opacity-80">{alert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Queue */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface mb-4">Approval Queue (14)</h3>
            <div className="divide-y divide-outline-variant">
              {approvalQueue.map((item) => (
                <div key={item.title} className="py-3 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.title}</p>
                      <p className="text-sm text-secondary">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-green-100 rounded-full text-green-600">
                      <span className="material-symbols-outlined">check_circle</span>
                    </button>
                    <button className="p-2 hover:bg-error-container rounded-full text-error">
                      <span className="material-symbols-outlined">cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
            <h3 className="font-bold text-sm text-on-surface mb-4">Live Feed</h3>
            <div className="space-y-4">
              {liveFeed.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className={`w-2 ${item.color} rounded-full`}></div>
                  <div>
                    <p className="text-xs font-bold">{item.title}</p>
                    <p className="text-sm text-on-surface-variant">{item.desc}</p>
                    <p className="text-[10px] text-secondary uppercase mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Spacer */}
        <div className="h-8"></div>
      </div>

      {/* Global Footer */}
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
