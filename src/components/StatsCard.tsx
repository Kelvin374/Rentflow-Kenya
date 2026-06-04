import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, variant = 'default' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          variant === 'primary' && 'bg-primary/10 text-primary',
          variant === 'success' && 'bg-success/10 text-success',
          variant === 'warning' && 'bg-warning/10 text-warning',
          variant === 'danger' && 'bg-danger/10 text-danger',
          variant === 'default' && 'bg-gray-100 text-gray-500',
        )}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={cn('font-medium', trendUp ? 'text-success' : 'text-danger')}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
