'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchTenantDashboardData, fetchNearbyProperties, fetchSavedPropertyIds, fetchSavedProperties, saveProperty, unsaveProperty } from '@/lib/supabase-api';
import { formatCurrency, formatDistance } from '@/lib/utils';
import { ErrorMessage } from '@/components/ErrorMessage';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar } from '@/components/Avatar';
import { useSidebar } from '@/components/SidebarContext';
import type { Property } from '@/types';
import BookViewingModal from '@/components/BookViewingModal';
import { useToast } from '@/components/Toast';

export default function TenantDashboardPage() {
  const { user, isAuthenticated, isLoading, saveLocation } = useAuth();
  const router = useRouter();
  const [propertyData, setPropertyData] = useState<any>(null);
  const [leaseData, setLeaseData] = useState<any>(null);
  const [unitData, setUnitData] = useState<any[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<{ open: boolean; property: any }>({ open: false, property: null });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const { showToast } = useToast();
  const { openMobile } = useSidebar();

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    try {
      const nearby = await fetchNearbyProperties(lat, lng, 20, 6);
      setNearbyProperties(nearby);
    } catch (e) {
      console.error('Failed to load nearby properties:', e);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'tenant') { router.push('/dashboard'); return; }

    fetchTenantDashboardData(user.id).then((result) => {
      if (result.property) setPropertyData(result.property);
      if (result.lease) setLeaseData(result.lease);
      if (result.units) setUnitData(result.units);
      if (result.totalRent) setTotalRent(result.totalRent);
      setPageLoading(false);
    }).catch((e) => {
      setLoadError('Failed to load your dashboard. Please try again.');
      setPageLoading(false);
    });

    fetchSavedPropertyIds(user.id).then((ids) => setFavorites(ids)).catch(() => {});
    fetchSavedProperties(user.id).then((props) => setSavedProperties(props)).catch(() => {});

    if (user.latitude && user.longitude) {
      loadNearby(user.latitude, user.longitude);
    } else {
      setLocationLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            saveLocation(latitude, longitude);
            loadNearby(latitude, longitude);
            setLocationLoading(false);
          },
          () => {
            setLocationLoading(false);
            loadNearby(-1.2864, 36.8172);
          },
          { timeout: 8000, maximumAge: 300000 },
        );
      } else {
        setLocationLoading(false);
        loadNearby(-1.2864, 36.8172);
      }
    }
  }, [user, isAuthenticated, isLoading, router, loadNearby, saveLocation]);

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={loadError} onRetry={() => { setLoadError(null); setPageLoading(true); }} />
      </div>
    );
  }

  const unitCount = unitData.length;
  const primaryUnit = unitData[0] || null;
  const totalCredit = unitData.reduce((sum: number, u: any) => sum + Number(u.credit || 0), 0);

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
          <div className="relative w-full max-w-md hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="Search properties, areas, or services..."
              type="text"
            />
          </div>
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

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">Jambo, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-base text-on-surface-variant">Manage your current housing and explore new opportunities.</p>
            </div>
          </div>

          {/* Bento Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Current Property */}
            <Link href={propertyData?.id ? `/listing/${propertyData.id}` : '#'} className="bg-surface-container-lowest border border-outline-variant rounded-2xl hover:shadow-md transition-shadow overflow-hidden block">
              {(propertyData?.images?.[0] || propertyData?.image) ? (
                <div className="h-24 overflow-hidden">
                  <img src={propertyData.images?.[0] || propertyData.image} alt={propertyData.name} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-fixed w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{propertyData?.name || 'No property'}</span>
                </div>
                <h3 className="text-[20px] leading-[28px] font-semibold">{propertyData?.location || '—'}</h3>
                <p className="font-semibold text-sm text-on-surface-variant">Current Residence</p>
              </div>
            </Link>

            {/* Unit Info */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-tertiary-fixed w-10 h-10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-100">meeting_room</span>
                </div>
                <span className="text-xs text-on-surface-variant">{unitCount > 1 ? `${unitCount} Units` : `Unit ${primaryUnit?.unit_number || '—'}`}</span>
              </div>
              <h3 className="text-[20px] leading-[28px] font-semibold">{totalRent > 0 ? formatCurrency(totalRent) : '—'}</h3>
              <p className="font-semibold text-sm text-on-surface-variant">Monthly Rent</p>
            </div>

            {/* Upcoming Rent */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-error-container w-10 h-10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">event</span>
                </div>
                <span className="text-xs text-error font-bold">{leaseData?.end_date ? `Due ${new Date(leaseData.end_date).getDate()}` : 'Due'}</span>
              </div>
              <h3 className="text-[20px] leading-[28px] font-semibold">{totalRent > 0 ? formatCurrency(totalRent) : '—'}</h3>
              <p className="font-semibold text-sm text-on-surface-variant">Next Payment</p>
            </div>

            {/* Lease Status */}
            <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-secondary-fixed w-10 h-10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">description</span>
                </div>
                <span className="text-xs text-tertiary font-bold">Active</span>
              </div>
              <h3 className="text-[20px] leading-[28px] font-semibold">{leaseData?.end_date || '—'}</h3>
              <p className="font-semibold text-sm text-on-surface-variant">Lease Expiry</p>
            </div>

            {/* Credit Balance (shown if tenant has credit) */}
            {totalCredit > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-success/10 w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-success">account_balance_wallet</span>
                  </div>
                  <span className="text-xs text-success font-bold">Available</span>
                </div>
                <h3 className="text-[20px] leading-[28px] font-semibold text-success">{formatCurrency(totalCredit)}</h3>
                <p className="font-semibold text-sm text-on-surface-variant">Credit Balance</p>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Properties */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[24px] leading-[32px] font-semibold">Nearby Apartments</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                {locationLoading
                  ? 'Detecting your location...'
                  : nearbyProperties.length > 0
                    ? `${nearbyProperties.length} properties found within 20 km of your location`
                    : 'No properties found nearby'}
              </p>
            </div>
          </div>

          {locationLoading && (
            <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-on-surface-variant">Detecting your location to find nearby apartments...</span>
            </div>
          )}

          {!locationLoading && nearbyProperties.length === 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-outline text-4xl mb-3">location_off</span>
              <p className="text-on-surface-variant">No properties found in your area yet.</p>
              <p className="text-sm text-on-surface-variant mt-1">Try expanding your search radius or check back later.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {nearbyProperties.map((property, idx) => (
              <div key={property.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="h-48 relative overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={property.images?.[0] || property.image ? { backgroundImage: `url('${property.images?.[0] || property.image}')` } : undefined}
                  />
                  {!(property.images?.[0] || property.image) && (
                    <div className="w-full h-full bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-4xl">apartment</span>
                    </div>
                  )}
                  {property.distance !== undefined && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                      <span className="text-xs font-bold text-primary">{formatDistance(property.distance)}</span>
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      if (!user) return;
                      const isFav = favorites.includes(property.id);
                      if (isFav) {
                        await unsaveProperty(user.id, String(property.id));
                        setFavorites((prev) => prev.filter((id) => id !== property.id));
                        setSavedProperties((prev) => prev.filter((p) => p.id !== property.id));
                        showToast('Removed from saved', 'success');
                      } else {
                        await saveProperty(user.id, String(property.id));
                        setFavorites((prev) => [...prev, property.id]);
                        setSavedProperties((prev) => [property, ...prev]);
                        showToast('Saved to favorites!', 'success');
                      }
                    }}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={favorites.includes(property.id) ? { fontVariationSettings: "'FILL' 1", color: '#ef4444' } : {}}
                    >
                      favorite
                    </span>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[18px] leading-[28px] font-bold">{property.name}</h4>
                    <p className="text-primary font-bold">{(property.paymentInfo?.rentAmount || (property.monthlyRevenue > 0 ? Math.round(property.monthlyRevenue / Math.max(property.occupiedUnits, 1)) : 0)) > 0 ? formatCurrency(property.paymentInfo?.rentAmount || Math.round(property.monthlyRevenue / Math.max(property.occupiedUnits, 1))) : 'Check'}</p>
                  </div>
                  <div className="flex items-center gap-4 text-on-surface-variant mb-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span className="text-xs">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bed</span>
                      <span className="text-xs">{property.type || 'Apartment'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-outline-variant/30 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${property.units > 0 ? (property.occupiedUnits / property.units) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      {property.units - property.occupiedUnits} vacant
                    </span>
                  </div>
                  <button
                    onClick={() => setBookingModal({ open: true, property })}
                    className="w-full py-2.5 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all active:scale-95"
                  >
                    Book Viewing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant px-6 py-2 flex justify-between items-center z-50">
        <Link className="flex flex-col items-center gap-1 text-primary" href="/tenant/dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
      </div>

      {/* Book Viewing Modal */}
      <BookViewingModal
        property={bookingModal.property}
        isOpen={bookingModal.open}
        onClose={() => setBookingModal({ open: false, property: null })}
      />
    </div>
  );
}
