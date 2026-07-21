'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchProperties } from '@/lib/supabase-api';
import { formatCurrency, haversineDistance, geocodeLocation } from '@/lib/utils';
import { ErrorMessage } from '@/components/ErrorMessage';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar } from '@/components/Avatar';
import { useSidebar } from '@/components/SidebarContext';
import { useToast } from '@/components/Toast';
import BookViewingModal from '@/components/BookViewingModal';
import type { Property } from '@/types';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=600&h=400&fit=crop',
];

export default function TenantPropertiesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { openMobile } = useSidebar();
  const { showToast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookingModal, setBookingModal] = useState<{ open: boolean; property: any }>({ open: false, property: null });
  const [sortByNearest, setSortByNearest] = useState(true);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchProperties();
      setProperties(all);
    } catch (e: any) {
      setError(e?.message || 'Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'tenant') { router.push('/dashboard'); return; }
    loadData();

    if (user?.latitude && user?.longitude) {
      setUserCoords({ latitude: user.latitude, longitude: user.longitude });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {},
        { timeout: 8000, maximumAge: 300000 },
      );
    }
  }, [user, isAuthenticated, isLoading, router, loadData]);

  const propertyTypes = [...new Set(properties.map((p) => p.type).filter(Boolean))].sort() as string[];

  const filteredProperties = properties
    .filter((p) => {
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'All' || p.type === typeFilter;
      const vacantUnits = p.units - p.occupiedUnits;
      const matchesAvailability = availabilityFilter === 'All'
        || (availabilityFilter === 'Available' && vacantUnits > 0)
        || (availabilityFilter === 'Fully Occupied' && vacantUnits === 0);
      return matchesSearch && matchesType && matchesAvailability;
    })
    .map((p) => {
      let distance = Infinity;
      if (userCoords) {
        const propGeo = (p.latitude && p.longitude)
          ? { latitude: p.latitude, longitude: p.longitude }
          : geocodeLocation(p.location);
        if (propGeo) {
          distance = haversineDistance(userCoords, propGeo);
        }
      }
      return { ...p, distance };
    })
    .sort((a, b) => {
      if (sortByNearest && userCoords) return a.distance - b.distance;
      return 0;
    });

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
          <h1 className="text-xl font-bold text-on-surface">Browse Properties</h1>
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
        {/* Summary */}
        <div className="mb-6">
          <p className="text-sm text-on-surface-variant">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} available
            {search && ` matching "${search}"`}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[18px] border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-1 focus:ring-primary"
              placeholder="Search by name, location, or description..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-white border border-outline-variant rounded-xl text-xs font-medium py-2 px-4 focus:ring-1 focus:ring-primary"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">Type: All</option>
              {propertyTypes.map((t) => (
                <option key={t} value={t}>Type: {t}</option>
              ))}
            </select>
            <select
              className="bg-white border border-outline-variant rounded-xl text-xs font-medium py-2 px-4 focus:ring-1 focus:ring-primary"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="All">Availability: All</option>
              <option value="Available">Has Vacancies</option>
              <option value="Fully Occupied">Fully Occupied</option>
            </select>
          </div>
          {(search || typeFilter !== 'All' || availabilityFilter !== 'All') && (
            <>
              <div className="h-8 w-[1px] bg-outline-variant" />
              <button
                onClick={() => { setSearch(''); setTypeFilter('All'); setAvailabilityFilter('All'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Clear ({filteredProperties.length}/{properties.length})
              </button>
            </>
          )}
        </div>

        {/* Sort toggle */}
        {userCoords && (
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => setSortByNearest(!sortByNearest)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortByNearest
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              {sortByNearest ? 'Nearest First' : 'Default Order'}
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-outline text-5xl mb-4 block">apartment</span>
            <h3 className="text-lg font-semibold text-on-surface mb-2">No properties found</h3>
            <p className="text-sm text-on-surface-variant">
              {search || typeFilter !== 'All' || availabilityFilter !== 'All'
                ? 'Try adjusting your filters or search terms.'
                : 'No properties have been listed yet. Check back later.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((property, idx) => {
              const vacantUnits = property.units - property.occupiedUnits;
              const occupancyRate = property.units > 0 ? Math.round((property.occupiedUnits / property.units) * 100) : 0;
              const rent = property.paymentInfo?.rentAmount
                || (property.occupiedUnits > 0 ? Math.round(property.monthlyRevenue / property.occupiedUnits) : 0);
              const deposit = property.paymentInfo?.depositAmount || rent;

              return (
                <div key={property.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden group hover:shadow-xl transition-all duration-300">
                  {/* Image */}
                  <div className="h-52 relative overflow-hidden">
                    <Link href={`/listing/${property.id}`}>
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${property.images?.[0] || property.image || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}')` }}
                      />
                    </Link>
                    {/* Availability Badge */}
                    <div className="absolute top-4 left-4">
                      {vacantUnits > 0 ? (
                        <span className="bg-success text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                          {vacantUnits} {vacantUnits === 1 ? 'Unit' : 'Units'} Available
                        </span>
                      ) : (
                        <span className="bg-on-surface-variant text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                          Fully Occupied
                        </span>
                      )}
                    </div>
                    {/* Favorite Button */}
                    <button
                      onClick={() => {
                        setFavorites((prev) =>
                          prev.includes(property.id)
                            ? prev.filter((id) => id !== property.id)
                            : [...prev, property.id]
                        );
                        showToast(
                          favorites.includes(property.id) ? 'Removed from saved' : 'Saved to favorites!',
                          'success'
                        );
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

                  {/* Content */}
                  <div className="p-5">
                    <Link href={`/listing/${property.id}`}>
                      <h3 className="text-[18px] leading-[28px] font-bold text-on-surface hover:text-primary transition-colors mb-1">
                        {property.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 text-on-surface-variant mb-3">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span className="text-xs">{property.location}</span>
                      {property.distance !== undefined && property.distance < Infinity && (
                        <>
                          <span className="text-xs text-outline-variant mx-1">·</span>
                          <span className="text-xs text-primary font-medium">{property.distance < 1 ? `${Math.round(property.distance * 1000)}m` : `${property.distance.toFixed(1)} km`} away</span>
                        </>
                      )}
                    </div>

                    {/* Type & Units */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">apartment</span>
                        {property.type || 'Apartment'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">meeting_room</span>
                        {property.units} {property.units === 1 ? 'Unit' : 'Units'}
                      </span>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant mb-1">
                        <span>Occupancy</span>
                        <span>{occupancyRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${occupancyRate === 100 ? 'bg-on-surface-variant' : occupancyRate >= 80 ? 'bg-warning' : 'bg-primary'}`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-primary font-bold text-[16px] leading-[24px]">
                          {rent > 0 ? formatCurrency(rent) : 'Contact'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">per month</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBookingModal({ open: true, property: { ...property, price: rent > 0 ? formatCurrency(rent) : 'Contact', rating: '', university: '', beds: property.type || 'Apartment', image: property.images?.[0] || property.image || '' } })}
                          className="px-4 py-2 rounded-xl border border-primary text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all active:scale-95"
                        >
                          Book Viewing
                        </button>
                        <Link
                          href={`/listing/${property.id}`}
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BookViewingModal
        property={bookingModal.property}
        isOpen={bookingModal.open}
        onClose={() => setBookingModal({ open: false, property: null })}
      />
    </div>
  );
}
