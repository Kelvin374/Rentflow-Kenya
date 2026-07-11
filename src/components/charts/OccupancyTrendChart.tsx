'use client';

import { useState } from 'react';

interface OccupancyTrendChartProps {
  data: { month: string; rate: number }[];
  title?: string;
}

export function OccupancyTrendChart({ data, title = 'Occupancy Trend' }: OccupancyTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) return null;

  const W = 600;
  const H = 240;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const getPoint = (index: number, value: number) => {
    const x = padL + (index / Math.max(data.length - 1, 1)) * chartW;
    const y = padT + chartH - (value / 100) * chartH;
    return { x, y };
  };

  const points = data.map((d, i) => getPoint(i, d.rate));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${padL + chartW} ${padT + chartH} L ${padL} ${padT + chartH} Z`;

  const getColor = (rate: number) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[18px] leading-[28px] font-semibold text-on-surface">{title}</h3>
        <span className="text-[11px] leading-[14px] font-semibold text-on-surface-variant uppercase">Last 6 Months</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((v) => {
          const y = padT + chartH - (v / 100) * chartH;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth={v === 0 ? 1 : 0.5} strokeDasharray={v === 0 ? '0' : '4,4'} />
              <text x={padL - 6} y={y + 3.5} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="Inter">{v}%</text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#occupancyGradient)" />
        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <line x1={p.x} y1={padT} x2={p.x} y2={padT + chartH} stroke="transparent" strokeWidth="16" />
              {isHovered && (
                <>
                  <line x1={p.x} y1={padT} x2={p.x} y2={padT + chartH} stroke="#10b981" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.4" />
                  <rect x={p.x - 22} y={p.y - 28} width="44" height="20" fill="#0b1c30" rx="4" opacity="0.92" />
                  <polygon
                    points={`${p.x},${p.y - 8} ${p.x - 5},${p.y - 3} ${p.x + 5},${p.y - 3}`}
                    fill="#0b1c30" opacity="0.92"
                  />
                  <text x={p.x} y={p.y - 15} textAnchor="middle" fill="white" fontSize="10.5" fontFamily="Inter" fontWeight="600">
                    {data[i].rate}%
                  </text>
                </>
              )}
              <circle
                cx={p.x} cy={p.y} r={isHovered ? 5 : 3.5}
                fill="white" stroke={getColor(data[i].rate)} strokeWidth="2"
                className="transition-all duration-200"
              />
            </g>
          );
        })}
      </svg>

      <div className="flex justify-between mt-2 px-[40px]">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-on-surface-variant font-medium">{d.month}</span>
        ))}
      </div>
    </div>
  );
}
