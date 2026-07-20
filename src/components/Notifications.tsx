'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { fetchPayments, fetchMaintenance } from '@/lib/supabase-api';

export interface Notification {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'maintenance_update' | 'lease_expiry';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    const newNotifications: Notification[] = [];

    try {
      if (user.role === 'landlord') {
        const [payments, maintenance] = await Promise.all([
          fetchPayments(),
          fetchMaintenance(),
        ]);

        const pendingPayments = payments.filter((p) => p.status === 'pending');
        const overduePayments = payments.filter((p) => p.status === 'overdue');
        const activeMaintenance = maintenance.filter((m) => m.status === 'submitted' || m.status === 'in_progress');

        pendingPayments.slice(0, 3).forEach((p) => {
          newNotifications.push({
            id: `payment-pending-${p.id}`,
            type: 'payment_due',
            title: 'Payment Pending',
            message: `${p.tenantName} has a pending payment of KSh ${p.amount.toLocaleString()} for ${p.unitNumber}`,
            timestamp: p.date,
            read: false,
            href: '/payments',
          });
        });

        overduePayments.slice(0, 3).forEach((p) => {
          newNotifications.push({
            id: `payment-overdue-${p.id}`,
            type: 'payment_overdue',
            title: 'Payment Overdue',
            message: `${p.tenantName}'s payment of KSh ${p.amount.toLocaleString()} for ${p.unitNumber} is overdue`,
            timestamp: p.date,
            read: false,
            href: '/payments',
          });
        });

        activeMaintenance.slice(0, 3).forEach((m) => {
          newNotifications.push({
            id: `maintenance-${m.id}`,
            type: 'maintenance_update',
            title: m.status === 'submitted' ? 'New Maintenance Request' : 'Maintenance In Progress',
            message: `${m.category} issue at ${m.propertyName} ${m.unitNumber ? `• ${m.unitNumber}` : ''}`,
            timestamp: m.createdAt,
            read: false,
            href: '/maintenance',
          });
        });
      } else if (user.role === 'tenant') {
        const payments = await fetchPayments();
        const myPayments = payments.filter((p) => p.tenantName === user.name);

        const pendingPayments = myPayments.filter((p) => p.status === 'pending');
        const overduePayments = myPayments.filter((p) => p.status === 'overdue');

        pendingPayments.forEach((p) => {
          newNotifications.push({
            id: `tenant-payment-${p.id}`,
            type: 'payment_due',
            title: 'Rent Payment Due',
            message: `Your rent payment of KSh ${p.amount.toLocaleString()} is pending`,
            timestamp: p.date,
            read: false,
            href: '/tenant/payments',
          });
        });

        overduePayments.forEach((p) => {
          newNotifications.push({
            id: `tenant-overdue-${p.id}`,
            type: 'payment_overdue',
            title: 'Rent Payment Overdue',
            message: `Your rent payment of KSh ${p.amount.toLocaleString()} is overdue`,
            timestamp: p.date,
            read: false,
            href: '/tenant/payments',
          });
        });
      }
    } catch {
      // Notifications are best-effort, don't break the app
    }

    setNotifications(newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [user]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
