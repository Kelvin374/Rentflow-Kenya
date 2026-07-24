'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: string }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  saveLocation: (latitude: number, longitude: number) => Promise<void>;
  loginAs: (profileId: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  updateUser: async () => {},
  saveLocation: async () => {},
  loginAs: async () => ({}),
});

function mapProfile(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role,
    avatar: row.avatar || '',
    subscription: row.subscription,
    isActive: row.is_active,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rentflow_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('rentflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('rentflow_user');
    }
  }, [user]);

  const signIn = useCallback(async (email: string, _password: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) return { error: 'Invalid email or password' };

    const profile = mapProfile(data);
    setUser(profile);
    return { role: profile.role };
  }, []);

  const signUp = useCallback(async (email: string, _password: string, userData: Partial<User>) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) return { error: 'An account with this email already exists' };

    const newId = crypto.randomUUID();
    const { error } = await supabase.from('profiles').insert({
      id: newId,
      name: userData.name || email.split('@')[0],
      email,
      phone: userData.phone || '',
      role: userData.role || 'tenant',
      national_id: '',
      avatar: '',
      subscription: 'free',
      emergency_contact: '',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    if (error) return { error: error.message };

    setUser({
      id: newId,
      name: userData.name || email.split('@')[0],
      email,
      phone: userData.phone || '',
      role: (userData.role || 'tenant') as User['role'],
      avatar: '',
      subscription: 'free',
      latitude: userData.latitude,
      longitude: userData.longitude,
      createdAt: new Date().toISOString(),
    });
    return {};
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('rentflow_user');
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      supabase
        .from('profiles')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.avatar !== undefined && { avatar: updates.avatar }),
          ...(updates.subscription && { subscription: updates.subscription }),
        })
        .eq('id', prev.id)
        .then();

      return updated;
    });
  }, []);

  const loginAs = useCallback(async (profileId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .maybeSingle();

    if (error || !data) return { error: 'Profile not found' };

    setUser(mapProfile(data));
    return {};
  }, []);

  const saveLocation = useCallback(async (latitude: number, longitude: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, latitude, longitude };
      localStorage.setItem('rentflow_user', JSON.stringify(updated));
      supabase
        .from('profiles')
        .update({ latitude, longitude })
        .eq('id', prev.id)
        .then();
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut, updateUser, saveLocation, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function getDashboardRoute(role: string): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'tenant': return '/tenant/dashboard';
    default: return '/dashboard';
  }
}
