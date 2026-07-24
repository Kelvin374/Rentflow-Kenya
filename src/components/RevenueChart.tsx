'use client';

import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { RevenueData } from '@/types';

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.amount));
  const total = data.reduce((s, d) => s + d.amount, 0);

  const trend = (() => {
    if (data.length < 2) return null;
    const current = data[data.length - 1].amount;
    const previous = data[data.length - 2].amount;
    if (previous === 0) return null;
    const pct = ((current - previous) / previous) * 100;
    return { value: pct, positive: pct >= 0 };
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
          <p className="text-sm text-gray-500">Monthly revenue overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg">Last 6 Months</button>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg">Year to Date</button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-gray-400">{formatCurrency(d.amount)}</span>
            <div
              className="w-full max-w-[40px] bg-gradient-to-t from-primary to-primary/60 rounded-t-md hover:from-primary-dark transition-all cursor-pointer"
              style={{ height: `${(d.amount / max) * 100}%` }}
            />
            <span className="text-[10px] font-medium text-gray-500">{d.month}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          {trend && (
            <>
              {trend.positive ? <TrendingUp size={16} className="text-success" /> : <TrendingUp size={16} className="text-red-500 rotate-180" />}
            </>
          )}
          <span className="font-medium text-gray-900">Total: {formatCurrency(total)}</span>
          {trend && (
            <span className={`text-xs ${trend.positive ? 'text-success' : 'text-red-500'}`}>
              {trend.positive ? '+' : ''}{trend.value.toFixed(1)}% vs previous
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
