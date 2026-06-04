'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Building2, Download, Filter, Plus, Search, TrendingUp, X } from 'lucide-react';
import { fetchProperties, fetchDashboardStats } from '@/lib/supabase-api';
import { formatCurrency } from '@/lib/utils';
import type { Property, DashboardStats } from '@/types';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([fetchProperties(), fetchDashboardStats()])
      .then(([p, s]) => { setProperties(p); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProperties = properties.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
  );

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

  const s = stats || { totalUnits: 0, occupiedUnits: 0, monthlyRevenue: 0, totalProperties: 0, occupancyRate: 0 } as DashboardStats;

  return (
    <div>
      <Header title="Properties Overview" subtitle="Nairobi Region" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-success bg-success/10 px-2 py-1 rounded-lg">{s.occupancyRate}% OCCUPIED</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSearch(!showSearch)}>
              {showSearch ? <X size={16} /> : <Filter size={16} />} {showSearch ? 'Close' : 'Filters'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert('CSV export triggered')}><Download size={16} /> Export CSV</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Units" value={s.totalUnits.toString()} subtitle="Across all properties" icon={Building2} />
          <StatsCard title="Occupancy Rate" value={`${s.occupancyRate}%`} subtitle={`${s.occupiedUnits} of ${s.totalUnits} occupied`} icon={TrendingUp} variant="success" />
          <StatsCard title="Avg. Rent" value={formatCurrency(s.totalUnits > 0 ? s.monthlyRevenue / s.totalUnits : 0)} subtitle="Per unit" icon={Building2} variant="primary" />
          <StatsCard title="Monthly Growth" value="+12.4%" subtitle="vs last month" icon={TrendingUp} variant="success" />
        </div>

        {showSearch && (
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full text-center py-8">No properties match your search</p>
          ) : filteredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} href={`/properties/${p.id}`} />
          ))}
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Add New Property</h3>
            <p className="text-sm text-gray-500 mb-4">Expand your portfolio by adding a residential or commercial property.</p>
            <Link href="/properties/new"><Button>Add Property</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
