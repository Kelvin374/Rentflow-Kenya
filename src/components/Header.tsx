'use client';

import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
              <span>Portfolio</span>
              <span className="text-gray-300">chevron_right</span>
              <span>{subtitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-56 pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {user ? getInitials(user.name) : 'AU'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Portfolio Owner'}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
