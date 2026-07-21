'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchTenantPayments, fetchTenantDashboardData } from '@/lib/supabase-api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ErrorMessage } from '@/components/ErrorMessage';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar } from '@/components/Avatar';
import { useSidebar } from '@/components/SidebarContext';
import { PaymentModal } from '@/components/PaymentModal';
import { useToast } from '@/components/Toast';
import { CheckCircle, AlertTriangle, Clock, Banknote } from 'lucide-react';
import type { Payment } from '@/types';

export default function TenantPaymentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { openMobile } = useSidebar();
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [paymentModal, setPaymentModal] = useState(false);
  const [leaseData, setLeaseData] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [pmts, dashboard] = await Promise.all([
        fetchTenantPayments(user.id),
        fetchTenantDashboardData(user.id, user.name),
      ]);
      setPayments(pmts);
      if (dashboard.lease) setLeaseData(dashboard.lease);
    } catch (e: any) {
      setError(e?.message || 'Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'tenant') { router.push('/dashboard'); return; }
    loadData();
  }, [user, isAuthenticated, isLoading, router, loadData]);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.unitNumber?.toLowerCase().includes(q) && !p.transactionId?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const paid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={error} onRetry={loadData} />
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
          <h1 className="text-xl font-bold text-on-surface">Payments</h1>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Banknote size={20} className="text-success" />
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Total Paid</span>
            </div>
            <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(paid)}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock size={20} className="text-warning" />
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Pending</span>
            </div>
            <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(pending)}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-error" />
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Overdue</span>
            </div>
            <p className="text-[24px] leading-[32px] font-bold text-on-surface">{formatCurrency(overdue)}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-primary" />
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Total Payments</span>
            </div>
            <p className="text-[24px] leading-[32px] font-bold text-on-surface">{payments.length}</p>
          </div>
        </div>

        {/* Pay Now Button */}
        {leaseData && (
          <div className="mb-6">
            <button
              onClick={() => setPaymentModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Pay Now — {formatCurrency(Number(leaseData.rent_amount))}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-[18px] border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
              placeholder="Search by unit or transaction ID..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          {(search || statusFilter !== 'all') && (
            <>
              <div className="h-8 w-[1px] bg-outline-variant" />
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear
              </button>
            </>
          )}
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-5 py-3">Unit</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-8 text-sm">No payments found</td></tr>
                ) : filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{payment.unitNumber || '—'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDate(payment.date)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status === 'paid' ? <CheckCircle size={12} /> : null}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{payment.transactionId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <PaymentModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        amount={leaseData?.rent_amount ? String(leaseData.rent_amount) : '0'}
        onSuccess={() => { showToast('Payment successful!', 'success'); loadData(); }}
      />
    </div>
  );
}
