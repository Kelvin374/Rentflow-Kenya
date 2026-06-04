'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchPropertiesSimple, createMaintenanceRequest } from '@/lib/supabase-api';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NewMaintenancePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [form, setForm] = useState({
    propertyId: '', unitNumber: '', category: 'plumbing',
    description: '', priority: 'normal',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    fetchPropertiesSimple().then(setProperties);
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const allUnits = await import('@/lib/seed-data').then((m) => m.units);
    const foundUnit = allUnits.find(
      (u: any) => u.property_id === form.propertyId && u.unit_number === form.unitNumber
    );

    await createMaintenanceRequest({
      id: crypto.randomUUID(),
      tenant_id: user?.id || '',
      property_id: form.propertyId,
      unit_id: foundUnit?.id || '',
      category: form.category,
      description: form.description,
      priority: form.priority,
    });

    setSaving(false);
    router.push('/maintenance');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Maintenance Ticket</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-danger bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                <input type="text" value={form.unitNumber} onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. A-204" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="security">Security</option>
                  <option value="painting">Painting</option>
                  <option value="water">Water Supply</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="general">General Repairs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" required>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Describe the issue..." rows={4} required />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit Ticket'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
