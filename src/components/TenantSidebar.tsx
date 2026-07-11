'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/tenant/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/listing/1', label: 'Properties', icon: 'domain' },
  { href: '/tenant/applications', label: 'Applications', icon: 'description' },
  { href: '/tenant/payments', label: 'Payments', icon: 'payments' },
  { href: '/tenant/maintenance', label: 'Maintenance', icon: 'build' },
];

export function TenantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col h-full w-20 bg-surface-container-low border-r border-outline-variant transition-all duration-300 hover:w-64 group z-50">
      <Link href="/tenant/dashboard" className="flex items-center gap-4 px-6 h-20 overflow-hidden">
        <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain shrink-0" />
        <span className="text-primary font-black text-[24px] leading-[32px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">RentFlow</span>
      </Link>

      <nav className="flex-1 flex flex-col gap-2 p-4 scrollbar-hide overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 rounded-lg p-2 min-h-[48px] transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-secondary-container'
              )}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              <span className="font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-auto border-t border-outline-variant pt-4 flex flex-col gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-4 text-on-surface-variant hover:bg-secondary-container rounded-lg p-2 min-h-[48px] transition-all"
          >
            <span className="material-symbols-outlined shrink-0">settings</span>
            <span className="font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-error hover:bg-error-container rounded-lg p-2 min-h-[48px] transition-all w-full text-left"
          >
            <span className="material-symbols-outlined shrink-0">logout</span>
            <span className="font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
