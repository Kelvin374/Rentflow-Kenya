'use client';

import type { MaintenanceRequest, Tenant, Property } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  request: MaintenanceRequest;
  tenant: Tenant;
  property: Property;
}

export function MaintenanceWorkOrderDocument({ request, tenant, property }: Props) {
  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 text-sm text-gray-900 font-sans">
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center">MAINTENANCE WORK ORDER</h1>
        <p className="text-center text-gray-500 mt-1">RentFlow Kenya — Property Management</p>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-500">Work Order No:</p>
          <p className="font-bold text-lg">WO-{request.id.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Date Issued:</p>
          <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p className="text-xs text-gray-500 mt-1">Priority:</p>
          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
            request.priority === 'urgent' ? 'bg-danger/10 text-danger' :
            request.priority === 'normal' ? 'bg-warning/10 text-warning' : 'bg-gray-100 text-gray-500'
          }`}>{request.priority.toUpperCase()}</span>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-sm mb-3">JOB DETAILS</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <span className="text-gray-500">Description:</span>
            <p className="font-semibold">{request.description}</p>
          </div>
          <div><span className="text-gray-500">Category:</span><br /><span className="font-semibold capitalize">{request.category}</span></div>
          <div><span className="text-gray-500">Status:</span><br /><span className="font-semibold capitalize">{request.status.replace('_', ' ')}</span></div>
          <div><span className="text-gray-500">Reported By:</span><br /><span className="font-semibold">{request.tenantName}</span></div>
          <div><span className="text-gray-500">Assigned To:</span><br /><span className="font-semibold">{request.assignedTo || 'Not assigned'}</span></div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-sm mb-3">PROPERTY INFORMATION</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Property:</span><br /><span className="font-semibold">{property.name}</span></div>
          <div><span className="text-gray-500">Unit:</span><br /><span className="font-semibold">{request.unitNumber || 'Common Area'}</span></div>
          <div><span className="text-gray-500">Location:</span><br /><span className="font-semibold">{property.location}</span></div>
          <div><span className="text-gray-500">Tenant Contact:</span><br /><span className="font-semibold">{tenant.phone}</span></div>
        </div>
      </div>

      {request.cost !== undefined && (
        <div className="border border-gray-300 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-sm mb-3">COST SUMMARY</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-1 text-xs text-gray-500">Item</th>
                <th className="text-right py-1 text-xs text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2">Labour</td>
                <td className="py-2 text-right">{formatCurrency(request.cost * 0.6)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2">Materials</td>
                <td className="py-2 text-right">{formatCurrency(request.cost * 0.4)}</td>
              </tr>
              <tr>
                <td className="py-2 font-bold">TOTAL</td>
                <td className="py-2 text-right font-bold">{formatCurrency(request.cost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-gray-300">
        <div>
          <p className="text-xs text-gray-500 mb-1">Supervisor Signature</p>
          <div className="border-b border-gray-400 h-8" />
          <p className="text-xs text-gray-500 mt-1">Name: ___________________ Date: ___________</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Tenant/Client Signature</p>
          <div className="border-b border-gray-400 h-8" />
          <p className="text-xs text-gray-500 mt-1">Name: ___________________ Date: ___________</p>
        </div>
      </div>

      <div className="mt-6 border border-gray-200 rounded p-3 bg-gray-50">
        <h3 className="font-bold text-xs mb-1">WORK COMPLETION REPORT</h3>
        <p className="text-xs text-gray-500">Work completed to satisfaction: ___ Yes ___ No</p>
        <p className="text-xs text-gray-500 mt-1">Comments: _______________________________________________</p>
        <p className="text-xs text-gray-500 mt-1">Technician Signature: ___________________ Date: ___________</p>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-6">
        Generated by RentFlow Kenya on {new Date().toLocaleString('en-KE')}
      </p>
    </div>
  );
}
