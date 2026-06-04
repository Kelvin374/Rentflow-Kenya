'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Menu, X, CheckCircle, Star, TrendingUp, Users, Building2,
  Smartphone, Shield, BarChart3, ArrowRight, Mail, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">RF</span>
              </div>
              <span className="font-bold text-gray-900">RentFlow Kenya</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-500 hover:text-gray-900">Features</a>
              <a href="#benefits" className="text-sm text-gray-500 hover:text-gray-900">Benefits</a>
              <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900">Pricing</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-sm text-primary font-medium mb-6">
            <Shield size={14} />
            Trusted by 500+ Landlords in Nairobi
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Smart Property Management Tailored for Kenya
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Automate rent collection via M-Pesa, manage tenants effortlessly, and track maintenance requests in real-time. The only all-in-one platform built for the local market.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">Get Started Free</Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Learn More</Button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><Shield size={14} />24/7 Expert Support</span>
            <span className="flex items-center gap-1.5"><Shield size={14} />99.9% Uptime</span>
            <span className="flex items-center gap-1.5"><Shield size={14} />0% Hidden Fees</span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
            <Smartphone size={24} className="text-primary mb-2" />
            <p className="text-sm text-gray-500">Rent Collected</p>
            <p className="text-2xl font-bold text-gray-900">Ksh 1.2M This Month</p>
          </div>
          <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-6 border border-success/20">
            <Users size={24} className="text-success mb-2" />
            <p className="text-sm text-gray-500">New Tenants</p>
            <p className="text-2xl font-bold text-gray-900">+12 Registered</p>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Landlords</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Eliminate manual paperwork with tools designed to streamline every aspect of your rental business.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4"><Smartphone size={20} className="text-primary" /></div>
              <h3 className="font-semibold text-gray-900 mb-2">Integrated M-Pesa Payments</h3>
              <p className="text-sm text-gray-500">Seamlessly collect rent via M-Pesa Paybill or Till numbers. Automatic reconciliation updates tenant balances.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-4"><BarChart3 size={20} className="text-success" /></div>
              <h3 className="font-semibold text-gray-900 mb-2">Automated Collection</h3>
              <p className="text-sm text-gray-500">Set up recurring invoices and automated reminders to ensure you never miss a payment deadline.</p>
              <div className="mt-3 space-y-1">
                <span className="flex items-center gap-1 text-xs text-success"><CheckCircle size={12} /> Daily Reminders</span>
                <span className="flex items-center gap-1 text-xs text-success"><CheckCircle size={12} /> Fine Calculation</span>
                <span className="flex items-center gap-1 text-xs text-success"><CheckCircle size={12} /> Instant Receipts</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mb-4"><Users size={20} className="text-warning" /></div>
              <h3 className="font-semibold text-gray-900 mb-2">Tenant Portal</h3>
              <p className="text-sm text-gray-500">Self-service portal for tenants to view statements, pay rent, and log issues from their own devices.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center mb-4"><Building2 size={20} className="text-danger" /></div>
              <h3 className="font-semibold text-gray-900 mb-2">Maintenance Tracking</h3>
              <p className="text-sm text-gray-500">Track repair requests from submission to resolution. Assign tasks to vendors and monitor costs.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Experience 10x Efficiency</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Stop chasing rent and start growing your portfolio. RentFlow is designed to give you your time back.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4"><TrendingUp size={28} className="text-primary" /></div>
              <h3 className="font-semibold text-lg mb-2">Save 20+ Hours Weekly</h3>
              <p className="text-sm text-gray-500">Automated invoicing and payment reconciliation removes the need for manual data entry.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4"><CheckCircle size={28} className="text-success" /></div>
              <h3 className="font-semibold text-lg mb-2">Automated Late Fees</h3>
              <p className="text-sm text-gray-500">System automatically applies pre-defined penalties, encouraging on-time payments.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-warning/10 flex items-center justify-center mb-4"><BarChart3 size={28} className="text-warning" /></div>
              <h3 className="font-semibold text-lg mb-2">Clear Tax Reporting</h3>
              <p className="text-sm text-gray-500">Generate profit & loss statements and tax-ready reports with a single click.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-gray-500">Choose the plan that fits your current portfolio size.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-1">Basic</h3>
              <p className="text-3xl font-bold mb-1">Ksh 2,500<span className="text-sm font-normal text-gray-400">/month</span></p>
              <p className="text-sm text-gray-500 mb-6">Ideal for individual landlords with up to 10 units.</p>
              <ul className="space-y-3 mb-8">
                {['10 Property Units', 'M-Pesa Integration', 'Basic Reporting'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-success" />{f}</li>
                ))}
                <li className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={16} />Maintenance Tracking</li>
              </ul>
              <Link href="/register"><Button className="w-full">Select Basic</Button></Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-primary shadow-lg relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
              <h3 className="text-lg font-semibold mb-1">Professional</h3>
              <p className="text-3xl font-bold mb-1">Ksh 7,500<span className="text-sm font-normal text-gray-400">/month</span></p>
              <p className="text-sm text-gray-500 mb-6">Perfect for growing agencies with up to 50 units.</p>
              <ul className="space-y-3 mb-8">
                {['50 Property Units', 'Priority M-Pesa Sync', 'Maintenance Portal', 'Multi-user Access'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-success" />{f}</li>
                ))}
              </ul>
              <Link href="/register"><Button className="w-full">Select Professional</Button></Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-1">Enterprise</h3>
              <p className="text-3xl font-bold mb-1">Custom</p>
              <p className="text-sm text-gray-500 mb-6">For large property developers & management firms.</p>
              <ul className="space-y-3 mb-8">
                {['Unlimited Units', 'Dedicated Account Manager', 'Custom Integrations', 'On-site Training'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-success" />{f}</li>
                ))}
              </ul>
              <a href="mailto:sales@rentflow.co.ke"><Button variant="outline" className="w-full">Contact Sales</Button></a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Samuel Mwangi', company: 'Prime Estates Ltd', text: 'RentFlow has completely transformed how we handle collections. We went from 70% on-time payments to nearly 98% in just three months thanks to the M-Pesa automation.' },
              { name: 'Faith Wambui', company: 'Independent Landlord', text: 'The tenant portal is a game changer. My tenants love that they can see their balance and pay at any time of night without calling me.' },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} className="fill-warning text-warning" />)}
                </div>
                <p className="text-sm text-gray-600 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Automate Your Portfolio?</h2>
          <p className="text-primary-light text-lg mb-8">Join hundreds of Kenyan property owners who are saving time and increasing their rental yields.</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 border-0">Start Your 14-Day Free Trial</Button>
          </Link>
          <p className="text-primary-light/70 text-sm mt-3">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><span className="text-white font-bold text-sm">RF</span></div>
                <span className="font-bold text-white">RentFlow Kenya</span>
              </div>
              <p className="text-sm">Revolutionizing property management for the Kenyan market with seamless M-Pesa integration.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            &copy; 2024 RentFlow Kenya. All rights reserved. Built for the Kenyan market.
          </div>
        </div>
      </footer>
    </div>
  );
}
