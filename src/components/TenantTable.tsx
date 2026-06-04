'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, getInitials, getStatusColor, formatDate } from '@/lib/utils';
import type { Tenant } from '@/types';

interface TenantTableProps {
  tenants: Tenant[];
  onDelete?: (tenantId: string) => void;
}

export function TenantTable({ tenants, onDelete }: TenantTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = tenants.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search tenants..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(0); }}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3">Tenant Name</th>
              <th className="px-5 py-3">Unit</th>
              <th className="px-5 py-3">Rent Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Lease Expiry</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {current.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/tenants/${tenant.id}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {getInitials(tenant.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-xs text-gray-400">{tenant.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">
                  {tenant.unitNumber}<br /><span className="text-xs text-gray-400">{tenant.propertyName}</span>
                </td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{formatCurrency(tenant.rentAmount)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'paid' ? 'bg-success' : tenant.status === 'pending' ? 'bg-warning' : 'bg-danger'}`} />
                    {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{formatDate(tenant.leaseEnd)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/tenants/${tenant.id}`} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye size={16} /></Link>
                    <Link href={`/tenants/${tenant.id}?edit=true`} className="p-1.5 text-gray-400 hover:text-warning hover:bg-warning/10 rounded-lg transition-colors"><Edit size={16} /></Link>
                    <button onClick={() => onDelete?.(tenant.id)} className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronLeft size={18} /></button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === i ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
