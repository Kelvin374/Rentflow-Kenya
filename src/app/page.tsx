'use client';

import { useState } from 'react';
import Link from 'next/link';

const universities = ['KABARAK', 'EGERTON', 'UoN', 'JKUAT', 'MOI', 'MASENO'];

const featuredProperties = [
  {
    id: 1,
    name: 'Riverside Studio',
    price: '15k',
    location: 'Juja, near JKUAT Gate B',
    beds: '1 Bed',
    baths: '1 Bath',
    amenity: 'Free WiFi',
    amenityIcon: 'wifi',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2I8DsGcZjheTgZsO1-PrRedEndyjWA5SBUFjFOrhza1q6ToUL5slBOe8K_KCLuFmiQW3t4mI_5PIRbTCqscJvZFL-1HLTjBoJOr5R9gzEtHVxCibiaTk4Jd3Vv9qL2oscS0a5fH0c07sKRvznRfa5n_ahSl2gEU0UQ9wjgBy6Hc9kJaLcfoWl1m9MGCIV-aigu2jizj1kZHppYauFVsyST2GPcPu9kwpVgF6_CpoKYO_71DHaQ2Ow',
    filled: true,
  },
  {
    id: 2,
    name: 'The Heights 2BR',
    price: '28k',
    location: 'Madaraka, Nairobi (Near UoN)',
    beds: '2 Beds',
    baths: '2 Baths',
    amenity: 'Parking',
    amenityIcon: 'local_parking',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCsbmITHmMw3rIgBCUmThd8Q4fFEc9U12b662YSD4gZwN-yTOX1pCdrpCb-utb3nBLv_2maTH5jsfXSWdYUmQHqh3qGgDBWT8uhHuxpUDzatrz5rGFEHmXCxpg6ph0gIjMWMHEfLuZ_rPiIRahGy5ECLw6KKwp5zdR1em8LtE-Iwxuzo9Ry1wiKCjvX25brr4scFow4bXvkz6bj7NPRlzSe3L55ZmAiZ_gOptFxJXfLMTjPzS9diBH',
    filled: false,
  },
  {
    id: 3,
    name: 'Elite Student Hostels',
    price: '8k',
    location: 'Nakuru, near Egerton Main',
    beds: '1 Bed',
    baths: 'Shared Bath',
    amenity: '24/7 Security',
    amenityIcon: 'security',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq29BiNlEv2YbZFodHk9r9DGbg1kkSHvPqYaDCU5LrQJefm-3GcFp-Z-dTmk0H06K_8NZrGKp4LRTayR6_o6KO2lDEFct82liGLsnzz8cbtP-9fdZXfcUYWVd_v1B6JjPN9CqlfhF-2kK_wgga95F8nwON1YVJeBSp6iIjvS1TDinIxKAVjq5gu4eEmxOL1pXlqpVcANmdNhry8hg8geq6r3GvaqrOHTx_4LoVNtCpv8SVbR22R830',
    filled: false,
  },
  {
    id: 4,
    name: 'Panorama Loft',
    price: '22k',
    location: 'Eldoret, near Moi University',
    beds: '1 Bed',
    baths: '1 Bath',
    amenity: 'Balcony',
    amenityIcon: 'balcony',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXNJasLXfzbobnFwyue48Q5ozv_JXeaevy2m6t2nvF-DuSbbpJaU1vBzDNHGfj0D2u0nu-YxC2RXm8ty6Sk7JzXmTUGyNQg77OAqOPvgYD_E6QiWweEmY7QunaO8hFdfzC-vpMnkwlYZG3lycblIa-rYNay0Cazyl0qmYzjMbFCGysO5qoqsz6SXF3BUqU3t74jI8Qa1jAWlVF3NKMiTQ-HsquEVTCPAxzNh5dNoZuQ3Ginh7EJTd9',
    filled: false,
  },
  {
    id: 5,
    name: 'Milimani Guesthouse',
    price: '12k',
    location: 'Maseno, Kisumu',
    beds: 'Studio',
    baths: 'Communal',
    amenity: 'Backup Power',
    amenityIcon: 'bolt',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJeIJZg1Jb6wtN3IYvzWbLedURFvzPqLhf4__Wv3sTwU-1WR3Gf9nP24JvIZ8lfOCNfN1WYlqEoNeY_dt1z4B0jvh2yyJsSLJC6I0oFcRsnKy8nrfORoQ-N_C7QxVVE8wuBm9SoRN1fJvhTqTHwtWLNkyd-BnOZpGnNJKnpGz3Qj0UOEEaMDitAoC5XohTzehFkKxk5pI5eZlUhQOomlxDD2xGKyqQmFWCL_CKbeJwviguBy8euGOD',
    filled: true,
  },
  {
    id: 6,
    name: 'Kaba Court Units',
    price: '18k',
    location: 'Lanet, Nakuru (Near Kabarak)',
    beds: '1 Bed',
    baths: '1 Bath',
    amenity: 'Gated',
    amenityIcon: 'security',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO_szKsChQReUcSTE7-4DkGfgrKB2bBwOZ19htVjdFDAco5rFgHo6ch8C911Z69GhyH6fXRek3IeqCWxqYqMAfhDuwloE3Zfw_Sz1o8Dwploq6kM9VBwRzHKn0Gwu_LuhbS-EwstCZdE0knUG9GWwWtTzN7B4SeteQSNcSGhG1yQu631Mr97JksqL6dEdl53PWe8wvZXy2E8FDcvn6viZBi-JIR9qJzQjWSK6NnvPHK-tvStt17XbN',
    filled: false,
  },
];

const features = [
  { icon: 'travel_explore', title: 'Smart Search', desc: 'Filter by institution, walking distance, price, and amenities to find your perfect match in seconds.' },
  { icon: 'auto_awesome', title: 'AI Recommendations', desc: 'Our smart engine learns your preferences and suggests the best deals before they go public.' },
  { icon: 'verified_user', title: 'Verified Listings', desc: 'Every property on our platform is physically inspected by our team to prevent scams and ensure quality.' },
  { icon: 'chat', title: 'Real-time Messaging', desc: 'Chat directly with landlords and property managers within the app to schedule viewings or ask questions.' },
  { icon: 'construction', title: 'Maintenance Requests', desc: 'Already moved in? Report issues through the app and track repair progress in real-time.' },
  { icon: 'payments', title: 'Secure Online Payments', desc: 'Pay your rent and deposits securely via M-Pesa or bank transfer with instant automated receipts.' },
];

export default function LandingPage() {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('Studio');
  const [priceRange, setPriceRange] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      {/* TopNavBar */}
      <header className="bg-surface-container-lowest sticky top-0 z-50 shadow-sm transition-all duration-300">
        <nav className="flex justify-between items-center w-full px-6 py-4 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
              <span className="text-[24px] leading-[32px] font-semibold text-primary">RentFlow</span>
            </Link>
            <div className="hidden md:flex gap-6">
              <a className="text-primary border-b-2 border-primary pb-1 font-semibold text-sm" href="#">Home</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm" href="#properties">Browse</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm" href="#features">Features</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm" href="#universities">Universities</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm" href="#pricing">Pricing</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm" href="#contact">Contact</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block px-4 py-2 rounded-lg font-semibold text-sm text-primary hover:bg-surface-container-low transition-colors">Login</Link>
            <Link href="/register" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold text-sm hover:bg-primary-container transition-all active:scale-95 shadow-md">Register</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-24">
        <div className="max-w-[1280px] mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center">
          <div className="z-10 order-2 lg:order-1">
            <h1 className="text-[36px] leading-[44px] tracking-tight font-bold text-on-surface mb-4">
              Find. Rent. <span className="text-primary">Live Easy.</span>
            </h1>
            <p className="text-[18px] leading-[28px] text-on-surface-variant mb-12 max-w-lg">
              Find affordable verified rental houses near universities across Kenya. We take the stress out of property hunting for students and professionals.
            </p>

            {/* Search Component */}
            <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center border border-outline-variant/30">
              <div className="flex flex-col w-full px-2 border-r-0 md:border-r border-outline-variant">
                <label className="text-xs font-medium text-secondary mb-1">Location</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Nairobi, Juja, Eldoret..."
                    className="w-full border-none focus:ring-0 p-0 text-base placeholder:text-outline"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full px-2 border-r-0 md:border-r border-outline-variant">
                <label className="text-xs font-medium text-secondary mb-1">Property Type</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">apartment</span>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full border-none focus:ring-0 p-0 text-base bg-transparent"
                  >
                    <option>Studio</option>
                    <option>1 Bedroom</option>
                    <option>2 Bedroom</option>
                    <option>Shared</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col w-full px-2">
                <label className="text-xs font-medium text-secondary mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">payments</span>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="KES 5k - 20k"
                    className="w-full border-none focus:ring-0 p-0 text-base placeholder:text-outline"
                  />
                </div>
              </div>
              <button className="bg-primary text-on-primary w-full md:w-auto px-8 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-lg shrink-0">
                <span className="material-symbols-outlined">search</span> Search
              </button>
            </div>

            {/* Feature Badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: 'verified', label: 'Verified Listings' },
                { icon: 'money_off', label: 'No Hidden Fees' },
                { icon: 'school', label: 'Nearby Universities' },
                { icon: 'security', label: 'Secure Payments' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 bg-surface-container-high px-4 py-1 rounded-full border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[18px]">{badge.icon}</span>
                  <span className="text-xs font-medium text-on-surface-variant">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration Side */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-tertiary-fixed/30 rounded-full blur-2xl"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                className="w-full aspect-square object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXmj8dPCeTNJvQAMjVRzOGz_CpSCykIOwmbbH7plCVWoBSiws6Zr3kSL4k14wRknkYufwIIZUpTK6K0Rb0BOfMboijMFL09AhO4ueaYJ-Ek2Fy0PtrEPg1flKXJcOjFM3M8b3o-S676kEYDPGp96j1MJyQ3MWXSZKNAdshS3rtGAV-xlk3y8Dn1tUQngqmsOoATuuhp4QDGo1xqZAw8SSi3mpFrc8TvLn5AVYlRuLA_7mLOKbKOab2"
                alt="Modern apartment complex"
              />
              <div className="absolute bottom-6 left-6 bg-white/70 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 border border-white/50">
                <div className="bg-primary-container p-2 rounded-lg">
                  <span className="material-symbols-outlined text-on-primary">trending_up</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-on-surface">500+ New Units</p>
                  <p className="text-[14px] leading-[20px] text-on-surface-variant">Available this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Universities */}
      <section id="universities" className="py-8 bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-center font-semibold text-sm text-secondary uppercase tracking-widest mb-6">Trusted by Students From</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {universities.map((uni) => (
              <span key={uni} className="font-bold text-[20px] leading-[28px] text-on-surface">{uni}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="properties" className="py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-[30px] leading-[38px] tracking-tight font-bold mb-2">Featured Properties</h2>
              <p className="text-base text-on-surface-variant">Top-rated accommodation near major institutions.</p>
            </div>
            <a className="text-primary font-semibold text-sm flex items-center gap-2 hover:underline" href="#">
              View All Properties <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-outline-variant/30">
                <div className="relative h-64 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={property.image}
                    alt={property.name}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-primary">
                    Verified
                  </div>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-secondary hover:text-error transition-colors">
                    <span className={`material-symbols-outlined ${property.filled ? '[font-variation-settings:\'FILL\'_1]' : ''}`}>favorite</span>
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[24px] leading-[32px] font-semibold text-on-surface">{property.name}</h3>
                    <p className="text-primary font-bold text-[20px] leading-[28px]">KES {property.price}<span className="text-xs text-secondary font-normal">/mo</span></p>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span className="text-[14px] leading-[20px]">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-6 border-t border-outline-variant pt-4">
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-sm">bed</span>
                      <span className="text-xs font-medium">{property.beds}</span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-sm">shower</span>
                      <span className="text-xs font-medium">{property.baths}</span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-sm">{property.amenityIcon}</span>
                      <span className="text-xs font-medium">{property.amenity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-24 bg-surface-container">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[30px] leading-[38px] tracking-tight font-bold mb-2">Why Choose RentFlow?</h2>
            <p className="text-base text-on-surface-variant">The most comprehensive property management and rental search engine in Kenya.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 hover:border-primary transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <h3 className="text-[24px] leading-[32px] font-semibold mb-4">{feature.title}</h3>
                <p className="text-base text-on-surface-variant">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-outline-variant mt-12">
        <div className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-bold text-[20px] leading-[28px] text-on-surface">RentFlow</span>
            </Link>
            <p className="text-[14px] leading-[20px] text-on-surface-variant mb-6">
              The ultimate housing platform for the modern Kenyan student and professional. Find your next home today.
            </p>
            <div className="flex gap-3">
              <a className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all" href="#">
                <span className="material-symbols-outlined text-[18px]">share</span>
              </a>
              <a className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all" href="#">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-on-surface mb-6">Company</h4>
            <ul className="flex flex-col gap-2">
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">About Us</a></li>
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">Terms of Service</a></li>
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-on-surface mb-6">Solutions</h4>
            <ul className="flex flex-col gap-2">
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">University Housing</a></li>
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">Pricing Plans</a></li>
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">Property Management</a></li>
              <li><a className="text-on-surface-variant hover:text-primary text-[14px] leading-[20px] transition-colors" href="#">Verification Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-on-surface mb-6">Newsletter</h4>
            <p className="text-[14px] leading-[20px] text-on-surface-variant mb-4">Subscribe for new listing alerts and rental tips.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 w-full text-[14px] leading-[20px] focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button className="bg-primary text-on-primary p-2 rounded-lg hover:bg-primary-container transition-all">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 py-6 border-t border-outline-variant/30 text-center">
          <p className="text-xs font-medium text-on-surface-variant">© 2026 RentFlow Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
