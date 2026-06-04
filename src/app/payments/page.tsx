'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { PaymentModal } from '@/components/PaymentModal';
import { useAuth } from '@/lib/auth';
import { subscriptionPlans } from '@/lib/seed-data';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { Banknote, TrendingUp, AlertTriangle, CheckCircle, Download, Crown, Smartphone } from 'lucide-react';
import { fetchPayments } from '@/lib/supabase-api';
import type { Payment } from '@/types';

export default function PaymentsPage() {
  const { user } = useAuth();
  const plan = subscriptionPlans.find((p) => p.tier === user?.subscription || 'free')!;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    fetchPayments().then(setPayments).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    return true;
  });

  const paid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Collected" value={formatCurrency(paid)} subtitle="This month" icon={Banknote} variant="success" />
          <StatsCard title="Pending" value={formatCurrency(pending)} icon={AlertTriangle} variant="warning" />
          <StatsCard title="Overdue" value={formatCurrency(overdue)} icon={AlertTriangle} variant="danger" />
          <StatsCard title="Collection Rate" value={payments.length > 0 ? `${Math.round((paid / (paid + pending + overdue)) * 100)}%` : '0%'} subtitle="+5% vs last month" icon={TrendingUp} variant="success" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => alert('Exporting payments...')}><Download size={16} /> Export</Button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-400 py-8 text-sm">No payments match your filters</td></tr>
                ) : filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
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
                        {payment.status === 'paid' ? <CheckCircle size={12} /> : null}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">{payment.transactionId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} mode={plan.autoReconcile ? 'auto' : 'manual'} />
    </div>
  );
}
