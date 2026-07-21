'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchPropertyById, fetchNearbyProperties } from '@/lib/supabase-api';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, formatDistance, geocodeLocation } from '@/lib/utils';
import type { Property } from '@/types';
import { useToast } from '@/components/Toast';

const GALLERY_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
];

export default function PropertyListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [vacantUnits, setVacantUnits] = useState<{ id: string; unit_number: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [moveInDate, setMoveInDate] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('12');

  useEffect(() => {
    const id = params.id as string;
    if (!id) { setLoading(false); return; }

    fetchPropertyById(id).then((p) => {
      setProperty(p);
      setLoading(false);

      if (p?.id) {
        supabase
          .from('units')
          .select('id, unit_number')
          .eq('property_id', p.id)
          .is('tenant_id', null)
          .then(({ data }) => setVacantUnits(data || []));
      }

      if (p?.latitude && p?.longitude) {
        fetchNearbyProperties(p.latitude, p.longitude, 10, 4).then((nearby) => {
          setNearbyProperties(nearby.filter((n) => n.id !== p.id));
        });
      } else if (p?.location) {
        const geo = geocodeLocation(p.location);
        if (geo) {
          fetchNearbyProperties(geo.latitude, geo.longitude, 10, 4).then((nearby) => {
            setNearbyProperties(nearby.filter((n) => n.id !== p.id));
          });
        }
      }
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-outline text-5xl">apartment</span>
        <h2 className="text-xl font-semibold">Property not found</h2>
        <Link href="/tenant/dashboard" className="text-primary font-semibold hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const avgRent = property.paymentInfo?.rentAmount
    || (property.occupiedUnits > 0 ? Math.round(property.monthlyRevenue / property.occupiedUnits) : 0);
  const securityDeposit = property.paymentInfo?.depositAmount || avgRent;
  const serviceCharge = 0;

  return (
    <div className="bg-background text-on-background font-body antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Navigation Bar */}
      <nav className="bg-surface-container-lowest sticky top-0 z-50 shadow-sm transition-all duration-300 border-b border-outline-variant/30">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
              <span className="text-[24px] leading-[32px] font-bold text-primary tracking-tight">RentFlow</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href={user.role === 'tenant' ? '/tenant/dashboard' : '/dashboard'} className="text-sm font-semibold text-on-surface-variant px-4 py-2 hover:bg-surface-container-low transition-colors rounded-lg">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-semibold text-on-surface-variant px-4 py-2 hover:bg-surface-container-low transition-colors rounded-lg">Login</Link>
                <Link href="/register" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-6 mt-6">
        {/* Title & Basic Info */}
        <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-[36px] leading-[44px] tracking-tight font-bold text-on-surface mb-1">{property.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
                <span className="font-medium">{property.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[20px]">apartment</span>
                <span className="font-medium">{property.type || 'Apartment'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[20px]">meeting_room</span>
                <span className="font-medium">{property.units} Units</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => showToast('Link copied to clipboard!', 'success')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
              <span className="text-sm font-semibold">Share</span>
            </button>
            <button
              onClick={() => showToast('Property saved!', 'success')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant"
            >
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span className="text-sm font-semibold">Save</span>
            </button>
          </div>
        </header>

        {/* Image Gallery */}
        <div className="rounded-2xl overflow-hidden mb-8">
          {(property.images && property.images.length > 0) ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[560px]">
              {property.images.slice(0, 5).map((url: string, i: number) => (
                <div
                  key={i}
                  className={`${
                    i === 0 ? 'col-span-4 md:col-span-2 row-span-2' : 'hidden md:block col-span-1 row-span-1'
                  } relative overflow-hidden`}
                >
                  <img src={url} alt={`${property.name} photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : property.image ? (
            <div className="h-[400px] md:h-[560px]">
              <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-[200px] md:h-[300px] bg-surface-container flex items-center justify-center rounded-2xl border border-outline-variant">
              <div className="text-center">
                <span className="material-symbols-outlined text-outline text-5xl mb-2">apartment</span>
                <p className="text-on-surface-variant">No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
              <h3 className="text-[20px] leading-[28px] font-bold mb-4">About this property</h3>
              <p className="text-on-surface-variant leading-relaxed">
                {property.description || `${property.name} is a ${property.type?.toLowerCase() || 'residential'} property located in ${property.location}. With ${property.units} units and ${property.occupiedUnits} currently occupied, this property offers a great living experience.`}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-surface-container-low rounded-xl">
                  <p className="text-2xl font-bold text-primary">{property.units}</p>
                  <p className="text-xs text-on-surface-variant">Total Units</p>
                </div>
                <div className="text-center p-4 bg-surface-container-low rounded-xl">
                  <p className="text-2xl font-bold text-tertiary">{property.occupiedUnits}</p>
                  <p className="text-xs text-on-surface-variant">Occupied</p>
                </div>
                <div className="text-center p-4 bg-surface-container-low rounded-xl">
                  <p className="text-2xl font-bold text-error">{property.units - property.occupiedUnits}</p>
                  <p className="text-xs text-on-surface-variant">Available</p>
                </div>
              </div>
            </section>

            {/* Available Units */}
            {vacantUnits.length > 0 && (
              <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
                <h3 className="text-[20px] leading-[28px] font-bold mb-4">Available Units</h3>
                <div className="space-y-3">
                  {vacantUnits.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">meeting_room</span>
                        <div>
                          <p className="font-semibold text-sm">Unit {unit.unit_number}</p>
                          <p className="text-xs text-on-surface-variant">{property?.type || 'Apartment'}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-tertiary/10 text-tertiary text-xs font-semibold rounded-full">Available</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Map placeholder */}
            <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
              <h3 className="text-[20px] leading-[28px] font-bold mb-4">Location</h3>
              <div className="bg-surface-container-low rounded-xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-outline text-4xl mb-2">map</span>
                  <p className="text-on-surface-variant">{property.location}</p>
                  {property.latitude && property.longitude && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Booking Card */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-lg sticky top-24">
              <div className="mb-6">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Starting from</p>
                <p className="text-[32px] leading-[40px] font-bold text-primary">{avgRent > 0 ? formatCurrency(avgRent) : 'Contact'}</p>
                <p className="text-sm text-on-surface-variant">per month</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Move-in Date</label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Lease Term</label>
                  <select
                    value={leaseTerm}
                    onChange={(e) => setLeaseTerm(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Monthly Rent</span>
                  <span className="font-semibold">{avgRent > 0 ? formatCurrency(avgRent) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Security Deposit</span>
                  <span className="font-semibold">{securityDeposit > 0 ? formatCurrency(securityDeposit) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Service Charge</span>
                  <span className="font-semibold">{serviceCharge > 0 ? formatCurrency(serviceCharge) : '—'}</span>
                </div>
                <hr className="border-outline-variant" />
                <div className="flex justify-between font-bold">
                  <span>Move-in Total</span>
                  <span className="text-primary">{avgRent > 0 ? formatCurrency(avgRent + securityDeposit + serviceCharge) : '—'}</span>
                </div>
              </div>

              <button
                onClick={() => showToast('Booking request sent!', 'success')}
                className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Book This Unit
              </button>
              <p className="text-center text-xs text-on-surface-variant mt-3">No payment required to book</p>
            </div>
          </div>
        </div>

        {/* Recommended Nearby Properties */}
        {nearbyProperties.length > 0 && (
          <section className="pb-12">
            <h3 className="text-[24px] leading-[32px] font-semibold mb-6">Similar Properties Nearby</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {nearbyProperties.map((p, i) => (
                <Link key={p.id} href={`/listing/${p.id}`} className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden group hover:shadow-xl transition-all duration-300 block">
                  <div className="h-40 relative overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${p.images?.[0] || p.image || GALLERY_PLACEHOLDERS[i % GALLERY_PLACEHOLDERS.length]}')` }}
                    />
                    {p.distance !== undefined && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-primary text-xs">location_on</span>
                        <span className="text-[10px] font-bold text-primary">{formatDistance(p.distance)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                    <p className="text-xs text-on-surface-variant mb-2">{p.location}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold text-sm">{(p.paymentInfo?.rentAmount || (p.monthlyRevenue > 0 ? Math.round(p.monthlyRevenue / Math.max(p.occupiedUnits, 1)) : 0)) > 0 ? formatCurrency(p.paymentInfo?.rentAmount || Math.round(p.monthlyRevenue / Math.max(p.occupiedUnits, 1))) : 'Check'}</span>
                      <span className="text-xs text-on-surface-variant">{p.units - p.occupiedUnits} vacant</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant py-8 mt-12">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <p className="text-sm text-on-surface-variant">© 2026 RentFlow Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
