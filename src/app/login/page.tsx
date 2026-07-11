'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

const DEMO_ACCOUNTS = [
  { id: 'a0000000-0000-0000-0000-000000000001', label: 'Landlord (Free)', role: 'landlord' },
  { id: 'a0000000-0000-0000-0000-000000000002', label: 'Landlord (Professional)', role: 'landlord' },
  { id: 'a0000000-0000-0000-0000-000000000003', label: 'Tenant — Kevin Juma', role: 'tenant' },
  { id: 'a0000000-0000-0000-0000-000000000004', label: 'Tenant — Elizabeth Otieno', role: 'tenant' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'landlord' | 'tenant'>('landlord');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, loginAs } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    router.push(role === 'landlord' ? '/dashboard' : '/tenant/dashboard');
  };

  const handleDemoLogin = async (profileId: string, role: string) => {
    setLoading(true);
    setError('');
    const { error: loginError } = await loginAs(profileId);
    if (loginError) {
      setError(loginError);
      setLoading(false);
      return;
    }
    router.push(role === 'landlord' ? '/dashboard' : '/tenant/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="RentFlow" className="w-10 h-10 rounded-xl object-contain" />
            <span className="text-xl font-bold text-gray-900">RentFlow Kenya</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setRole('landlord')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'landlord' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Landlord
            </button>
            <button
              onClick={() => setRole('tenant')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'tenant' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Tenant
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-danger bg-red-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-500">Remember me</span>
              </label>
              <button type="button" onClick={() => alert('Password reset link sent to your email')} className="text-primary hover:underline">Forgot password?</button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">Or try a demo account</span>
            </div>
          </div>

          <div className="space-y-2">
            {DEMO_ACCOUNTS.filter((a) => role === 'landlord' ? a.role === 'landlord' : a.role === 'tenant').map((account) => (
              <button
                key={account.id}
                onClick={() => handleDemoLogin(account.id, account.role)}
                disabled={loading}
                className="w-full text-left px-4 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                {account.label}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
