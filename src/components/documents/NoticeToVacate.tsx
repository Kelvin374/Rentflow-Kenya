'use client';

import type { Tenant, Property, LeaseAgreement } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  tenant: Tenant;
  property: Property;
  lease: LeaseAgreement;
  noticeDate?: string;
  vacateDate?: string;
  reason?: string;
  initiatedBy: 'landlord' | 'tenant';
}

export function NoticeToVacateDocument({
  tenant, property, lease, noticeDate, vacateDate, reason, initiatedBy,
}: Props) {
  const noticeDateStr = noticeDate || new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });
  const vacateDateStr = vacateDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 text-sm text-gray-900 font-sans">
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center">NOTICE TO VACATE</h1>
        <p className="text-center text-gray-500 mt-1">Issued under Section 4 of the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act, Cap. 301</p>
      </div>

      <p className="text-xs text-gray-400 text-right mb-6">
        Notice Date: {noticeDateStr} | Reference: NTV-{tenant.id.toUpperCase()}-{new Date().getFullYear()}
      </p>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">TO</h2>
        <p className="font-semibold">{tenant.name}</p>
        <p>ID No: {tenant.nationalId}</p>
        <p>{tenant.phone} | {tenant.email}</p>
        <p className="mt-2">{property.name}, Unit {tenant.unitNumber}, {property.location}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">RE: NOTICE TO VACATE PREMISES</h2>
        <p className="mb-2">Dear {tenant.name},</p>
        {initiatedBy === 'landlord' ? (
          <>
            <p className="mb-2">
              TAKE NOTICE that the Landlord hereby requires you to vacate and deliver up vacant possession of the above premises
              on or before <strong>{vacateDateStr}</strong>, being a period of not less than thirty (30) days from the date of this notice.
            </p>
            {reason && (
              <p className="mb-2">
                <strong>Reason:</strong> {reason}
              </p>
            )}
            <p className="mb-2">
              Please ensure that all outstanding rent amounting to <strong>{formatCurrency(tenant.rentAmount)}</strong> per month is fully paid up to the date of vacating.
            </p>
            <p className="mb-2">
              The security deposit of <strong>{formatCurrency(lease.depositAmount)}</strong> will be refunded within 30 days of vacating,
              subject to inspection and deduction for any damages beyond normal wear and tear.
            </p>
          </>
        ) : (
          <>
            <p className="mb-2">
              I, {tenant.name}, hereby give notice of my intention to vacate the above premises
              on or before <strong>{vacateDateStr}</strong>.
            </p>
            {reason && (
              <p className="mb-2">
                <strong>Reason for vacating:</strong> {reason}
              </p>
            )}
            <p className="mb-2">
              I confirm that all outstanding rent will be cleared before the vacate date.
            </p>
          </>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">VACATION CHECKLIST</h2>
        <div className="space-y-1 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Clear all rent arrears</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Settle utility bills (water, electricity)</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Remove all personal belongings</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Clean the premises thoroughly</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Return all keys and access cards</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Schedule exit inspection with property manager</label>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">IMPORTANT NOTES</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Failure to vacate by the specified date may result in legal proceedings for eviction.</li>
          <li>The tenant remains liable for rent until the premises are vacated and keys returned.</li>
          <li>Any damages to the premises beyond normal wear and tear will be deducted from the security deposit.</li>
          <li>The landlord reserves the right to inspect the premises before the vacate date upon 24 hours notice.</li>
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-gray-300">
        {initiatedBy === 'landlord' ? (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-1">Landlord / Agent Signature</p>
              <div className="border-b border-gray-400 h-8" />
              <p className="text-xs text-gray-500 mt-1">Name: ___________________ Date: ___________</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tenant Acknowledgment</p>
              <div className="border-b border-gray-400 h-8" />
              <p className="text-xs text-gray-500 mt-1">I acknowledge receipt of this notice.</p>
              <p className="text-xs text-gray-500">Name: ___________________ Date: ___________</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tenant Signature</p>
              <div className="border-b border-gray-400 h-8" />
              <p className="text-xs text-gray-500 mt-1">Name: ___________________ Date: ___________</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Landlord / Agent Acknowledgment</p>
              <div className="border-b border-gray-400 h-8" />
              <p className="text-xs text-gray-500 mt-1">Name: ___________________ Date: ___________</p>
            </div>
          </>
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-6">
        Generated by RentFlow Kenya on {new Date().toLocaleString('en-KE')}
      </p>
    </div>
  );
}
