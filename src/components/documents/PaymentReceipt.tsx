'use client';

import type { Payment, Tenant, Property } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  payment: Payment;
  tenant: Tenant;
  property: Property;
}

export function PaymentReceiptDocument({ payment, tenant, property }: Props) {
  const receiptId = payment.receiptId || `RCP-${payment.id.toUpperCase()}-${payment.date.replace(/-/g, '')}`;

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 text-sm text-gray-900 font-sans">
      <div className="text-center border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold">OFFICIAL RECEIPT</h1>
        <p className="text-lg font-semibold mt-1">RentFlow Kenya</p>
        <p className="text-xs text-gray-500">P.O. Box 12345-00100, Nairobi, Kenya | M-Pesa Paybill: 247247</p>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs text-gray-500">Receipt No:</p>
          <p className="font-bold text-lg">{receiptId}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Date:</p>
          <p className="font-semibold">{new Date(payment.date).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-sm mb-3">RECEIVED FROM</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Tenant Name:</span><br /><span className="font-semibold">{tenant.name}</span></div>
          <div><span className="text-gray-500">ID Number:</span><br /><span className="font-semibold">{tenant.nationalId}</span></div>
          <div><span className="text-gray-500">Phone:</span><br /><span className="font-semibold">{tenant.phone}</span></div>
          <div><span className="text-gray-500">Email:</span><br /><span className="font-semibold">{tenant.email}</span></div>
          <div className="col-span-2"><span className="text-gray-500">Property:</span><br /><span className="font-semibold">{property.name}, Unit {payment.unitNumber}</span></div>
        </div>
      </div>

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="text-left py-2 text-xs uppercase text-gray-500">Description</th>
            <th className="text-right py-2 text-xs uppercase text-gray-500">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3">Rent Payment — {new Date(payment.date).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</td>
            <td className="py-3 text-right font-semibold">{formatCurrency(payment.amount)}</td>
          </tr>
          <tr>
            <td className="py-3 text-gray-500">Outstanding Balance</td>
            <td className="py-3 text-right text-gray-500">KSH 0.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-900">
            <td className="py-3 font-bold text-lg">TOTAL</td>
            <td className="py-3 text-right font-bold text-lg">{formatCurrency(payment.amount)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <span className="text-gray-500">Payment Method:</span>
          <p className="font-semibold">{payment.method === 'mpesa' ? 'M-Pesa' : payment.method === 'bank' ? 'Bank Transfer' : 'Cash'}</p>
        </div>
        {payment.transactionId && (
          <div>
            <span className="text-gray-500">Transaction ID:</span>
            <p className="font-semibold">{payment.transactionId}</p>
          </div>
        )}
        <div>
          <span className="text-gray-500">Payment Status:</span>
          <p className={`font-semibold ${payment.status === 'paid' ? 'text-success' : payment.status === 'pending' ? 'text-warning' : 'text-danger'}`}>
            {payment.status.toUpperCase()}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Period:</span>
          <p className="font-semibold">{new Date(payment.date).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="border-t border-gray-300 pt-4 mt-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 mb-6">Authorized Signature</p>
            <div className="border-b border-gray-400 w-48" />
            <p className="text-xs text-gray-500 mt-1">RentFlow Kenya — Authorized Representative</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Stamp</p>
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-300 mt-1">
              STAMP
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-6">
        This is a computer-generated receipt. No signature is required. | Generated by RentFlow Kenya on {new Date().toLocaleString('en-KE')}
      </p>
    </div>
  );
}
