'use client';

import type { Payment, Tenant, Property } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  tenant: Tenant;
  property: Property;
  payments: Payment[];
}

export function RentStatementDocument({ tenant, property, payments }: Props) {
  const paid = payments.filter((p) => p.status === 'paid');
  const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'pending');
  const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);
  const overdue = payments.filter((p) => p.status === 'overdue');
  const totalOverdue = overdue.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 text-sm text-gray-900 font-sans">
      <div className="text-center border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold">RENT STATEMENT</h1>
        <p className="text-lg font-semibold mt-1">RentFlow Kenya</p>
        <p className="text-xs text-gray-500">P.O. Box 12345-00100, Nairobi, Kenya</p>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-500">Statement Date:</p>
          <p className="font-semibold">{new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Tenant Since:</p>
          <p className="font-semibold">{new Date(tenant.leaseStart).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-sm mb-3">ACCOUNT HOLDER</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Name:</span><br /><span className="font-semibold">{tenant.name}</span></div>
          <div><span className="text-gray-500">ID No:</span><br /><span className="font-semibold">{tenant.nationalId}</span></div>
          <div><span className="text-gray-500">Property:</span><br /><span className="font-semibold">{property.name}, Unit {tenant.unitNumber}</span></div>
          <div><span className="text-gray-500">Monthly Rent:</span><br /><span className="font-semibold">{formatCurrency(tenant.rentAmount)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Total Paid</p>
          <p className="text-lg font-bold text-success">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-lg font-bold text-warning">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-lg font-bold text-danger">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="text-left py-2 text-xs uppercase text-gray-500">Date</th>
            <th className="text-left py-2 text-xs uppercase text-gray-500">Description</th>
            <th className="text-center py-2 text-xs uppercase text-gray-500">Method</th>
            <th className="text-right py-2 text-xs uppercase text-gray-500">Reference</th>
            <th className="text-right py-2 text-xs uppercase text-gray-500">Amount</th>
            <th className="text-right py-2 text-xs uppercase text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-400">No payment records found.</td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-200">
                <td className="py-2">{new Date(p.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="py-2">Rent — {property.name}</td>
                <td className="py-2 text-center capitalize">{p.method}</td>
                <td className="py-2 text-right text-xs">{p.transactionId || p.receiptId || '—'}</td>
                <td className="py-2 text-right font-semibold">{formatCurrency(p.amount)}</td>
                <td className="py-2 text-right">
                  <span className={`text-xs font-semibold ${
                    p.status === 'paid' ? 'text-success' : p.status === 'pending' ? 'text-warning' : 'text-danger'
                  }`}>{p.status.toUpperCase()}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-900 font-bold">
            <td colSpan={4} className="py-3 text-right">BALANCE</td>
            <td className="py-3 text-right">{formatCurrency(totalPaid + totalPending + totalOverdue)}</td>
            <td className="py-3 text-right">
              <span className={totalOverdue > 0 ? 'text-danger' : 'text-success'}>
                {totalOverdue > 0 ? 'OVERDUE' : 'CLEAR'}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> This statement reflects all transactions recorded in the RentFlow system.
          If you notice any discrepancies, please contact accounts@rentflow.co.ke or call +254 712 345 678.
        </p>
      </div>

      <div className="border-t border-gray-300 pt-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 mb-6">Authorized Signature</p>
            <div className="border-b border-gray-400 w-48" />
            <p className="text-xs text-gray-500 mt-1">RentFlow Kenya — Accounts Department</p>
          </div>
          <p className="text-xs text-gray-400">Page 1 of 1</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-6">
        Generated by RentFlow Kenya on {new Date().toLocaleString('en-KE')}
      </p>
    </div>
  );
}
