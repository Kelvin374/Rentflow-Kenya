'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface PaymentMethodChartProps {
  data: { method: string; amount: number; count: number; color: string }[];
  title?: string;
}

export function PaymentMethodChart({ data, title = 'Payment Methods' }: PaymentMethodChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) return null;

  const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] leading-[28px] font-semibold text-on-surface">{title}</h3>
        <span className="text-[12px] leading-[16px] font-semibold text-on-surface-variant">{formatCurrency(totalAmount)} total</span>
      </div>

      <div className="flex h-4 rounded-full overflow-hidden mb-6 gap-0.5">
        {data.map((d, i) => (
          <div
            key={i}
            className="h-full transition-all duration-300 cursor-pointer relative"
            style={{
              width: `${(d.amount / totalAmount) * 100}%`,
              backgroundColor: d.color,
              opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1,
              borderRadius: i === 0 ? '8px 0 0 8px' : i === data.length - 1 ? '0 8px 8px 0' : '0',
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </div>

      <div className="space-y-3">
        {data.map((d, i) => {
          const isHovered = hoveredIndex === i;
          const percentage = ((d.amount / totalAmount) * 100).toFixed(1);
          return (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${isHovered ? 'bg-slate-50 shadow-sm' : ''}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <div>
                  <p className="text-[12px] leading-[16px] font-semibold text-on-surface capitalize">{d.method}</p>
                  <p className="text-[10px] text-on-surface-variant">{d.count} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] leading-[16px] font-semibold text-on-surface">{formatCurrency(d.amount)}</p>
                <p className="text-[10px] font-semibold" style={{ color: d.color }}>{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
