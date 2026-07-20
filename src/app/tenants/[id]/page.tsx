'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Calendar, FileText, CreditCard, Wrench, Trash2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { fetchTenantById, deactivateTenant } from '@/lib/supabase-api';
import { useAuth } from '@/lib/auth';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTenantById(params.id as string).then((result) => {
      if (!result) { setLoading(false); return; }
      setTenant(result);
      setPayments(result.payments);
      setMaintenance(result.maintenance);
      setLease(result.lease);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return <div className="p-6 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  if (!tenant) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Tenant not found</p>
        <Button onClick={() => router.push('/tenants')} className="mt-4">Back to Tenants</Button>
      </div>
    );
  }

  const handleDeactivate = async () => {
    setDeactivating(true);
    const { error } = await deactivateTenant(tenant.id);
    if (error) {
      alert(error);
      setDeactivating(false);
      setShowDeactivateDialog(false);
      return;
    }
    router.push('/tenants');
  };

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s: number, p: any) => s + Number(p.amount), 0);

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/tenants')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
              {tenant.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-sm text-gray-500">{tenant.unitNumber} &middot; {tenant.propertyName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${tenant.phone}`}>
              <Button variant="outline" size="sm"><Phone size={14} /> Call</Button>
            </a>
            <a href={`mailto:${tenant.email}`}>
              <Button variant="outline" size="sm"><Mail size={14} /> Email</Button>
            </a>
            {isAdmin && (
              <Button variant="danger" size="sm" onClick={() => setShowDeactivateDialog(true)}>
                <UserX size={14} /> Deactivate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Rent Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(tenant.rentAmount)}</p>
            <p className="text-xs text-gray-400">Per month</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-success">{payments.filter((p: any) => p.status === 'paid').length} payments</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(payments[0]?.status || 'pending')}`}>
              {(payments[0]?.status || 'pending').charAt(0).toUpperCase() + (payments[0]?.status || 'pending').slice(1)}
            </span>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Lease End</p>
            <p className="text-2xl font-bold text-gray-900">{lease ? formatDate(lease.end_date) : '—'}</p>
            <p className="text-xs text-gray-400">{lease ? `Started ${formatDate(lease.start_date)}` : 'No active lease'}</p>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><CreditCard size={16} /> Payment History</h3>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No payments recorded</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</p>
                        <p className="text-xs text-gray-400">{formatDate(p.due_date)} &middot; {(p.method || 'mpesa').toUpperCase()}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(p.status)}`}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Wrench size={16} /> Maintenance Requests</h3>
            </CardHeader>
            <CardContent>
              {maintenance.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No maintenance requests</p>
              ) : (
                <div className="space-y-2">
                  {maintenance.map((m: any) => (
                    <Link key={m.id} href={`/maintenance/${m.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.description}</p>
                        <p className="text-xs text-gray-400">{m.category.replace('_', ' ')} &middot; {m.priority}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(m.status)}`}>
                        {m.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {lease && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText size={16} /> Lease Agreement</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Start Date</p>
                  <p className="text-sm font-medium">{formatDate(lease.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">End Date</p>
                  <p className="text-sm font-medium">{formatDate(lease.end_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Deposit</p>
                  <p className="text-sm font-medium">{formatCurrency(lease.deposit_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    lease.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                  }`}>{lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}</span>
                </div>
              </div>
              {lease.terms && <p className="text-sm text-gray-500 mt-3">{lease.terms}</p>}
              <div className="flex gap-2 mt-4">
                {lease.signed_by_tenant && <span className="text-xs text-success flex items-center gap-1">✓ Signed by Tenant</span>}
                {lease.signed_by_landlord && <span className="text-xs text-success flex items-center gap-1">✓ Signed by Landlord</span>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeactivateDialog}
        title="Deactivate Tenant"
        message={`Are you sure you want to deactivate "${tenant.name}"? This tenant will be removed from the active tenant list and their unit will be marked as vacant.`}
        warning="The tenant's payment history will be preserved, but they will no longer appear in your active tenants."
        confirmLabel={deactivating ? 'Deactivating...' : 'Deactivate Tenant'}
        onConfirm={handleDeactivate}
        onCancel={() => setShowDeactivateDialog(false)}
      />
    </div>
  );
}
