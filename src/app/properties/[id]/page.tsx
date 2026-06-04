'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowLeft, Edit3, Trash2, Plus, Users, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { fetchPropertyDetailData } from '@/lib/supabase-api';
import type { Property, Tenant, Payment, PaymentInfo } from '@/types';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchPropertyDetailData(params.id as string).then((result) => {
      if (!result) { setLoading(false); return; }
      setProperty(result.property);
      setTenants(result.tenants);
      setPayments(result.payments);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return <div className="p-6 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  if (!property) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Property not found</p>
        <Button onClick={() => router.push('/properties')} className="mt-4">Back to Properties</Button>
      </div>
    );
  }

  const collected = payments.filter((p) => p.status === 'paid').reduce((s: number, p: any) => s + Number(p.amount), 0);
  const outstanding = payments.filter((p) => p.status !== 'paid').reduce((s: number, p: any) => s + Number(p.amount), 0);

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/properties')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-sm text-gray-500">{property.location}</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10">
                <button onClick={() => { setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Edit3 size={16} /> Edit Property
                </button>
                <button onClick={() => { setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50">
                  <Trash2 size={16} /> Delete Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Total Units</p>
            <p className="text-2xl font-bold text-gray-900">{property.units}</p>
            <p className="text-xs text-gray-400">{property.occupiedUnits} occupied</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Occupancy Rate</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round((property.occupiedUnits / property.units) * 100)}%</p>
            <p className="text-xs text-success">{property.units - property.occupiedUnits} vacant</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(property.monthlyRevenue)}</p>
            <p className="text-xs text-success">{formatCurrency(collected)} collected</p>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(outstanding)}</p>
            <p className="text-xs text-danger">Needs attention</p>
          </CardContent></Card>
        </div>

        {property.paymentInfo && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-primary" />
                <h3 className="font-semibold text-gray-900">Payment Details</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">M-Pesa Paybill</p>
                  <p className="font-semibold text-gray-900">{property.paymentInfo.mpesaPaybill}</p>
                  <p className="text-xs text-gray-400">Account: {property.paymentInfo.mpesaAccount}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Till Number</p>
                  <p className="font-semibold text-gray-900">{property.paymentInfo.tillNumber}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Bank Transfer</p>
                  <p className="font-semibold text-gray-900">{property.paymentInfo.bankName}</p>
                  <p className="text-xs text-gray-400">{property.paymentInfo.bankAccountName}</p>
                  <p className="text-xs text-gray-400">Acc: {property.paymentInfo.bankAccount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Tenants ({tenants.length})</h3>
                <Link href={`/tenants/new?propertyId=${property.id}`}>
                  <Button size="sm"><Plus size={14} /> Add Tenant</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {tenants.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No tenants yet</p>
              ) : (
                <div className="space-y-2">
                  {tenants.map((t: any) => (
                    <Link key={t.id} href={`/tenants/${t.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {t.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.unitNumber}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        t.status === 'paid' ? 'bg-success/10 text-success' :
                        t.status === 'overdue' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                      }`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Recent Payments</h3>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No payments recorded</p>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.tenantName}</p>
                        <p className="text-xs text-gray-400">{formatDate(p.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                        <span className={`text-xs font-medium ${
                          p.status === 'paid' ? 'text-success' : p.status === 'overdue' ? 'text-danger' : 'text-warning'
                        }`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
