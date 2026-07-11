'use client';

import Link from 'next/link';
import { useState } from 'react';

const galleryImages = [
  { id: 1, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2zk2zgFGn_VCtGSOJPo79oSZcKl3xJfAUH4ISTTjdhImpgPW00xK7kLFT497NVmjZRDfStxpLfZxMZkk5AQtx-G3QFbJHeGwjfttPiQ7AVTstlj-iNwF9ErBO2PL4kOHHqC6aqqo8Sd2E_r4R81_rHm8PoDep77_m7qzLYlrJoGSN5cT7lL-kNBZ1WgMFu6-MM3Y3FYOusWonxdJHKvACc6gPjTdyB5ZjeEExC8wPhv1x9kU84JDw', span: 'col-span-4 md:col-span-2 row-span-2' },
  { id: 2, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNmlSKDvIi42SNw111XI9IBf8DAVh6I3y7MpgVSPk7amZYnqoOGWeqPPS_Ju_LEfhbQkGLORnSDwODj-s1tiZWDJFoNpgMtvlc0JY8Ywrx2XVFrt1asJBwwxZKFXYpxFDHcpeDDbBSIeqSKq2fZenD3mzDfd42Y1HWMkrdnGk74pLUQqUrzNOJ3yaseYCZQW_RTigDxxPu9b3_WJPtPbMaW_Wi8k0H61jBBK5edMEWO4amMaS2tPVB', span: 'hidden md:block col-span-1 row-span-1' },
  { id: 3, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnrt_3Zf07RjS638iZqrG-oQ98WERXQQR0L8WardTHQYm0RzM_e4vzyR-ElPQcwoDEOW0GiacBp_6cbN1_4LZxr1TCIIOhnIGOObvVo94ww3MlpovWORIkGPG-gasRi-m9HXqNUXemhXaOAh6xXA-98UhRlZdzLxI42eOjXAD6YaTgTLklFV75W9sRbmOpMigRKp_mLisog8TS-3svU4YjeH5l5b1Wana6IikRkK-_un0N_PIVbyTK', span: 'hidden md:block col-span-1 row-span-1' },
  { id: 4, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7_PTGwFOmr80Dxu682foXMy933FEAKf9zG9TfsQGwB7yhDtSrhTseaf5I49bIJlxZZBPyZfUgACN6whA1Spx9xxsRlcZl93A0ZCHHGRAjWKM1J1J4d8oiaNddvrizDf4TxwIeJo4d0ffWoxDdSUnVvkC4sYGaseYqZNUrXO3_N1i6BVbymE33kExO6M--xurpwOUPy7PZ_kkR9D8H3N_NKsAodpEYF4o24AMq_s3uMp5QDzs6qRiC', span: 'hidden md:block col-span-1 row-span-1' },
  { id: 5, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb4uVy35h13m1YhHeZRAIZtbhwS73-2_QQWMyh1EsG2arWPEi_s8e2QFouGyhNL2bFOAovG4x8X09Ac00Rn5iyoOx7NUmIF8Mxv8_Lx_ouI-122owYbrcsyAiISG8Ob7ZDCtuhswSIeo5IYO-qj01qjRfhI9vUEu4-qpIVMGd2Z_zjZNGt1u_Va_HH7PnQHqwJ-Ykn7oOjUzdUKUqV9GsMr5AUdUJAyTUSGctaQAfpBrvJxqvZF9H9', span: 'hidden md:block col-span-1 row-span-1' },
];

const amenities = [
  { icon: 'wifi', label: 'High-speed WiFi (50Mbps)' },
  { icon: 'local_parking', label: 'Free secure parking' },
  { icon: 'water_drop', label: '24/7 Water supply' },
  { icon: 'bolt', label: 'Full power backup' },
  { icon: 'security', label: 'Professional 24/7 Security' },
  { icon: 'countertops', label: 'Modern Kitchenette' },
  { icon: 'local_laundry_service', label: 'In-unit Laundry' },
  { icon: 'atm', label: 'Resident Gym' },
];

const universities = [
  { name: 'University of Nairobi', campus: 'Main Campus', distance: '2.4 km', color: 'bg-primary-container text-on-primary-container' },
  { name: 'Strathmore University', campus: 'Madaraka Campus', distance: '5.1 km', color: 'bg-tertiary-container text-on-tertiary-container' },
];

const recommendedProperties = [
  { id: 1, name: 'Modern Studio, Kilimani', distance: '2.1 km from here', price: '55,000', rating: '4.85', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLO4pXqGu8o8nD_ZYet4xscIUgQ7G4EOjZvreEEF3pXAS_HvzlZsTeJmbUan9efvt4AgWIR-uI7i6ehxcg7Y8ctquPeJc2Bw94xSkBGkEIYxXDGbgkeLXtZdqSrvjpUkhHcR0f7uBiKSnS3O0O3_WGNU41q62H20snIRy0ghjJVbcjZ4J1P6G6i2oUx7A2X5OFyow8MrZ3dgBOE7tnd0sGfPrF_zyPUCjboSReb00XalGRUggqlkm9' },
  { id: 2, name: 'Garden View Loft', distance: '3.5 km from here', price: '72,000', rating: '4.98', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA4gukKShhhSERAJ6F8kyAyEJWW7RyU7LJ2S9-RUbjU9MUNgDvgX1PtxkL0DGYQyQ1lWJvEIWv-RPz_Em_umZl9YFXNp_rguSzkalDGm5sct_6fQ3rLPab-9gaErAME1RNhOIR7O4jWr5WpijpeKj1WND9g6-nxnOnCGePczHGmb2xaiVcMXnsLtQ4IX-KtlvDs9tsn336KXWr-J_jAyCZabgjnpzsOhfdCtOpOkOLhnws60OoHtoI' },
  { id: 3, name: 'Riverside Executive', distance: '1.2 km from here', price: '80,000', rating: '4.72', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDkeD7c_1mWQW7uRMsMgR_iFTPGagZgAMZp6524jxlFhJXH0Mxg8Jo5lt_LJ4tby80ZT_IE8A7EN53XfU3BrDkCvgN_HKjm9bkGP1FPjTM6KxeFvZfo4JKE4pt9huksUKZTyQ8pApCLXpw5CqP1HIjXAlh9XX0P9b91xIHI4qUYSJniyPsYWdOXRm7jj2k-lTB3r6RvvdGESs3hDlr3HWPcnchmU3SYaNUukUSmkn35g6_-ZR-J-RE' },
  { id: 4, name: 'Chiromo Studio', distance: '0.8 km from here', price: '48,000', rating: '4.90', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhxg3P9XYjR0X-LvcFVTgjFwEasvjzugKWYZxeLgo7Hk56MGhGRh_SGc5ZH1kANARmxu6jAq1xKO6oWCOSfgl2I-Ywf_tU51LzZqbAwt4Eivq94v4p4dQMBmbnJmX3WX4KATt3h_70uSiBTz4r81zQnC0l8V3fSb0qTJC8dMwn-9ZNFraD5iAiquC0mVkrE2gtL4iBh8NUr_ke76YaZlFmA0hXzaa64F9wydxj1Zw17Qfuum-JWqN_' },
];

export default function PropertyListingPage() {
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
            <div className="hidden md:flex items-center gap-6">
              <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#">Home</a>
              <a className="text-sm font-semibold text-primary border-b-2 border-primary pb-1" href="#">Browse</a>
              <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#">Map</a>
              <a className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors" href="#">Universities</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-on-surface-variant px-4 py-2 hover:bg-surface-container-low transition-colors rounded-lg">Login</Link>
            <Link href="/register" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">Register</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] mx-auto px-6 mt-6">
        {/* Title & Basic Info */}
        <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-[36px] leading-[44px] tracking-tight font-bold text-on-surface mb-1">Luxury Studio at Westlands Heights</h1>
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
                <span className="font-medium">Westlands, Nairobi</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-bold text-on-surface">4.92</span>
                <span className="underline text-sm">(124 reviews)</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant">
              <span className="material-symbols-outlined text-[20px]">share</span>
              <span className="text-sm font-semibold">Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              <span className="text-sm font-semibold">Save</span>
            </button>
          </div>
        </header>

        {/* Bento Image Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[560px] rounded-2xl overflow-hidden mb-8">
          {galleryImages.map((img, index) => (
            <div key={img.id} className={`${img.span} relative group cursor-pointer overflow-hidden`}>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${img.url}')` }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
              {index === 4 && (
                <button className="absolute bottom-4 right-4 bg-surface text-on-surface px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg border border-outline-variant hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined text-[20px]">apps</span>
                  Show all photos
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Features */}
            <section className="flex flex-wrap gap-3">
              {[
                { icon: 'bed', label: '1 Bedroom' },
                { icon: 'shower', label: '1 Bath' },
                { icon: 'square_foot', label: '450 sq ft' },
                { icon: 'apartment', label: 'Student Friendly' },
              ].map((feat) => (
                <div key={feat.label} className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full text-sm font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">{feat.icon}</span> {feat.label}
                </div>
              ))}
            </section>

            <hr className="border-outline-variant/30" />

            {/* Description */}
            <section>
              <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface mb-4">About this space</h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                Experience premium urban living in this beautifully designed studio apartment located in the heart of Westlands. Perfectly suited for young professionals or students attending nearby universities, this unit offers a blend of style, comfort, and convenience.
              </p>
              <p className="text-base text-on-surface-variant leading-relaxed mt-4">
                Featuring high-speed internet, 24/7 security, and backup power, you'll never have to worry about your productivity. The space is flooded with natural light and offers a tranquil escape from the bustling city.
              </p>
              <button className="mt-4 text-primary font-bold hover:underline flex items-center gap-2">
                Show more <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </section>

            <hr className="border-outline-variant/30" />

            {/* Amenities */}
            <section>
              <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {amenities.map((amenity) => (
                  <div key={amenity.label} className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant text-[28px]">{amenity.icon}</span>
                    <span className="text-base text-on-surface-variant">{amenity.label}</span>
                  </div>
                ))}
              </div>
              <button className="mt-8 border border-on-surface text-on-surface px-8 py-4 rounded-lg font-bold hover:bg-surface-container transition-colors">
                Show all 24 amenities
              </button>
            </section>

            <hr className="border-outline-variant/30" />

            {/* Nearby Universities */}
            <section>
              <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface mb-6">Nearby Universities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {universities.map((uni) => (
                  <div key={uni.name} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg ${uni.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined">school</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface">{uni.name}</h4>
                        <p className="text-sm text-on-surface-variant">{uni.campus}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">{uni.distance}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-outline-variant/30" />

            {/* Interactive Map Section */}
            <section>
              <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface mb-6">Where you'll be</h2>
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-surface-container-high animate-pulse flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-4xl">map</span>
                </div>
                <img
                  className="w-full h-full object-cover grayscale-[20%]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnUCwFWwiFaONi87GS-c_c_23UNnTx12jl6qhX9yyWa5PpjYYoTucPqxjmWLM-Xw1e3qWz845Cw887IB8qZTSuodJ5wvt5CeFtFpLBevLPXWcpvaNFEVXdhy0OBzzpYCtte-a2u172Amue9HPCfAlzbvpxTOhJv55DA3HImp2pXQ4Oy9QcDMEwKbbG90ebaKNs5ml2v3wwvCRpRR0nlCjzNn_3rdJBsAmk1v-ZU6S_86KIZ2A6f3Sz"
                  alt="Map of Westlands, Nairobi"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="relative bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                      <span className="material-symbols-outlined">home</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 font-bold text-on-surface">Westlands, Nairobi</p>
              <p className="text-base text-on-surface-variant">A vibrant commercial hub with easy access to shopping malls, corporate offices, and nightlife.</p>
            </section>
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Pricing & Booking Card */}
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-outline-variant/30">
                <div className="flex justify-between items-baseline mb-6">
                  <div>
                    <span className="text-[24px] leading-[32px] font-bold text-on-surface">KES 65,000</span>
                    <span className="text-on-surface-variant">/month</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-sm font-bold">4.92</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 border border-outline-variant rounded-xl overflow-hidden mb-6">
                  <div className="p-4 border-r border-b border-outline-variant">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">MOVE IN</label>
                    <div className="text-sm font-medium">As soon as today</div>
                  </div>
                  <div className="p-4 border-b border-outline-variant">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">LEASE TERM</label>
                    <div className="text-sm font-medium">12 Months</div>
                  </div>
                  <div className="col-span-2 p-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">OCCUPANTS</label>
                    <div className="text-sm font-medium">1 Tenant</div>
                  </div>
                </div>

                <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-base mb-4 hover:opacity-95 transition-all shadow-md active:scale-[0.98]">
                  Apply Now
                </button>
                <button className="w-full bg-surface-container text-on-surface py-4 rounded-xl font-bold text-base mb-6 hover:bg-surface-container-high transition-all active:scale-[0.98]">
                  Book Viewing
                </button>

                <div className="flex justify-center text-sm text-on-surface-variant mb-4">
                  You won't be charged yet
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-on-surface">
                    <span>Security Deposit (Refundable)</span>
                    <span>KES 65,000</span>
                  </div>
                  <div className="flex justify-between text-on-surface">
                    <span>Service Charge</span>
                    <span>KES 5,000</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-outline-variant flex justify-between font-bold text-[20px] leading-[28px] text-on-surface">
                    <span>First Month Total</span>
                    <span>KES 135,000</span>
                  </div>
                </div>
              </div>

              {/* Landlord Card */}
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20">
                      <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOr3WZSCVAr7D9c20qSH9bYeF9tYe0FqaoVECcoJ_3mNNjWKS7_koAwmTbDrvrX1PlDAeCoXowwBR_kWgFU5Sp-u1WECnl2-ZkJ3mMcrRqrTFdMvlAfDxaZ9lFqrlgWJZWoLa_7h9KISRMgm-U_IqfupLd-Hu3hoKKJYluKyYoBb7ABV9NZS9kBHvSbjcxt6w8up0ElGO2dqpvNicsEX5FMjvMy262TTrHPPL69Skfd2UxtGOyymO9" alt="David M." />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Managed by David M.</h3>
                    <p className="text-sm text-on-surface-variant">Verified Property Manager</p>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  David has been managing properties in Westlands for 5 years and has a 100% response rate within 1 hour.
                </p>
                <button className="w-full border border-primary text-primary py-2 rounded-lg font-bold text-sm hover:bg-primary/5 transition-all">
                  Message Manager
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 py-4 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-[18px]">flag</span>
                <a className="underline font-medium" href="#">Report this listing</a>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Similar Properties */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface">Recommended for you</h2>
            <a className="text-primary font-bold hover:underline" href="#">See all</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProperties.map((property) => (
              <Link key={property.id} href={`/listing/${property.id}`} className="group cursor-pointer">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 shadow-sm">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={property.image}
                    alt={property.name}
                  />
                  <button className="absolute top-4 right-4 text-white/90 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">favorite</span>
                  </button>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-on-surface">{property.name}</h3>
                    <p className="text-on-surface-variant">{property.distance}</p>
                    <p className="mt-1"><span className="font-bold text-on-surface">KES {property.price}</span> <span className="text-on-surface-variant">month</span></p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-sm font-bold">{property.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-outline-variant mt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[20px] leading-[28px] font-bold text-on-surface mb-4">RentFlow</h4>
            <p className="text-[14px] leading-[20px] text-on-surface-variant">Reliable property management and housing solutions for the modern Kenyan market.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><a className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors" href="#">University Housing</a></li>
              <li><a className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors" href="#">Pricing Plans</a></li>
              <li><a className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors" href="#">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><a className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wider">Stay Connected</h4>
            <div className="flex gap-3 mb-4">
              <a className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all" href="#">
                <span className="material-symbols-outlined text-[20px]">public</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all" href="#">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </a>
            </div>
            <p className="text-xs text-on-surface-variant">© 2024 RentFlow Kenya. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full shadow-2xl flex items-center gap-8 border border-white/10">
        <button className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span className="text-[10px] font-bold">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary-fixed-dim">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <span className="text-[10px] font-bold">Saved</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
}
