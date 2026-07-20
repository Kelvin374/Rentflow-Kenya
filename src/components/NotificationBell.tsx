'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications, type Notification } from '@/components/Notifications';

const typeIcons: Record<string, string> = {
  payment_due: 'payments',
  payment_overdue: 'warning',
  maintenance_update: 'build',
  lease_expiry: 'description',
};

const typeColors: Record<string, string> = {
  payment_due: 'bg-primary/10 text-primary',
  payment_overdue: 'bg-error/10 text-error',
  maintenance_update: 'bg-tertiary/10 text-tertiary',
  lease_expiry: 'bg-secondary/10 text-secondary',
};

function formatTimestamp(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="hover:bg-surface-container-high p-2 rounded-full transition-transform active:scale-95 relative"
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-error text-white text-[10px] font-bold rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-outline-variant">
            <h3 className="font-semibold text-sm text-on-surface">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-outline text-3xl mb-2 block">notifications_off</span>
                <p className="text-sm text-on-surface-variant">No notifications</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-outline-variant">
              <Link
                href={notifications[0]?.href || '/dashboard'}
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-primary font-medium py-2 hover:bg-surface-container-low rounded-lg transition-colors"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  return (
    <div
      className={`flex gap-3 p-4 hover:bg-surface-container-low cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
      onClick={() => onRead(notification.id)}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[notification.type]}`}>
        <span className="material-symbols-outlined text-sm">{typeIcons[notification.type]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-on-surface truncate">{notification.title}</p>
          {!notification.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-on-surface-variant mt-1">{formatTimestamp(notification.timestamp)}</p>
      </div>
    </div>
  );
}
