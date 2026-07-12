'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { profiles as seedProfiles } from './seed-data';

const DEMO_PROFILES: Record<string, User> = {
  'a0000000-0000-0000-0000-000000000001': {
    id: 'a0000000-0000-0000-0000-000000000001', name: 'Admin User',
    email: 'admin@rentflow.co.ke', phone: '+254712345678', role: 'landlord',
    subscription: 'free', createdAt: '2026-01-01T00:00:00Z',
  },
  'a0000000-0000-0000-0000-000000000002': {
    id: 'a0000000-0000-0000-0000-000000000002', name: 'Premium Landlord',
    email: 'premium@rentflow.co.ke', phone: '+254712345679', role: 'landlord',
    subscription: 'professional', createdAt: '2026-01-01T00:00:00Z',
  },
  'a0000000-0000-0000-0000-000000000003': {
    id: 'a0000000-0000-0000-0000-000000000003', name: 'Kevin Juma',
    email: 'kevin@example.com', phone: '+254798765432', role: 'tenant',
    subscription: 'free', createdAt: '2026-01-01T00:00:00Z',
  },
  'a0000000-0000-0000-0000-000000000004': {
    id: 'a0000000-0000-0000-0000-000000000004', name: 'Elizabeth Otieno',
    email: 'elizabeth.o@gmail.com', phone: '+254711111111', role: 'tenant',
    subscription: 'free', createdAt: '2026-01-01T00:00:00Z',
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
  loginAs: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email: string): Promise<User | null> => {
    const profile = seedProfiles.find((p) => p.id === userId);
    if (!profile) return null;
    return {
      id: userId, name: profile.name, email: email,
      phone: profile.phone || '', role: profile.role as User['role'],
      avatar: profile.avatar || '', subscription: profile.subscription as User['subscription'],
      createdAt: profile.created_at,
    };
  }, []);

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

  const signIn = useCallback(async (_email: string, _password: string) => {
    const profile = seedProfiles.find((p) => p.email === _email);
    if (!profile) return { error: 'Invalid email or password' };
    setUser({
      id: profile.id, name: profile.name, email: profile.email || _email,
      phone: profile.phone || '', role: profile.role as User['role'],
      subscription: profile.subscription as User['subscription'],
      createdAt: profile.created_at,
    });
    return {};
  }, []);

  const signUp = useCallback(async (_email: string, _password: string, userData: Partial<User>) => {
    const newId = crypto.randomUUID();
    seedProfiles.push({
      id: newId, name: userData.name || _email.split('@')[0],
      email: _email, phone: userData.phone || '', role: userData.role || 'tenant',
      national_id: '', avatar: '', subscription: 'free', emergency_contact: '',
      is_verified: true, created_at: new Date().toISOString(),
    });
    setUser({
      id: newId, name: userData.name || _email.split('@')[0],
      email: _email, phone: userData.phone || '',
      role: (userData.role || 'tenant') as User['role'],
      subscription: 'free', createdAt: new Date().toISOString(),
    });
    return {};
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      const profile = seedProfiles.find((p) => p.id === prev.id);
      if (profile) {
        if (updates.name) profile.name = updates.name;
        if (updates.phone) profile.phone = updates.phone;
      }
      return updated;
    });
  }, []);

  const loginAs = useCallback(async (profileId: string) => {
    const profile = DEMO_PROFILES[profileId];
    if (!profile) return { error: 'Profile not found' };
    setUser(profile);
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut, updateUser, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
