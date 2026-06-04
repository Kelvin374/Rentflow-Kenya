'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { Bell, Shield, User, Smartphone, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut, updateUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [notifications, setNotifications] = useState({
    email: true, sms: true, payment: true, maintenance: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user, isAuthenticated, isLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateUser({ name: profile.name, phone: profile.phone });
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="p-6 space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><User size={18} /> Profile Information</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={profile.email} disabled
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
              </div>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Bell size={18} /> Notification Preferences</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
              { key: 'payment', label: 'Payment Alerts', desc: 'Get notified when payments are received' },
              { key: 'maintenance', label: 'Maintenance Updates', desc: 'Get notified on maintenance progress' },
            ].map((n) => (
              <label key={n.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.label}</p>
                  <p className="text-xs text-gray-400">{n.desc}</p>
                </div>
                <input type="checkbox" checked={notifications[n.key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({ ...notifications, [n.key]: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary" />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Shield size={18} /> Account</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">M-Pesa Integration</p>
                  <p className="text-xs text-gray-400">Connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Subscription</p>
                <p className="text-xs text-gray-400 capitalize">{user?.subscription || 'free'} plan</p>
              </div>
              <Button variant="outline" size="sm">Upgrade</Button>
            </div>
            <button onClick={signOut}
              className="flex items-center gap-2 text-sm text-danger hover:text-danger-dark font-medium p-2 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
