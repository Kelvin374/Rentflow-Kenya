'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  data: { month: string; actual: number; projected: number }[];
  title?: string;
}

export function RevenueChart({ data, title = 'Monthly Revenue' }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) return null;

  const W = 600;
  const H = 260;
  const padL = 50;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...data.flatMap((d) => [d.actual, d.projected]));
  const niceMax = Math.ceil(maxVal / 100000) * 100000 || 100000;

  const barGroupW = chartW / data.length;
  const barW = barGroupW * 0.28;
  const barGap = barGroupW * 0.06;

  const gridSteps = 5;

  return (
    <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[18px] leading-[28px] font-semibold text-on-surface">{title}</h3>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[11px] leading-[14px] font-semibold text-on-surface-variant uppercase">Actual</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="w-3 h-3 rounded-full bg-primary/20" />
            <span className="text-[11px] leading-[14px] font-semibold text-on-surface-variant uppercase">Projected</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridSteps + 1 }, (_, i) => {
          const ratio = i / gridSteps;
          const y = padT + chartH - ratio * chartH;
          const val = niceMax * ratio;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth={ratio === 0 ? 1 : 0.5} strokeDasharray={ratio === 0 ? '0' : '4,4'} />
              <text x={padL - 6} y={y + 3.5} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="Inter">
                {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const groupX = padL + i * barGroupW + barGroupW * 0.15;
          const projectedH = (d.projected / niceMax) * chartH;
          const actualH = (d.actual / niceMax) * chartH;
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={groupX + barW + barGap} y={padT + chartH - projectedH}
                width={barW} height={projectedH}
                fill="url(#projectedGrad)" rx="3"
              />
              <rect
                x={groupX} y={padT + chartH - actualH}
                width={barW} height={actualH}
                fill="url(#actualGrad)" rx="3"
                style={{ opacity: isHovered ? 0.8 : 1, transition: 'opacity 0.2s' }}
              />
              <text
                x={groupX + barW + barGap / 2} y={H - 8}
                textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Inter" fontWeight="500"
              >
                {d.month}
              </text>

              {isHovered && (
                <g>
                  <rect
                    x={groupX - 8} y={padT + chartH - Math.max(actualH, projectedH) - 36}
                    width={barW * 2 + barGap + 16} height="30"
                    fill="#0b1c30" rx="6" opacity="0.92"
                  />
                  <polygon
                    points={`${groupX + barW + barGap / 2},${padT + chartH - Math.max(actualH, projectedH) - 6} ${groupX + barW + barGap / 2 - 5},${padT + chartH - Math.max(actualH, projectedH) - 1} ${groupX + barW + barGap / 2 + 5},${padT + chartH - Math.max(actualH, projectedH) - 1}`}
                    fill="#0b1c30" opacity="0.92"
                  />
                  <text
                    x={groupX + barW / 2} y={padT + chartH - Math.max(actualH, projectedH) - 22}
                    textAnchor="middle" fill="white" fontSize="10.5" fontFamily="Inter" fontWeight="600"
                  >
                    Actual: {formatCurrency(d.actual)}
                  </text>
                  <text
                    x={groupX + barW + barGap + barW / 2} y={padT + chartH - Math.max(actualH, projectedH) - 22}
                    textAnchor="middle" fill="#a5b4fc" fontSize="9.5" fontFamily="Inter"
                  >
                    Projected: {formatCurrency(d.projected)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
