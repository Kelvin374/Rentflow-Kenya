'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RevenueChart } from '@/components/RevenueChart';
import { formatCurrency } from '@/lib/utils';
import { fetchPayments, fetchDashboardStats, fetchRevenueData } from '@/lib/supabase-api';
import type { DashboardStats, RevenueData, Payment } from '@/types';
import { Download, FileText, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPayments(), fetchDashboardStats(), fetchRevenueData()])
      .then(([p, s, r]) => { setPayments(p); setStats(s); setRevenueData(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalCollected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const s = stats || { occupancyRate: 0, occupiedUnits: 0, totalUnits: 0 };

  return (
    <div>
      <Header title="Financial Reports" subtitle="Income, expenses, and analytics" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Generate and export financial reports</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => alert('Generating PDF report...')}><FileText size={16} /> PDF</Button>
            <Button variant="outline" size="sm" onClick={() => alert('Generating Excel report...')}><Download size={16} /> Excel</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
              <p className="text-xs text-success mt-1">+12.4% vs last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500 mb-1">Outstanding</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
              <p className="text-xs text-danger mt-1">{payments.filter(p => p.status !== 'paid').length} unpaid invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-gray-500 mb-1">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900">{s.occupancyRate}%</p>
              <p className="text-xs text-success mt-1">{s.occupiedUnits} of {s.totalUnits} units</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueData} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Reports</h3>
            <div className="space-y-3">
              {[
                { title: 'Income Statement', desc: 'Monthly revenue breakdown', icon: BarChart3 },
                { title: 'Expense Report', desc: 'Maintenance and operational costs', icon: PieChart },
                { title: 'Occupancy Report', desc: 'Vacancy rates and trends', icon: TrendingUp },
                { title: 'Profit Report', desc: 'Net income after expenses', icon: FileText },
              ].map((r) => (
                <div key={r.title} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <r.icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-400">{r.desc}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => alert(`Downloading ${r.title}...`)}><Download size={14} /></Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
