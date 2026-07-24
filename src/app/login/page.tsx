'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDashboardRoute } from '@/lib/auth';

const DEMO_ACCOUNTS: { id: string; label: string; role: string }[] = [];

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'landlord' | 'tenant'>('landlord');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [agency, setAgency] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const router = useRouter();
  const { signIn, signUp, loginAs } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError, role: actualRole } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    router.push(getDashboardRoute(actualRole || 'landlord'));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError } = await signUp(regEmail, regPassword, {
      name: `${firstName} ${lastName}`.trim(),
      phone: '',
      role: 'landlord',
    });
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }

    router.push(getDashboardRoute('landlord'));
  };

  const handleDemoLogin = async (profileId: string, demoRole: string) => {
    setLoading(true);
    setError('');
    const { error: loginError } = await loginAs(profileId);
    if (loginError) {
      setError(loginError);
      setLoading(false);
      return;
    }
    router.push(getDashboardRoute(demoRole));
  };

  return (
    <>
      <style>{`
        .login-transition { transition: opacity 0.4s ease-out, transform 0.4s ease-out; }
        .input-focus-ring:focus { outline: none; border-color: #004ac6; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }
        .glass-overlay { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>
      <div className="min-h-screen w-full flex flex-col md:flex-row overflow-x-hidden">
      {/* Left Side: Visual Narrative */}
      <section className="hidden md:flex relative w-full md:w-1/2 lg:w-3/5 h-screen overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80&auto=format&fit=crop')" }}
        />
        {/* Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-transparent" />
        {/* Branding/Value Prop in Glass Container */}
        <div className="absolute bottom-8 left-8 right-8 p-8 rounded-xl glass-overlay text-white flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
            <h1 className="text-[24px] leading-[32px] font-bold tracking-tight">RentFlow</h1>
          </div>
          <h2 className="text-[30px] leading-[38px] tracking-tight font-bold leading-tight">Simplify your property management experience in Kenya.</h2>
          <p className="text-[18px] leading-[28px] opacity-90">Manage units, track payments, and communicate with tenants all in one high-utility dashboard.</p>
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

      {/* Right Side: Interaction Area */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-8 bg-surface-container-lowest">
        {/* Mobile Logo */}
        <div className="md:hidden mb-8 flex items-center gap-2 text-primary">
          <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-[24px] leading-[32px] font-bold">RentFlow</span>
        </div>

        {/* Login Container */}
        <div className={`w-full max-w-md login-transition ${view === 'login' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'}`}>
          <header className="mb-8">
            <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface mb-1">Welcome Back</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Access your dashboard to manage your portfolio.</p>
          </header>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {error && <p className="text-sm text-error bg-error-container/30 p-3 rounded-xl">{error}</p>}

            {/* Demo Account Selector */}
            <div className="flex bg-surface-container rounded-lg p-1">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                Admin
              </button>
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

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="email">Email Address</label>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="email"
                placeholder="manager@rentflow.co.ke"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="password">Password</label>
                <button type="button" className="text-[12px] leading-[16px] font-medium text-primary hover:underline">Forgot password?</button>
              </div>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-3 text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="text-[14px] leading-[20px] text-on-surface-variant select-none cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-primary-container text-on-primary-container font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Signing in...' : 'Login to Dashboard'}
              {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center text-[12px] leading-[16px] uppercase">
              <span className="bg-surface-container-lowest px-4 text-on-surface-variant font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="h-12 flex items-center justify-center gap-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-low transition-colors text-[14px] leading-[20px] font-semibold">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button type="button" className="h-12 flex items-center justify-center gap-2 border border-outline-variant rounded-xl bg-surface hover:bg-surface-container-low transition-colors text-[14px] leading-[20px] font-semibold">
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              Facebook
            </button>
          </div>

          <div className="mt-8 mb-8 text-center">
            <p className="text-[16px] leading-[24px] text-on-surface-variant">
              Don&apos;t have an account yet?{' '}
              <button onClick={() => { setView('register'); setError(''); }} className="text-primary font-bold hover:underline ml-1">Register your Agency</button>
            </p>
          </div>

        </div>

        {/* Register Container */}
        <div className={`w-full max-w-md login-transition ${view === 'register' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
          <header className="mb-8">
            <h3 className="text-[30px] leading-[38px] tracking-tight font-bold text-on-surface mb-1">Create an Account</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Join 1,200+ property managers across Kenya.</p>
          </header>

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            {error && <p className="text-sm text-error bg-error-container/30 p-3 rounded-xl">{error}</p>}

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
              <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="reg-email">Work Email</label>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="reg-email"
                placeholder="name@agency.com"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="agency">Agency Name (Optional)</label>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="agency"
                placeholder="Summit Properties Ltd"
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] font-semibold text-on-surface" htmlFor="reg-password">Create Password</label>
              <input
                className="h-12 px-4 rounded-xl border border-outline-variant bg-surface input-focus-ring text-[16px] leading-[24px] transition-all"
                id="reg-password"
                placeholder="Min. 8 characters"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <p className="text-[14px] leading-[20px] text-on-surface-variant">
              By registering, you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-primary-container text-on-primary-container font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create Manager Account'}
              {!loading && <span className="material-symbols-outlined text-[20px]">person_add</span>}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-[16px] leading-[24px] text-on-surface-variant">
              Already have an account?{' '}
              <button onClick={() => { setView('login'); setError(''); }} className="text-primary font-bold hover:underline ml-1">Log in here</button>
            </p>
          </footer>
        </div>
      </section>
      </div>
    </>
  );
}
