'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/PaymentModal';
import { useAuth } from '@/lib/auth';
import { RoleGuard } from '@/components/RoleGuard';

import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { Banknote, TrendingUp, AlertTriangle, CheckCircle, Download, Crown, Smartphone, Clock, X, ShieldCheck } from 'lucide-react';
import { fetchLandlordPayments, approvePayment, rejectPayment } from '@/lib/supabase-api';
import type { Payment } from '@/types';

export default function PaymentsPage() {
  return (
    <RoleGuard allowedRoles={['landlord']}>
      <PaymentsContent />
    </RoleGuard>
  );
}

function PaymentsContent() {
  const { user } = useAuth();
  const subscriptionTier = user?.subscription || 'free';
  const plan = { autoReconcile: subscriptionTier === 'professional' || subscriptionTier === 'enterprise' };
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; paymentId: string; tenantName: string }>({ open: false, paymentId: '', tenantName: '' });
  const [rejectReason, setRejectReason] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLandlordPayments(user?.id || '').then(setPayments).catch((e) => setError(e?.message || 'Failed to load payments. Please try again.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useRealtimeSubscription(
    'payments-list',
    [{ event: '*', table: 'payments' }],
    () => loadData()
  );

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.tenantName?.toLowerCase().includes(q) &&
        !p.unitNumber?.toLowerCase().includes(q) &&
        !p.transactionId?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const paid = payments.filter((p) => p.status === 'paid' || p.status === 'approved').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'pending' || p.status === 'pending_verification').reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);
  const pendingReview = payments.filter((p) => p.status === 'pending_verification');

  const handleApprove = async (paymentId: string) => {
    setActionLoading(paymentId);
    const result = await approvePayment(paymentId, user?.id || '');
    if (result.error) {
      setError(result.error);
    } else {
      loadData();
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(rejectModal.paymentId);
    const result = await rejectPayment(rejectModal.paymentId, rejectReason.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setRejectModal({ open: false, paymentId: '', tenantName: '' });
      setRejectReason('');
      loadData();
    }
    setActionLoading(null);
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div>
      <Header title="Payments" subtitle="Track and manage rent payments" />

      <div className="p-6 space-y-6">
        {!plan.autoReconcile ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Crown size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Free Plan &mdash; Manual Payment Recording</p>
              <p className="text-xs text-amber-700 mt-1">Payments must be entered manually. Upgrade to Professional or Enterprise for auto-reconciliation &mdash; tenant M-Pesa payments reflect instantly.</p>
              <button onClick={() => window.location.href = '/settings'} className="text-xs text-amber-800 font-medium underline mt-1 inline-block">Upgrade Now</button>
            </div>
          </div>
        ) : (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
            <Smartphone size={20} className="text-success flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Auto-Reconciliation Active</p>
              <p className="text-xs text-green-700 mt-1">Tenant M-Pesa payments are reconciled automatically. No manual entry needed.</p>
            </div>
          </div>
        )}

        {/* Pending Review Banner */}
        {pendingReview.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">{pendingReview.length} payment{pendingReview.length !== 1 ? 's' : ''} awaiting your review</p>
              <p className="text-xs text-blue-700 mt-1">Tenants have submitted payments that need your verification before balances are updated.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Collected" value={formatCurrency(paid)} subtitle="Approved + Paid" icon={Banknote} variant="success" />
          <StatsCard title="Pending Review" value={formatCurrency(pending)} icon={Clock} variant="warning" />
          <StatsCard title="Overdue" value={formatCurrency(overdue)} icon={AlertTriangle} variant="danger" />
          <StatsCard title="Collection Rate" value={payments.length > 0 ? `${Math.round((paid / (paid + pending + overdue)) * 100)}%` : '0%'} subtitle="Of total payments" icon={TrendingUp} variant="success" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
              placeholder="Search by tenant, unit, or transaction ID..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Statuses</option>
              <option value="pending_verification">Awaiting Review</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          {(search || statusFilter !== 'all' || methodFilter !== 'all') && (
            <>
              <div className="h-8 w-[1px] bg-outline-variant" />
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); setMethodFilter('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear
              </button>
            </>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm"><Download size={16} /> Export</Button>
            <Button size="sm" onClick={() => setShowPaymentModal(true)}>Record Payment</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-5 py-3">Tenant</th>
                  <th className="px-5 py-3">Unit</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Transaction ID</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-gray-400 py-8 text-sm">No payments match your filters</td></tr>
                ) : filteredPayments.map((payment) => (
                  <tr key={payment.id} className={`hover:bg-gray-50 transition-colors ${payment.status === 'pending_verification' ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{payment.tenantName}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{payment.unitNumber}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDate(payment.date)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {payment.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status === 'paid' || payment.status === 'approved' ? <CheckCircle size={12} /> : null}
                        {payment.status === 'pending_verification' ? 'Awaiting Review' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      {payment.status === 'rejected' && payment.rejectionReason && (
                        <p className="text-[11px] text-red-500 mt-1 max-w-[200px]">{payment.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{payment.transactionId || '-'}</td>
                    <td className="px-5 py-3">
                      {payment.status === 'pending_verification' ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleApprove(payment.id)}
                            disabled={actionLoading === payment.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === payment.id ? (
                              <div className="w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, paymentId: payment.id, tenantName: payment.tenantName })}
                            disabled={actionLoading === payment.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors disabled:opacity-50"
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} landlordId={user?.id} onSuccess={loadData} />

      {/* Reject Payment Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reject Payment</h2>
                <p className="text-sm text-gray-500 mt-0.5">{rejectModal.tenantName}</p>
              </div>
              <button onClick={() => { setRejectModal({ open: false, paymentId: '', tenantName: '' }); setRejectReason(''); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for rejection <span className="text-red-500">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this payment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <Button variant="outline" size="sm" onClick={() => { setRejectModal({ open: false, paymentId: '', tenantName: '' }); setRejectReason(''); }}>Cancel</Button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectModal.paymentId}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModal.paymentId ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X size={14} />
                )}
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
