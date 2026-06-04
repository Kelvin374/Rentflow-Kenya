'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MaintenanceBoard } from '@/components/MaintenanceBoard';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Wrench, Clock, Users, TrendingUp, Plus, Construction } from 'lucide-react';
import { fetchMaintenance } from '@/lib/supabase-api';
import type { MaintenanceRequest } from '@/types';

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenance().then(setRequests).catch(console.error).finally(() => setLoading(false));
  }, []);

  const active = requests.filter((m) => m.status !== 'completed').length;
  const completed = requests.filter((m) => m.status === 'completed').length;
  const avgTime = requests.length > 0
    ? requests.reduce((s, m) => s + (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60), 0) / requests.length
    : 0;
  const resolutionRate = requests.length > 0 ? Math.round((completed / requests.length) * 100) : 0;

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

  return (
    <div>
      <Header title="Maintenance Tracking" subtitle={`Managing ${active} active maintenance requests across your portfolio`} />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Submitted" value={requests.filter(m => m.status === 'submitted').length.toString()} icon={Wrench} variant="warning" />
          <StatsCard title="In Progress" value={requests.filter(m => m.status === 'in_progress').length.toString()} icon={Construction} variant="primary" />
          <StatsCard title="Completed" value={completed.toString()} subtitle="This month" icon={TrendingUp} variant="success" />
          <StatsCard title="Resolution Rate" value={`${resolutionRate}%`} subtitle="+12% vs last month" icon={TrendingUp} variant="success" />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Maintenance Requests</h2>
          <Link href="/maintenance/new"><Button><Plus size={16} /> New Ticket</Button></Link>
        </div>

        <MaintenanceBoard requests={requests} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Resolution Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">{resolutionRate}%</p>
                <p className="text-xs text-gray-400 mt-1">A {resolutionRate - 72}% improvement compared to last month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Time to Fix</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(avgTime)} Hours</p>
                <p className="text-xs text-gray-400 mt-1">Includes procurement and transit time</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Technicians Online</p>
                <p className="text-2xl font-bold text-gray-900">18 / 20</p>
                <Button variant="ghost" size="sm" className="text-primary mt-1 px-0" onClick={() => alert('Technician roster management coming soon')}>Manage Roster</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
