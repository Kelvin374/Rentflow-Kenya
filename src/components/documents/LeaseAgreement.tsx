'use client';

import type { LeaseAgreement as LeaseAgreementType, Tenant, Property } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  lease: LeaseAgreementType;
  tenant: Tenant;
  property: Property;
}

export function LeaseAgreementDocument({ lease, tenant, property }: Props) {
  return (
    <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-0 text-sm text-gray-900 font-sans">
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center">LEASE AGREEMENT</h1>
        <p className="text-center text-gray-500 mt-1">Prepared under the Laws of Kenya</p>
      </div>

      <p className="text-xs text-gray-400 text-right mb-6">
        Agreement Date: {new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">PARTIES</h2>
        <p className="mb-1"><span className="font-semibold">Landlord:</span> RentFlow Properties Ltd, P.O. Box 12345-00100, Nairobi, Kenya</p>
        <p><span className="font-semibold">Tenant:</span> {tenant.name}, ID No. {tenant.nationalId}, {tenant.phone}, {tenant.email}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">DEMISED PREMISES</h2>
        <p>The Landlord agrees to lease to the Tenant the premises known as:</p>
        <p className="font-semibold mt-1">{property.name}, Unit {lease.unitNumber}, {property.location}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">TERM</h2>
        <div className="grid grid-cols-3 gap-4">
          <div><span className="font-semibold">Start Date:</span><br />{lease.startDate}</div>
          <div><span className="font-semibold">End Date:</span><br />{lease.endDate}</div>
          <div><span className="font-semibold">Status:</span><br />{lease.status.toUpperCase()}</div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">RENT & DEPOSIT</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-semibold">Monthly Rent:</span>
            <p className="text-lg font-bold">{formatCurrency(lease.rentAmount)}</p>
          </div>
          <div>
            <span className="font-semibold">Security Deposit:</span>
            <p className="text-lg font-bold">{formatCurrency(lease.depositAmount)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Rent payable in advance on or before the 5th day of each month via M-Pesa Paybill, Bank Transfer, or Cash.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">TERMS & CONDITIONS</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>The Tenant shall pay rent promptly on the due date without demand.</li>
          <li>The Tenant shall not sublet, assign, or part with possession of the premises or any part thereof.</li>
          <li>The Tenant shall keep the premises in good and tenantable repair and condition.</li>
          <li>The Tenant shall not make any alterations or additions without the Landlord's prior written consent.</li>
          <li>The Landlord reserves the right to inspect the premises upon 24 hours notice.</li>
          <li>Utilities (water, electricity, garbage) shall be paid by the Tenant directly.</li>
          <li>The Tenant shall comply with all estate by-laws and regulations.</li>
          <li>This agreement may be terminated by either party giving 30 days written notice.</li>
          <li>The security deposit shall be refunded within 30 days of vacating, subject to deductions for damages.</li>
          <li>Late payment of rent shall attract a penalty of 5% per month on the outstanding amount.</li>
        </ol>
      </section>

      {lease.terms && lease.terms !== 'Standard lease terms apply.' && (
        <section className="mb-6">
          <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">SPECIAL CONDITIONS</h2>
          <p>{lease.terms}</p>
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">SIGNATURES</h2>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div>
            <p className="font-semibold mb-6">LANDLORD</p>
            {lease.signedByLandlord ? (
              <p className="text-success text-xs">✓ Signed</p>
            ) : (
              <div className="border-b border-gray-400 h-8 mb-1" />
            )}
            <p className="text-xs text-gray-500">Name: ___________________ Date: ___________</p>
          </div>
          <div>
            <p className="font-semibold mb-6">TENANT</p>
            {lease.signedByTenant ? (
              <p className="text-success text-xs">✓ Signed</p>
            ) : (
              <div className="border-b border-gray-400 h-8 mb-1" />
            )}
            <p className="text-xs text-gray-500">Name: ___________________ Date: ___________</p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-300 pt-3 mt-6">
        <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">WITNESSES</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-semibold">Witness 1</p>
            <p className="text-xs text-gray-500">Name: ___________________ ID: ___________________</p>
            <p className="text-xs text-gray-500">Signature: _______________ Date: ___________</p>
          </div>
          <div>
            <p className="font-semibold">Witness 2</p>
            <p className="text-xs text-gray-500">Name: ___________________ ID: ___________________</p>
            <p className="text-xs text-gray-500">Signature: _______________ Date: ___________</p>
          </div>
        </div>
      </section>

      <p className="text-[10px] text-gray-400 text-center mt-8">
        This document was generated by RentFlow Kenya on {new Date().toLocaleString('en-KE')}
      </p>
    </div>
  );
}
