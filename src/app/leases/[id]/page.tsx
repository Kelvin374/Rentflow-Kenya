'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { fetchLeaseById } from '@/lib/supabase-api';

export default function LeaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaseById(params.id as string).then((data) => {
      setLease(data);
      setLoading(false);
    });
  }, [params.id]);

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="p-6 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  if (!lease) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Lease agreement not found</p>
        <Button onClick={() => router.push('/leases')} className="mt-4">Back to Leases</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lease Agreement</h1>
              <p className="text-sm text-gray-500">{lease.propertyName} &middot; Unit {lease.unitNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer size={16} /> Print</Button>
            <Button variant="outline" onClick={handlePrint}><Download size={16} /> PDF</Button>
          </div>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white print:px-0 print:py-0">
        <div className="p-8 sm:p-12 print:p-8" id="lease-document">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">RENTFLOW KENYA</h1>
            <p className="text-sm text-gray-500 mt-1">Property Management Solutions</p>
            <h2 className="text-lg font-semibold text-gray-800 mt-4">Tenancy / Lease Agreement</h2>
            <p className="text-sm text-gray-500">Prepared under the Laws of the Republic of Kenya</p>
          </div>

          {/* Reference */}
          <div className="flex justify-between text-sm text-gray-600 mb-6">
            <span><strong>Agreement No:</strong> {lease.id.toUpperCase()}</span>
            <span><strong>Date:</strong> {formatDate(lease.start_date)}</span>
            <span><strong>Status:</strong> <span className="capitalize">{lease.status}</span></span>
          </div>

          {/* Parties */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">1. PARTIES</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              THIS AGREEMENT is made on <strong>{formatDate(lease.start_date)}</strong> between:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">THE LANDLORD</p>
                <p className="text-gray-600">Name: {lease.tenantName ? 'Admin User' : 'Landlord'}</p>
                <p className="text-gray-600">ID/Passport: 12345678</p>
                <p className="text-gray-600">Phone: +254 712 345 678</p>
                <p className="text-gray-600">Email: admin@rentflow.co.ke</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">THE TENANT</p>
                <p className="text-gray-600">Name: {lease.tenantName}</p>
                <p className="text-gray-600">ID/Passport: {lease.tenantNationalId || '—'}</p>
                <p className="text-gray-600">Phone: {lease.tenantPhone || '—'}</p>
                <p className="text-gray-600">Email: {lease.tenantEmail || '—'}</p>
              </div>
            </div>
          </section>

          {/* Property */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">2. DEMISED PREMISES</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              The Landlord agrees to let and the Tenant agrees to take on lease the premises known as:
            </p>
            <div className="p-3 bg-gray-50 rounded-lg mt-2 text-sm">
              <p><strong>Property:</strong> {lease.propertyName}</p>
              <p><strong>Location:</strong> {lease.propertyLocation}</p>
              <p><strong>Unit:</strong> {lease.unitNumber} ({lease.unitType})</p>
            </div>
          </section>

          {/* Term */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">3. TERM</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              The tenancy shall commence on <strong>{formatDate(lease.start_date)}</strong> and shall continue until <strong>{formatDate(lease.end_date)}</strong> (the "Term"), unless terminated earlier in accordance with the provisions herein.
            </p>
          </section>

          {/* Rent */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">4. RENT</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Monthly Rent</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(lease.rent_amount)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Security Deposit</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(lease.deposit_amount)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mt-3">
              Rent shall be payable monthly in advance on or before the 5th day of each month. Payment shall be made via M-Pesa Paybill, bank transfer, or such other method as the Landlord may designate from time to time.
            </p>
          </section>

          {/* Obligations */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">5. TENANT'S OBLIGATIONS</h3>
            <ol className="text-sm text-gray-700 leading-relaxed space-y-1.5 list-decimal pl-5">
              <li>To pay the rent on the due date without any deduction whatsoever.</li>
              <li>To pay for all water and electricity consumption and other utilities serving the premises.</li>
              <li>To keep the premises in good and tenantable repair and condition.</li>
              <li>To permit the Landlord or their agents to enter the premises at reasonable hours for inspection or repairs.</li>
              <li>Not to assign, sublet, or part with possession of the premises or any part thereof without the Landlord's prior written consent.</li>
              <li>Not to make any structural alterations or additions to the premises without the Landlord's prior written consent.</li>
              <li>To comply with all laws, by-laws, and regulations of the local authority and the Republic of Kenya.</li>
              <li>To use the premises solely as a private dwelling and for no other purpose.</li>
              <li>Not to cause or permit any nuisance or annoyance to adjoining or neighboring occupiers.</li>
              <li>To deposit rubbish and waste in appropriate bins and comply with waste management regulations.</li>
            </ol>
          </section>

          {/* Landlord's Obligations */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">6. LANDLORD'S OBLIGATIONS</h3>
            <ol className="text-sm text-gray-700 leading-relaxed space-y-1.5 list-decimal pl-5">
              <li>To ensure the premises are in a habitable condition at the commencement of the tenancy.</li>
              <li>To maintain the structural integrity of the building and common areas.</li>
              <li>To carry out necessary repairs to the main structure, roof, and external walls.</li>
              <li>To insure the building against fire and other perils.</li>
              <li>To respect the Tenant's right to quiet enjoyment of the premises.</li>
            </ol>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">7. TERMINATION</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Either party may terminate this agreement by giving the other party <strong>one (1) month's</strong> written notice. The Landlord may terminate immediately in the event of:
            </p>
            <ol className="text-sm text-gray-700 leading-relaxed space-y-1.5 list-decimal pl-5 mt-2">
              <li>Non-payment of rent for a period of fourteen (14) days after the due date.</li>
              <li>Breach of any of the Tenant's obligations herein.</li>
              <li>Use of the premises for illegal or immoral purposes.</li>
              <li>Subletting or assigning the premises without the Landlord's consent.</li>
            </ol>
          </section>

          {/* Deposit */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">8. DEPOSIT</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              The security deposit of <strong>{formatCurrency(lease.deposit_amount)}</strong> shall be held by the Landlord as security against any breach of the terms herein. The deposit, less any deductions for rent arrears, damage beyond normal wear and tear, or any other sums due, shall be refunded to the Tenant within thirty (30) days of the termination of this agreement and vacant possession being given.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">9. DISPUTE RESOLUTION</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Any dispute arising out of or in connection with this agreement shall first be referred to mediation. If the dispute cannot be resolved within thirty (30) days, either party may refer the matter to the Business Premises Rent Tribunal or the relevant court of law in the Republic of Kenya.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">10. GOVERNING LAW</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              This agreement shall be governed by and construed in accordance with the laws of the Republic of Kenya, including but not limited to the Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap. 301), the Rent Restriction Act (Cap. 296), and the Constitution of Kenya 2010.
            </p>
          </section>

          {/* Entire Agreement */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">11. ENTIRE AGREEMENT</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements relating to the subject matter herein. No variation or amendment shall be effective unless made in writing and signed by both parties.
            </p>
          </section>

          {/* Additional Terms */}
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">12. ADDITIONAL TERMS</h3>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              &ldquo;{lease.terms || 'No additional terms.'}&rdquo;
            </p>
          </section>

          {/* Signatures */}
          <section className="mt-12 pt-6 border-t-2 border-gray-300">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">13. EXECUTION</h3>
            <p className="text-sm text-gray-600 mb-6">
              IN WITNESS WHEREOF the parties have hereunto set their hands on the date first written above.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="border-b border-gray-400 h-12 mb-1" />
                <p className="text-sm font-semibold text-gray-900">SIGNED by the LANDLORD</p>
                <p className="text-xs text-gray-400">Name: Admin User</p>
                <p className="text-xs text-gray-400">Date: {formatDate(lease.start_date)}</p>
                {lease.signed_by_landlord && (
                  <span className="text-xs text-success flex items-center gap-1 mt-1">✓ Signed</span>
                )}
              </div>
              <div>
                <div className="border-b border-gray-400 h-12 mb-1" />
                <p className="text-sm font-semibold text-gray-900">SIGNED by the TENANT</p>
                <p className="text-xs text-gray-400">Name: {lease.tenantName}</p>
                <p className="text-xs text-gray-400">Date: {formatDate(lease.start_date)}</p>
                {lease.signed_by_tenant && (
                  <span className="text-xs text-success flex items-center gap-1 mt-1">✓ Signed</span>
                )}
              </div>
            </div>
          </section>

          {/* Witness */}
          <section className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="border-b border-gray-400 h-12 mb-1" />
                <p className="text-sm font-semibold text-gray-900">WITNESS 1</p>
                <p className="text-xs text-gray-400">Name: ___________________________</p>
                <p className="text-xs text-gray-400">ID/Passport: _____________________</p>
                <p className="text-xs text-gray-400">Signature: _______________________</p>
              </div>
              <div>
                <div className="border-b border-gray-400 h-12 mb-1" />
                <p className="text-sm font-semibold text-gray-900">WITNESS 2</p>
                <p className="text-xs text-gray-400">Name: ___________________________</p>
                <p className="text-xs text-gray-400">ID/Passport: _____________________</p>
                <p className="text-xs text-gray-400">Signature: _______________________</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>
    </div>
  );
}
