import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  duration?: number;
  decimals?: number;
  description?: string;
  accentColor?: string;
}

const useCountUp = (end: number, duration: number, decimals: number = 0) => {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = easeOutQuart * end;
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration]);

  return count.toFixed(decimals);
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  delta,
  deltaLabel = 'vs last week',
  duration = 2000,
  decimals = 0,
  description,
  accentColor = '#10b981',
}) => {
  const animatedValue = useCountUp(value, duration, decimals);
  const isPositive = (delta ?? 0) >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-xl group cursor-pointer"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        padding: '1.75rem 1.5rem',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = ''
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
      }}
    >
      {/* Hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${accentColor}08, transparent)` }}
      />

      <div className="relative" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

        {/* Row 1: Title + delta badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h3
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>

          {delta !== undefined && (
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                flexShrink: 0,
                fontSize: '0.6875rem',
                ...(isPositive
                  ? { color: 'var(--success)', background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.20)' }
                  : { color: 'var(--danger)', background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.20)' }
                ),
              }}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? '+' : ''}{delta}%
            </span>
          )}
        </div>

        {/* Row 2: Description (optional, capped at 2 lines) */}
        {description && (
          <p
            style={{
              fontSize: '0.625rem',
              color: 'var(--text-tertiary)',
              margin: 0,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}

        {/* Row 3: Big number */}
        <div style={{ margin: '0.25rem 0' }}>
          <span
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {prefix}{Number(animatedValue).toLocaleString()}{suffix}
          </span>
        </div>

        {/* Row 4: Delta label with pulse dot */}
        {deltaLabel && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.6875rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <div
              className="animate-pulse"
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: accentColor,
                flexShrink: 0,
              }}
            />
            <span>{deltaLabel}</span>
          </div>
        )}


      </div>
    </div>
  );
};

export default MetricCard;
