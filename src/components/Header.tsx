'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useSidebar } from '@/components/SidebarContext';
import { NotificationBell } from '@/components/NotificationBell';
import { Avatar } from '@/components/Avatar';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const { openMobile } = useSidebar();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-surface sticky top-0 z-40 w-full h-16 border-b border-outline-variant">
      <div className="flex justify-between items-center w-full h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button onClick={openMobile} className="md:hidden p-2 hover:bg-surface-container-high rounded-full">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="text-[20px] md:text-[24px] leading-[32px] font-semibold text-primary font-bold">{title}</h2>
        </div>

        <div className="flex-grow max-w-xl mx-8 hidden lg:block">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search properties, tenants, or invoices..."
              className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 text-base transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell />
          <button className="hover:bg-surface-container-high p-2 rounded-full transition-transform active:scale-95 hidden md:block">
            <span className="material-symbols-outlined text-on-surface-variant">apps</span>
          </button>
          <div className="h-8 w-px bg-outline-variant mx-1 md:mx-2 hidden md:block"></div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 cursor-pointer hover:bg-surface-container-high p-1 pr-3 rounded-full transition-all"
            >
              <Avatar src={user?.avatar} name={user?.name || 'AU'} size="sm" />
              <span className="hidden sm:inline font-semibold text-sm text-on-surface">{user?.name || ''}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
