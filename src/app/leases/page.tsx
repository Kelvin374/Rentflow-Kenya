'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { fetchLeases } from '@/lib/supabase-api';

export default function LeasesPage() {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeases().then((data) => {
      setLeases(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-6 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Lease Agreements</h1>
        <p className="text-sm text-gray-500">{leases.length} active lease{leases.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-3">
        {leases.map((lease) => (
          <Link key={lease.id} href={`/leases/${lease.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {lease.properties?.name || 'Property'} &middot; {lease.units?.unit_number || 'Unit'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(lease.start_date)} – {formatDate(lease.end_date)} &middot; {formatCurrency(lease.rent_amount)}/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      lease.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {leases.length === 0 && (
          <p className="text-center text-gray-400 py-8">No lease agreements found.</p>
        )}
      </div>
    </div>
  );
}
