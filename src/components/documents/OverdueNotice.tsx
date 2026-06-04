'use client';

import type { Payment, Tenant, Property } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  payment: Payment;
  tenant: Tenant;
  property: Property;
  daysOverdue: number;
  penaltyRate?: number;
}

export function OverdueNoticeDocument({ payment, tenant, property, daysOverdue, penaltyRate = 5 }: Props) {
  const penaltyAmount = payment.amount * (penaltyRate / 100);
  const totalDue = payment.amount + penaltyAmount;

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 text-sm text-gray-900 font-sans">
      <div className="border-b-2 border-danger pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center text-danger">PAYMENT REMINDER — OVERDUE</h1>
        <p className="text-center text-gray-500 mt-1">RentFlow Kenya — Property Management</p>
      </div>

      <p className="text-xs text-gray-400 text-right mb-6">
        Notice Date: {new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">TO</h2>
        <p className="font-semibold">{tenant.name}</p>
        <p>{tenant.phone} | {tenant.email}</p>
        <p className="mt-2">{property.name}, Unit {payment.unitNumber}, {property.location}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">RE: OVERDUE RENT PAYMENT</h2>
        <p className="mb-2">Dear {tenant.name},</p>
        <p className="mb-2">
          This is to notify you that your rent payment for <strong>{new Date(payment.date).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</strong> is now <strong className="text-danger">{daysOverdue} days overdue</strong>.
        </p>
        <p className="mb-2">
          Despite previous reminders, the amount of <strong>{formatCurrency(payment.amount)}</strong> remains unpaid.
        </p>
      </section>

      <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-sm mb-3">OUTSTANDING SUMMARY</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">Rent Amount</td>
              <td className="py-2 text-right">{formatCurrency(payment.amount)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Late Payment Penalty ({penaltyRate}% per month × {Math.ceil(daysOverdue / 30)} month(s))</td>
              <td className="py-2 text-right">{formatCurrency(penaltyAmount * Math.ceil(daysOverdue / 30))}</td>
            </tr>
            <tr className="border-t-2 border-danger">
              <td className="py-3 font-bold text-base">TOTAL OUTSTANDING</td>
              <td className="py-3 text-right font-bold text-lg text-danger">{formatCurrency(totalDue)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
        <p className="text-xs text-amber-700">
          <strong>Action Required:</strong> Please pay the full outstanding amount immediately to avoid further penalties and potential legal action.
          If payment has already been made, please disregard this notice.
        </p>
      </div>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">PAYMENT OPTIONS</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="border border-gray-200 rounded p-3">
            <p className="font-semibold">M-Pesa</p>
            <p>Paybill: <strong>247247</strong></p>
            <p>Account: <strong>{tenant.nationalId}</strong></p>
          </div>
          <div className="border border-gray-200 rounded p-3">
            <p className="font-semibold">Bank Transfer</p>
            <p>Equity Bank: <strong>1234567890</strong></p>
            <p>Branch: Nairobi</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">CONSEQUENCES OF NON-PAYMENT</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Additional late payment penalties will continue to accrue at {penaltyRate}% per month.</li>
          <li>Failure to pay within 14 days may result in disconnection of utilities.</li>
          <li>Failure to pay within 30 days may lead to legal proceedings including eviction.</li>
          <li>A negative credit report may be filed with credit reference bureaus.</li>
        </ul>
      </section>

      <div className="border-t border-gray-300 pt-4 mt-4">
        <p className="text-xs text-gray-500 mb-1">For queries, contact accounts@rentflow.co.ke or call +254 712 345 678.</p>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-6">
        This is a computer-generated notice. | Generated by RentFlow Kenya on {new Date().toLocaleString('en-KE')}
      </p>
    </div>
  );
}
