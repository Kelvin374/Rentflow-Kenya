'use client';

interface GaugeCardProps {
  label: string;
  value: number;
  max?: number;
  suffix?: string;
  color?: string;
  subtitle?: string;
}

export function GaugeCard({ label, value, max = 100, suffix = '%', color = '#2563eb', subtitle }: GaugeCardProps) {
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const dashOffset = circumference * (1 - percentage);

  const getGradientId = () => `gauge-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="glass p-5 rounded-[18px] shadow-sm border-white/50 flex flex-col items-center">
      <span className="text-on-surface-variant text-[11px] leading-[14px] tracking-[0.03em] font-semibold uppercase mb-3">{label}</span>
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={`url(#${getGradientId()})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[18px] leading-[24px] font-bold text-on-surface">{value}{suffix}</span>
        </div>
      </div>
      {subtitle && (
        <p className="text-[11px] text-on-surface-variant mt-2 text-center">{subtitle}</p>
      )}
    </div>
  );
}
