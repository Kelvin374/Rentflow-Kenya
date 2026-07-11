'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/properties', label: 'Properties', icon: 'domain' },
  { href: '/units', label: 'Units', icon: 'meeting_room' },
  { href: '/tenants', label: 'Tenants', icon: 'group' },
  { href: '/leases', label: 'Applications', icon: 'description' },
  { href: '/payments', label: 'Payments', icon: 'payments' },
  { href: '/maintenance', label: 'Maintenance', icon: 'build' },
  { href: '/reports', label: 'Reports', icon: 'assessment' },
];

const bottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex h-screen w-64 sticky left-0 top-0 flex-col p-4 gap-2 bg-surface-container-low border-r border-outline-variant transition-all duration-300">
      <div className="mb-8 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <h1 className="text-[24px] leading-[32px] font-bold text-primary">RentFlow</h1>
            <p className="text-[14px] leading-[20px] text-on-surface-variant">Landlord Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 flex-grow overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 rounded-lg px-4 py-2 transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary-container scale-[0.98]'
                  : 'text-on-surface-variant hover:bg-secondary-container'
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-4 rounded-lg px-4 py-2 transition-all',
              'text-on-surface-variant hover:bg-secondary-container'
            )}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 rounded-lg px-4 py-2 transition-all text-error hover:bg-error-container"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
