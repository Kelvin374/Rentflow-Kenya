'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchTenantDashboardData } from '@/lib/supabase-api';
import { getInitials } from '@/lib/utils';
import BookViewingModal from '@/components/BookViewingModal';
import { PaymentModal } from '@/components/PaymentModal';
import { useToast } from '@/components/Toast';

const recommendedProperties = [
  {
    id: 1,
    name: 'Westlands Heights Studio',
    price: '35,000',
    rating: '4.8',
    university: '1.2km to UoN',
    beds: '1 Bed',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADN58fjjuKXVPeC9YmfUWNxVvHw92kuX5v6jowwoutw-_4feNz4Fz_EcgrN5-fNyD1WqiZGBHzqVGhg7lTyd_o4T50lZwLKRU0NQHMqeH0IMLOhmVbpIOL33S97xqlQhGIH6L_CvpzHI_1TK5jZ2gRLSG-zpH3hXxCdbho9P9yhhP7uthlansyLsIojQEaVPsV8KxeF7QyuVhNrkVo5NYe5X4zaJw7idfm9bDrbltLzp2ClIcWqEyP',
  },
  {
    id: 2,
    name: 'Strathmore Crest 2BR',
    price: '55,000',
    rating: '4.9',
    university: '0.5km to Strathmore',
    beds: '2 Bed',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL5VqWmXhT5S5iF-XjREpB8Yu3o46t1prSzFr1UfJI9rLgj_2hMgKGqtNtK33BAs5PQIyjY48l_OesrjsLxKFc_O7i6svLQbl0nf4vMg67MmS74iaCGn8RBJzuqmKS7zSIvkUSJmvp5Cd88Met6sxA20Qcovm_LaNmqCb53_oC4Ba_44h1asNNNR_ZW1KywVgjHvNxmcwkncMyLzAfHXMgsF25Tcwr8JgJhYgMyqzOIZKml8-sJkQK',
  },
  {
    id: 3,
    name: 'The Grad Lofts',
    price: '22,000',
    rating: '4.7',
    university: '2.0km to Daystar',
    beds: 'Shared',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYCR9cOlvDS80QFtK0GVocoD-dFJS9bN9NBX7gRd1QKRZdMXL0NMKubXeOam1FqYQ_DZIwffl9dI4K0aOJTUTdLebojNEXdQwvEoKQe6xXcMTTEcS2sAOKwFlVD-iRmU64G-sFf4y82QtlV3LqeZT2ag49W2S6RS4s7EY9l28pishy4ePBolDITjl9rBpJcjeWihyTqs55KAketCmSBPWavB6Xz3g_XbRRNEGq2SgNiO1IjdIwmpoy',
  },
];

const notifications = [
  { id: 1, title: 'Lease approved for Karen Plains', desc: 'Your application has been accepted. Please sign documents.', icon: 'vpn_key', color: 'primary' },
  { id: 2, title: 'New maintenance update', desc: 'Scheduled elevator maintenance on Oct 24th.', icon: 'campaign', color: 'tertiary' },
];

export default function TenantDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [propertyData, setPropertyData] = useState<any>(null);
  const [leaseData, setLeaseData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState<{ open: boolean; property: any }>({ open: false, property: null });
  const [paymentModal, setPaymentModal] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'tenant') { router.push('/dashboard'); return; }

    fetchTenantDashboardData(user.id).then((result) => {
      if (result.property) setPropertyData(result.property);
      if (result.lease) setLeaseData(result.lease);
      setPageLoading(false);
    }).catch(() => setPageLoading(false));
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading || pageLoading) {
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
            <span className="material-symbols-outlined text-primary">menu</span>
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
          <button
            onClick={() => showToast('No new notifications', 'info')}
            className="hover:bg-surface-container-high p-2 rounded-full transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <button
            onClick={() => showToast('Apps menu coming soon', 'info')}
            className="hover:bg-surface-container-high p-2 rounded-full transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface-variant">apps</span>
          </button>
          <div className="w-px h-6 bg-outline-variant mx-2"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-low p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              {user ? getInitials(user.name) : 'KM'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="font-semibold text-sm leading-none">{user?.name || 'Kelvin M.'}</p>
              <p className="text-[10px] text-on-surface-variant">Verified Tenant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Central Grid */}
        <section className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">Jambo, {user?.name?.split(' ')[0] || 'Kelvin'}!</h1>
                <p className="text-base text-on-surface-variant">Manage your current housing and explore new opportunities.</p>
              </div>
              <button
                onClick={() => showToast('Search profile created! Landlords will be notified.', 'success')}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                List Search Profile
              </button>
            </div>

            {/* Bento Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Saved Properties */}
              <Link href="/tenant/saved" className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow cursor-pointer block">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-fixed w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>
                  <span className="text-xs text-on-surface-variant">Updated today</span>
                </div>
                <h3 className="text-[24px] leading-[32px] font-semibold">12</h3>
                <p className="font-semibold text-sm text-on-surface-variant">Saved Properties</p>
              </Link>

              {/* Active Applications */}
              <Link href="/tenant/applications" className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow cursor-pointer block">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-tertiary-fixed w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">assignment_turned_in</span>
                  </div>
                  <span className="text-xs text-primary font-bold">2 Active</span>
                </div>
                <h3 className="text-[24px] leading-[32px] font-semibold">05</h3>
                <p className="font-semibold text-sm text-on-surface-variant">Applications</p>
              </Link>

              {/* Upcoming Rent */}
              <button
                onClick={() => setPaymentModal(true)}
                className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow cursor-pointer text-left w-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-error-container w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-error">event</span>
                  </div>
                  <span className="text-xs text-error font-bold">Due 5th</span>
                </div>
                <h3 className="text-[24px] leading-[32px] font-semibold">KES 45k</h3>
                <p className="font-semibold text-sm text-on-surface-variant">Monthly Rent</p>
              </button>

              {/* Messages */}
              <Link href="/tenant/messages" className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:shadow-md transition-shadow cursor-pointer block">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-secondary-fixed w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">mail</span>
                  </div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-[24px] leading-[32px] font-semibold">08</h3>
                <p className="font-semibold text-sm text-on-surface-variant">Unread Messages</p>
              </Link>
            </div>
          </div>

          {/* Recommended Properties */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[24px] leading-[32px] font-semibold">Recommended for You</h2>
              <Link href="/listing/1" className="text-primary text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendedProperties.map((property) => (
                <div key={property.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="h-48 relative overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${property.image}')` }}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-yellow-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold">{property.rating}</span>
                    </div>
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
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[18px] leading-[28px] font-bold">{property.name}</h4>
                      <p className="text-primary font-bold">KES {property.price}<span className="text-xs text-on-surface-variant font-normal">/mo</span></p>
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant mb-6">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">school</span>
                        <span className="text-xs">{property.university}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">bed</span>
                        <span className="text-xs">{property.beds}</span>
                      </div>
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
        </section>

        {/* Right Sidebar: Payment & Activity */}
        <aside className="hidden xl:flex flex-col w-96 bg-surface-container-low border-l border-outline-variant p-6 overflow-y-auto scrollbar-hide">
          {/* M-Pesa Payment Card */}
          <div className="mb-8">
            <div className="bg-[#1EB952] rounded-3xl p-6 text-white shadow-xl shadow-green-500/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Rent Due In 5 Days</p>
                  <h3 className="text-[24px] leading-[32px] font-bold">KES 45,000.00</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <span>Lipa na M-PESA</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">VERIFIED</span>
                </div>
                <button
                  onClick={() => setPaymentModal(true)}
                  className="w-full bg-white text-[#1EB952] font-black py-3 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  PAY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm">Recent Notifications</h4>
              <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">more_horiz</span>
            </div>
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex gap-4 p-4 hover:bg-white/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-outline-variant">
                  <div className={`bg-${notif.color}-fixed w-10 h-10 rounded-full flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-${notif.color} text-sm`}>{notif.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{notif.title}</p>
                    <p className="text-xs text-on-surface-variant">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h4 className="font-bold text-sm mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'add_home', label: 'New App', action: () => router.push('/listing/1') },
                { icon: 'history_edu', label: 'Pay Rent', action: () => setPaymentModal(true) },
                { icon: 'engineering', label: 'Fix Request', action: () => showToast('Maintenance request submitted!', 'success') },
                { icon: 'contact_support', label: 'Help Desk', action: () => showToast('Opening help desk...', 'info') },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:bg-primary-container hover:text-on-primary-container transition-all group"
                >
                  <span className="material-symbols-outlined text-primary group-hover:text-on-primary-container transition-colors">{action.icon}</span>
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t border-outline-variant">
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              © 2024 RentFlow Kenya. All rights reserved.<br />
              Premium Property Management Solutions.
            </p>
          </div>
        </aside>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant px-6 py-2 flex justify-between items-center z-50">
        <Link className="flex flex-col items-center gap-1 text-primary" href="/tenant/dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-on-surface-variant" href="/listing/1">
          <span className="material-symbols-outlined">domain</span>
          <span className="text-[10px]">Browse</span>
        </Link>
        <button onClick={() => setPaymentModal(true)} className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">payments</span>
          <span className="text-[10px]">Pay</span>
        </button>
        <Link className="flex flex-col items-center gap-1 text-on-surface-variant" href="/tenant/messages">
          <span className="material-symbols-outlined">chat</span>
          <span className="text-[10px]">Inbox</span>
        </Link>
      </div>

      {/* Book Viewing Modal */}
      <BookViewingModal
        property={bookingModal.property}
        isOpen={bookingModal.open}
        onClose={() => setBookingModal({ open: false, property: null })}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        amount="45,000"
        onSuccess={() => showToast('Payment successful!', 'success')}
      />
    </div>
  );
}
