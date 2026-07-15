'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accentColor: string;
  glowFrom: string;
  glowTo: string;
  valueClassName?: string;
  iconBackgroundClassName?: string;
  variant?: 'soft' | 'executive';
}

export function DashboardMetricCard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  glowFrom,
  glowTo,
  valueClassName,
  iconBackgroundClassName,
  variant = 'soft',
}: DashboardMetricCardProps) {
  const style = {
    '--glow-color': accentColor,
    '--glow-color-via': glowFrom,
    '--glow-color-to': glowTo,
  } as CSSProperties;
  const isExecutive = variant === 'executive';

  return (
    <Card
      className={
        isExecutive
          ? 'group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]'
          : 'relative overflow-hidden rounded-lg border border-r-0 bg-gradient-to-t from-background to-muted transition-all duration-200 hover:shadow-lg group'
      }
      style={style}
    >
      {isExecutive ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-[var(--glow-color)] opacity-90" />
          <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(135deg,var(--glow-color-via),transparent_42%)] opacity-60" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent from-40% via-[var(--glow-color-via)] to-[var(--glow-color-to)] via-70% z-10 pointer-events-none" />
          <div className="absolute w-[5px] h-[60%] bg-[var(--glow-color)] right-0 top-1/2 -translate-y-1/2 rounded-l shadow-[-2px_0_10px_var(--glow-color)] group-hover:translate-x-full transition-all duration-200 z-20" />
        </>
      )}
      <CardContent className={`${isExecutive ? 'p-5' : 'pt-6'} relative z-30`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${isExecutive ? 'text-[13px] font-medium text-slate-500' : 'text-sm text-gray-600'}`}>
              {title}
            </p>
            <p className={`${isExecutive ? 'mt-2 text-3xl font-semibold text-slate-950' : 'text-3xl font-bold mt-1'} ${valueClassName ?? ''}`.trim()}>{value}</p>
            {subtitle ? <p className={`${isExecutive ? 'mt-1 text-xs text-slate-500' : 'text-xs text-gray-500 mt-1'}`}>{subtitle}</p> : null}
          </div>
          <div
            className={`${isExecutive ? 'h-10 w-10 rounded-md ring-1 ring-slate-200' : 'w-12 h-12 rounded-lg'} flex items-center justify-center ${iconBackgroundClassName ?? 'bg-white/80'}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
