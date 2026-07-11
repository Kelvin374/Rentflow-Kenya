'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface RevenueByPropertyProps {
  data: { name: string; revenue: number; color: string }[];
  title?: string;
}

export function RevenueByProperty({ data, title = 'Revenue by Property' }: RevenueByPropertyProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) return null;

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 80;
  const innerR = 55;

  const getArcPath = (startAngle: number, endAngle: number, outer: number, inner: number) => {
    const polarToCartesian = (angle: number, radius: number) => ({
      x: cx + radius * Math.cos((angle - 90) * (Math.PI / 180)),
      y: cy + radius * Math.sin((angle - 90) * (Math.PI / 180)),
    });

    const start = polarToCartesian(startAngle, outer);
    const end = polarToCartesian(endAngle, outer);
    const innerStart = polarToCartesian(endAngle, inner);
    const innerEnd = polarToCartesian(startAngle, inner);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${outer} ${outer} 0 ${largeArc} 1 ${end.x} ${end.y} L ${innerStart.x} ${innerStart.y} A ${inner} ${inner} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y} Z`;
  };

  let currentAngle = 0;
  const segments = data.map((d) => {
    const angle = (d.revenue / totalRevenue) * 360;
    const start = currentAngle;
    currentAngle += angle;
    return { ...d, startAngle: start, endAngle: start + angle, percentage: ((d.revenue / totalRevenue) * 100).toFixed(1) };
  });

  return (
    <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] leading-[28px] font-semibold text-on-surface">{title}</h3>
      </div>
      <div className="flex items-center gap-8">
        <div className="relative flex-shrink-0">
          <svg viewBox={`0 0 ${size} ${size}`} width="200" height="200">
            {segments.map((seg, i) => {
              const isHovered = hoveredIndex === i;
              const midAngle = (seg.startAngle + seg.endAngle) / 2;
              const expandR = isHovered ? 3 : 0;
              const oR = outerR + expandR;
              const iR = innerR - expandR * 0.5;

              return (
                <path
                  key={i}
                  d={getArcPath(seg.startAngle + 0.5, seg.endAngle - 0.5, oR, iR)}
                  fill={seg.color}
                  stroke="white"
                  strokeWidth="1.5"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none' }}
                />
              );
            })}
            <text x={cx} y={cy - 3} textAnchor="middle" fill="#0b1c30" fontSize="12" fontWeight="700" fontFamily="Inter">
              {formatCurrency(totalRevenue)}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="#94a3b8" fontSize="5" fontFamily="Inter">
              Total Revenue
            </text>
          </svg>
        </div>
        <div className="flex-1 space-y-3">
          {segments.map((seg, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${isHovered ? 'bg-slate-50' : ''}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-[12px] leading-[16px] font-medium text-on-surface">{seg.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] leading-[16px] font-semibold text-on-surface">{formatCurrency(seg.revenue)}</span>
                  <span className="text-[10px] leading-[14px] font-semibold text-on-surface-variant w-10 text-right">{seg.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
