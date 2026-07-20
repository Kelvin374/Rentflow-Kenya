'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchPropertiesSimple, createTenant, fetchUnitsByProperty } from '@/lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

function NewTenantForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const preselectedProperty = searchParams.get('propertyId') || '';
  const [properties, setProperties] = useState<any[]>([]);
  const [vacantUnits, setVacantUnits] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '2547', nationalId: '',
    propertyId: preselectedProperty, unitId: '',
    rentAmount: '', leaseStart: '', leaseEnd: '',
    emergencyContact: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchPropertiesSimple().then(setProperties);
  }, []);

  useEffect(() => {
    if (form.propertyId) {
      fetchUnitsByProperty(form.propertyId).then((allUnits) => {
        const vacant = allUnits.filter((u: any) => u.status === 'vacant');
        setVacantUnits(vacant);
        setForm((prev) => ({ ...prev, unitId: '', rentAmount: '' }));
      });
    } else {
      setVacantUnits([]);
    }
  }, [form.propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const tenantId = crypto.randomUUID();

    const selectedUnit = vacantUnits.find((u: any) => u.id === form.unitId);
    const { error } = await createTenant({
      id: tenantId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      nationalId: form.nationalId,
      propertyId: form.propertyId,
      unitNumber: selectedUnit?.unit_number || '',
      rentAmount: parseFloat(form.rentAmount),
      leaseStart: form.leaseStart,
      leaseEnd: form.leaseEnd,
      emergencyContact: form.emergencyContact,
    });

    if (error) { setError(error); setSaving(false); showToast(error, 'error'); return; }

    setSaving(false);
    showToast('Tenant added successfully!', 'success');
    router.push('/tenants');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add New Tenant</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-error bg-error-container/30 p-3 rounded-xl">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                <input type="text" value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                  <option value="">Select property</option>
                  {properties.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vacant Unit</label>
                <select
                  value={form.unitId}
                  onChange={(e) => {
                    const unit = vacantUnits.find((u: any) => u.id === e.target.value);
                    setForm({ ...form, unitId: e.target.value, rentAmount: unit ? String(unit.monthly_rent) : '' });
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required disabled={!form.propertyId}
                >
                  <option value="">{form.propertyId ? (vacantUnits.length ? 'Select unit' : 'No vacant units') : 'Select property first'}</option>
                  {vacantUnits.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.unit_number} — {u.type} — KSh {Number(u.monthly_rent).toLocaleString()}/mo</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (KSH)</label>
                <input type="number" value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input type="tel" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
                <input type="date" value={form.leaseStart} onChange={(e) => setForm({ ...form, leaseStart: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
                <input type="date" value={form.leaseEnd} onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Tenant'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTenantPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading...</div>}>
      <NewTenantForm />
    </Suspense>
  );
}
