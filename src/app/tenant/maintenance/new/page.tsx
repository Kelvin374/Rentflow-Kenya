'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createMaintenanceRequest } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/Toast';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar } from '@/components/Avatar';
import { useSidebar } from '@/components/SidebarContext';
import { supabase } from '@/lib/supabase/client';

export default function TenantNewMaintenancePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { openMobile } = useSidebar();
  const { showToast } = useToast();

  const [units, setUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    unitId: '',
    category: 'plumbing',
    priority: 'normal',
    description: '',
  });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'tenant') { router.push('/access-denied'); return; }

    const loadUnits = async () => {
      const { data } = await supabase
        .from('units')
        .select('id, unit_number, property_id, properties(name)')
        .eq('tenant_id', user!.id);

      const resolved = (data || []).map((u: any) => ({
        id: u.id,
        unit_number: u.unit_number,
        property_id: u.property_id,
        property_name: u.properties?.name || 'Property',
      }));
      setUnits(resolved);
      if (resolved.length === 1) setForm((f) => ({ ...f, unitId: resolved[0].id }));
      setLoadingUnits(false);
    };
    loadUnits();
  }, [user, isAuthenticated, isLoading, router]);

  const selectedUnit = units.find((u) => u.id === form.unitId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!form.unitId) {
      setError('Please select a unit.');
      setSaving(false);
      return;
    }
    if (!form.description.trim()) {
      setError('Please describe the issue.');
      setSaving(false);
      return;
    }

    try {
      const unit = units.find((u) => u.id === form.unitId);
      await createMaintenanceRequest({
        id: crypto.randomUUID(),
        tenant_id: user!.id,
        property_id: unit?.property_id || '',
        unit_id: form.unitId,
        category: form.category,
        description: form.description.trim(),
        priority: form.priority,
      });
      showToast('Maintenance request submitted!', 'success');
      router.push('/tenant/maintenance');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loadingUnits) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 relative h-full">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-6 h-16 bg-surface border-b border-outline-variant sticky top-0 z-40">
        <div className="flex items-center gap-4 flex-1">
          <div className="md:hidden">
            <button onClick={openMobile} className="p-2 hover:bg-surface-container-high rounded-full">
              <span className="material-symbols-outlined text-primary">menu</span>
            </button>
          </div>
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-container-high rounded-full">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-on-surface">New Maintenance Request</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="w-px h-6 bg-outline-variant mx-2" />
          <div className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-low p-1 rounded-lg transition-colors">
            <Avatar src={user?.avatar} name={user?.name || ''} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="font-semibold text-sm leading-none">{user?.name}</p>
              <p className="text-[10px] text-on-surface-variant">Verified Tenant</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </div>
                )}

                {units.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Your Unit</label>
                    {units.length === 1 ? (
                      <div className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface">
                        {selectedUnit?.property_name} — Unit {selectedUnit?.unit_number}
                      </div>
                    ) : (
                      <select
                        value={form.unitId}
                        onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                        className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option value="">Select your unit</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.property_name} — Unit {u.unit_number}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {units.length === 0 && (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-outline text-4xl mb-2 block">home</span>
                    <p className="text-sm text-on-surface-variant">You are not assigned to any unit yet.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    >
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
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={saving || units.length === 0}>
                    {saving ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
