'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardRoute } from '@/lib/auth';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('2547');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'landlord' | 'tenant'>('landlord');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, {
      name: `${firstName} ${lastName}`.trim(),
      phone,
      role,
    });
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }

    router.push(getDashboardRoute(role));
  };

  return (
    <>
      <style>{`
        .register-transition { transition: opacity 0.4s ease-out, transform 0.4s ease-out; }
        .input-focus-ring:focus { outline: none; border-color: #004ac6; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }
        .glass-overlay { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>
      <div className="min-h-screen w-full flex flex-col md:flex-row overflow-x-hidden">
      {/* Left Side: Visual Narrative */}
      <section className="hidden md:flex relative w-full md:w-1/2 lg:w-3/5 h-screen overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 p-8 rounded-xl glass-overlay text-white flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
            <h1 className="text-[24px] leading-[32px] font-bold tracking-tight">RentFlow</h1>
          </div>
          <h2 className="text-[30px] leading-[38px] tracking-tight font-bold">Start managing your properties today.</h2>
          <p className="text-[18px] leading-[28px] opacity-90">Join 1,200+ property managers across Kenya. Track payments, manage tenants, and grow your portfolio.</p>
          <div className="flex gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-[24px] leading-[32px] font-bold">12k+</span>
              <span className="text-[12px] leading-[16px] uppercase tracking-wider opacity-75">Properties</span>
            </div>
            <div className="flex flex-col border-l border-white/20 pl-6">
              <span className="text-[24px] leading-[32px] font-bold">98%</span>
              <span className="text-[12px] leading-[16px] uppercase tracking-wider opacity-75">Tenant Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-8 bg-surface-container-lowest">
        {/* Mobile Logo */}
        <div className="md:hidden mb-8 flex items-center gap-2 text-primary">
          <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-[24px] leading-[32px] font-bold">RentFlow</span>
        </div>

        <div className="w-full max-w-md">
          <header className="mb-8">
            <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface mb-1">Create an Account</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Join 1,200+ property managers across Kenya.</p>
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && <p className="text-sm text-error bg-error-container/30 p-3 rounded-xl">{error}</p>}

            {/* Role Selector */}
            <div className="flex bg-surface-container rounded-lg p-1">
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'landlord' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Landlord
              </button>
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'tenant' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Tenant
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="first-name">First Name</label>
                <input
                  className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                  id="first-name"
                  placeholder="John"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="last-name">Last Name</label>
                <input
                  className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                  id="last-name"
                  placeholder="Doe"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="reg-email">Email Address</label>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="reg-email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="reg-phone">Phone Number</label>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="reg-phone"
                placeholder="2547XXXXXXXX"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="reg-password">Create Password</label>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="reg-password"
                placeholder="Min. 8 characters"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-3 text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            <p className="text-[14px] leading-[20px] text-on-surface-variant">
              By registering, you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-primary-container text-on-primary-container font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <span className="material-symbols-outlined text-[20px]">person_add</span>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[16px] leading-[24px] text-on-surface-variant">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline ml-1">Log in here</Link>
            </p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
