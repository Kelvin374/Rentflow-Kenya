'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useSidebar } from '@/components/SidebarContext';

const navItems = [
  { href: '/tenant/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/tenant/properties', label: 'Properties', icon: 'domain' },
  { href: '/tenant/payments', label: 'Payments', icon: 'payments' },
  { href: '/tenant/maintenance', label: 'Maintenance', icon: 'build' },
];

function TenantNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      <Link href="/tenant/dashboard" className="flex items-center gap-4 px-6 h-20 overflow-hidden" onClick={onNavigate}>
        <img src="/logo.png" alt="RentFlow" className="w-8 h-8 rounded-lg object-contain shrink-0" />
        <span className="text-primary font-black text-[24px] leading-[32px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap md:group-hover:opacity-100">RentFlow</span>
      </Link>

      <nav className="flex-1 flex flex-col gap-2 p-4 scrollbar-hide overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-4 rounded-lg p-2 min-h-[48px] transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-secondary-container'
              )}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              <span className="font-semibold text-sm opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-auto border-t border-outline-variant pt-4 flex flex-col gap-2">
          <Link
            href="/settings"
            onClick={onNavigate}
            className="flex items-center gap-4 text-on-surface-variant hover:bg-secondary-container rounded-lg p-2 min-h-[48px] transition-all"
          >
            <span className="material-symbols-outlined shrink-0">settings</span>
            <span className="font-semibold text-sm opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-error hover:bg-error-container rounded-lg p-2 min-h-[48px] transition-all w-full text-left"
          >
            <span className="material-symbols-outlined shrink-0">logout</span>
            <span className="font-semibold text-sm opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export function TenantSidebar() {
  const { mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-full w-20 bg-surface-container-low border-r border-outline-variant transition-all duration-300 hover:w-64 group z-50">
        <TenantNav />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={closeMobile} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-surface-container-low flex flex-col p-4 gap-2 shadow-xl md:hidden animate-in slide-in-from-left duration-300">
            <button onClick={closeMobile} className="absolute top-4 right-4 p-2 hover:bg-surface-container-high rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="group">
              <TenantNav onNavigate={closeMobile} />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
