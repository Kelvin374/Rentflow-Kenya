'use client';

import Link from 'next/link';
import { Clock, CheckCircle, User, AlertCircle, ArrowRight } from 'lucide-react';
import { getCategoryIcon, getStatusColor } from '@/lib/utils';
import type { MaintenanceRequest } from '@/types';

interface MaintenanceBoardProps {
  requests: MaintenanceRequest[];
}

const columns = [
  { key: 'submitted', label: 'Submitted', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'assigned', label: 'Assigned', color: 'text-warning', bg: 'bg-orange-50' },
  { key: 'in_progress', label: 'In Progress', color: 'text-primary', bg: 'bg-blue-50' },
  { key: 'completed', label: 'Completed', color: 'text-success', bg: 'bg-green-50' },
];

export function MaintenanceBoard({ requests }: MaintenanceBoardProps) {
  const grouped = columns.reduce((acc, col) => {
    acc[col.key] = requests.filter((r) => r.status === col.key);
    return acc;
  }, {} as Record<string, MaintenanceRequest[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const items = grouped[col.key] || [];
        return (
          <div key={col.key} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${col.bg} rounded-t-xl`}>
              <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.bg} ${col.color}`}>{items.length}</span>
            </div>
            <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide">
              {items.map((req) => (
                <Link key={req.id} href={`/maintenance/${req.id}`} className="block p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(req.priority)}`}>
                      {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                    </span>
                    <span className="text-[10px] text-gray-400">{getCategoryIcon(req.category)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{req.description}</p>
                  <p className="text-xs text-gray-400 mb-2">Unit {req.unitNumber}, {req.propertyName}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <User size={12} />
                      <span>{req.tenantName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={10} />
                      <span>{Math.floor((Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60))}h ago</span>
                    </div>
                  </div>
                  {req.assignedTo && (
                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1 text-xs text-gray-500">
                      <User size={12} />
                      <span>{req.assignedTo}</span>
                    </div>
                  )}
                  {req.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>{req.progress}% Complete</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${req.progress}%` }} />
                      </div>
                    </div>
                  )}
                  {req.status === 'completed' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <CheckCircle size={12} />
                      <span>Verified</span>
                    </div>
                  )}
                </Link>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No requests</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
