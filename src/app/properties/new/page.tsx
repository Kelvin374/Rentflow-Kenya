'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createProperty } from '@/lib/supabase-api';
import { ArrowLeft, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PaymentInfo } from '@/types';

const defaultPaymentInfo: PaymentInfo = {
  mpesaPaybill: '247247',
  mpesaAccount: '',
  tillNumber: '123456',
  bankName: 'Equity Bank',
  bankAccountName: '',
  bankAccount: '',
};

export default function NewPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState({ name: '', location: '', description: '', units: '' });
  const [showPayment, setShowPayment] = useState(false);
  const [payment, setPayment] = useState<PaymentInfo>(defaultPaymentInfo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    await createProperty({
      name: form.name,
      location: form.location,
      description: form.description,
      units: parseInt(form.units),
      landlord_id: user?.id || '',
      payment_info: payment,
    });

    setSaving(false);
    router.push('/properties');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add New Property</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-danger bg-red-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Azure Heights" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Westlands, Nairobi" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Property description..." rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units</label>
              <input type="number" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. 24" required min="1" />
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setShowPayment(!showPayment)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone size={18} className="text-primary" />
                  <span className="font-medium text-sm text-gray-900">Payment Details</span>
                </div>
                {showPayment ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {showPayment && (
                <div className="p-4 space-y-4">
                  <p className="text-xs text-gray-500">Configure how tenants pay rent for this property.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">M-Pesa Paybill</label>
                      <input type="text" value={payment.mpesaPaybill} onChange={(e) => setPayment({ ...payment, mpesaPaybill: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">M-Pesa Account</label>
                      <input type="text" value={payment.mpesaAccount} onChange={(e) => setPayment({ ...payment, mpesaAccount: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Till Number</label>
                      <input type="text" value={payment.tillNumber} onChange={(e) => setPayment({ ...payment, tillNumber: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
                      <input type="text" value={payment.bankName} onChange={(e) => setPayment({ ...payment, bankName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bank Account Name</label>
                      <input type="text" value={payment.bankAccountName} onChange={(e) => setPayment({ ...payment, bankAccountName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bank Account Number</label>
                      <input type="text" value={payment.bankAccount} onChange={(e) => setPayment({ ...payment, bankAccount: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Property'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
