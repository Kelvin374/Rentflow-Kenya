'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchTenantDashboardData } from '@/lib/supabase-api';
import { Button } from '@/components/ui/button';
import { formatCurrency, getInitials, getStatusColor } from '@/lib/utils';
import {
  Bell, HelpCircle, Menu, X, Smartphone, Download, History,
  ArrowRight, CheckCircle, CalendarDays, Wallet, FileText,
  Hammer, Phone, Mail, Megaphone, ChevronRight, Home, Receipt, Wrench, CreditCard, Settings,
  Copy, PhoneCall,
} from 'lucide-react';
import type { PaymentInfo } from '@/types';

export default function TenantDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [copied, setCopied] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [leaseData, setLeaseData] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'tenant') { router.push('/dashboard'); return; }

    fetchTenantDashboardData(user.id).then((result) => {
      if (result.property) setPropertyData(result.property);
      if (result.lease) setLeaseData(result.lease);
      setMaintenance(result.maintenance);
      setPageLoading(false);
    });
  }, [user, isAuthenticated, isLoading, router]);

  const paymentInfo: PaymentInfo | null = propertyData?.payment_info || null;

  const leaseEnd = leaseData?.end_date || '2025-08-01';
  const leaseUnitNumber = leaseData?.unit_number || 'Block C, Apt 402';
  const nextDue = new Date();
  nextDue.setDate(5);
  if (nextDue < new Date()) nextDue.setMonth(nextDue.getMonth() + 1);
  const daysToDue = Math.ceil((nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const leaseEndDate = new Date(leaseEnd);
  const daysLeft = Math.ceil((leaseEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const paymentMethods = paymentInfo ? [
    {
      icon: Smartphone,
      title: 'M-Pesa',
      details: [
        { label: 'Paybill', value: paymentInfo.mpesaPaybill },
        { label: 'Account', value: paymentInfo.mpesaAccount },
      ],
    },
    {
      icon: Smartphone,
      title: 'M-Pesa Till',
      details: [
        { label: 'Till Number', value: paymentInfo.tillNumber },
      ],
    },
    {
      icon: Wallet,
      title: 'Bank Transfer',
      details: [
        { label: 'Bank', value: paymentInfo.bankName },
        { label: 'Account Name', value: paymentInfo.bankAccountName },
        { label: 'Account No', value: paymentInfo.bankAccount },
      ],
    },
  ] : [];

  if (pageLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-bold text-sm text-gray-900">RentFlow Kenya</span>
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 text-gray-400 hover:text-gray-600">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600">
              <HelpCircle size={20} />
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-1.5 text-gray-400">
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 pb-24 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Jambo, {user?.name?.split(' ')[0] || 'Tenant'}!</h1>
            <p className="text-sm text-gray-500">Your unit: {propertyData?.name || 'Garden City Heights'}, {leaseData?.unit_id ? 'View Lease' : leaseUnitNumber}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowPaymentInfo(true)}><CreditCard size={16} /> Pay Rent</Button>
            <Button size="sm" variant="outline" onClick={() => router.push('/maintenance/new')}><Hammer size={16} /> Request Repair</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarDays size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rent Status - Next Due Date</p>
              <p className="text-xl font-bold text-gray-900">{nextDue.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}</p>
              <span className="inline-flex items-center gap-1 text-xs text-success mt-1">
                <CheckCircle size={12} /> {daysToDue} Days Remaining
              </span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
              <Wallet size={24} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Balance - Outstanding</p>
              <p className="text-xl font-bold text-gray-900">KSH 0.00</p>
              <p className="text-xs text-gray-400 mt-1">All accounts are up to date.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Lease Agreement</p>
              <p className="text-xs text-gray-500">Active Lease &bull; Expires: {leaseEnd} ({daysLeft} days left)</p>
            </div>
          </div>
          <Link href={`/leases/${leaseData?.id || '#'}`} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            View Document <ArrowRight size={14} />
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Maintenance Requests</h3>
            <span className="text-xs text-primary font-medium">{maintenance.length} Active</span>
          </div>
          <div className="space-y-2">
            {maintenance.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <span className="text-sm">🔧</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{req.description}</p>
                  <p className="text-xs text-gray-400">Requested {Math.floor((Date.now() - new Date(req.created_at).getTime()) / (1000 * 60 * 60))} hours ago &bull; {req.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </div>
            ))}
            {maintenance.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No pending maintenance requests.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => setShowPaymentInfo(true)} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-primary" />
                <span className="text-sm font-medium">Pay via M-PESA</span>
              </div>
              <ArrowRight size={16} className="text-gray-300" />
            </button>
            <button onClick={() => alert('Latest receipt downloaded')} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Receipt size={20} className="text-success" />
                <span className="text-sm font-medium">Download Receipt</span>
              </div>
              <Download size={16} className="text-gray-300" />
            </button>
            <button onClick={() => setShowPaymentInfo(true)} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <History size={20} className="text-warning" />
                <span className="text-sm font-medium">Payment History</span>
              </div>
              <History size={16} className="text-gray-300" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Property Manager</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                SW
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Sarah Wambui</p>
                <p className="text-xs text-gray-400">Westside Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="tel:+254712345678"><Button size="sm" variant="outline"><Phone size={14} /> Call</Button></a>
              <a href="mailto:sarah@westsidemgt.com"><Button size="sm" variant="outline"><Mail size={14} /> Email</Button></a>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Megaphone size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Utility Announcements</p>
              <p className="text-xs text-amber-700 mt-1">Water maintenance scheduled for Block C this Thursday from 10 AM to 2 PM. Please store adequate supply.</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Home, label: 'Home', href: '/tenant/dashboard' },
            { icon: CreditCard, label: 'Finance', href: '/payments' },
            { icon: Wrench, label: 'Service', href: '/maintenance' },
            { icon: Settings, label: 'More', href: '/settings' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-gray-400">
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {showPaymentInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPaymentInfo(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <button onClick={() => setShowPaymentInfo(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {paymentMethods.length > 0 ? paymentMethods.map((method) => (
                <div key={method.title} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <method.icon size={18} className="text-primary" />
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {method.details.map((d) => (
                      <div key={d.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{d.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{d.value}</span>
                          <button onClick={() => copyToClipboard(d.value, d.label)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                            {copied === d.label ? (
                              <CheckCircle size={14} className="text-success" />
                            ) : (
                              <Copy size={14} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">No payment details configured for this property.</p>
              )}

              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PhoneCall size={16} className="text-primary" />
                  <h3 className="font-semibold text-sm text-gray-900">Need Help?</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">Contact your property manager for any payment inquiries.</p>
                <a href="tel:+254712345678" className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Phone size={14} /> +254 712 345 678
                </a>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100">
              <Button onClick={() => setShowPaymentInfo(false)} className="w-full">Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
