'use client';

import { useState } from 'react';

interface OccupancyAreaChartProps {
  data: { area: string; occupied: number; vacant: number; rate: number }[];
  title?: string;
}

export function OccupancyAreaChart({ data, title = 'Occupancy by Area' }: OccupancyAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) return null;

  const getColor = (rate: number) => {
    if (rate >= 90) return { bar: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    if (rate >= 70) return { bar: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { bar: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  };

  return (
    <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] leading-[28px] font-semibold text-on-surface">{title}</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[10px] font-semibold text-on-surface-variant">&gt;90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-[10px] font-semibold text-on-surface-variant">70-90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-[10px] font-semibold text-on-surface-variant">&lt;70%</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((item, i) => {
          const colors = getColor(item.rate);
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={i}
              className={`p-3 rounded-xl transition-all cursor-pointer ${isHovered ? 'bg-slate-50 shadow-sm' : ''}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] leading-[16px] font-semibold text-on-surface">{item.area}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-on-surface-variant">{item.occupied} occupied</span>
                  <span className="text-[11px] text-on-surface-variant">{item.vacant} vacant</span>
                  <span className="text-[12px] font-bold" style={{ color: colors.bar }}>{item.rate}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.rate}%`,
                    backgroundColor: colors.bar,
                    boxShadow: isHovered ? `0 0 8px ${colors.bar}40` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
