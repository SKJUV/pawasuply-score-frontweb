import type { ReactNode } from 'react';

interface KpiCardProps {
  label:   string;
  value:   string | number;
  sub?:    string;
  icon?:   ReactNode;
  accent?: 'violet' | 'green' | 'red' | 'amber' | 'default';
}

const styles = {
  violet:  { border: 'border-violet-100',  iconBg: 'bg-violet-50 text-violet-600',   value: 'text-violet-700' },
  green:   { border: 'border-emerald-100', iconBg: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700' },
  red:     { border: 'border-red-100',     iconBg: 'bg-red-50 text-red-500',         value: 'text-red-600' },
  amber:   { border: 'border-amber-100',   iconBg: 'bg-amber-50 text-amber-600',     value: 'text-amber-700' },
  default: { border: 'border-zinc-100',    iconBg: 'bg-zinc-50 text-zinc-400',       value: 'text-zinc-800' },
};

export default function KpiCard({ label, value, sub, icon, accent = 'default' }: KpiCardProps) {
  const s = styles[accent];
  return (
    <div className={`card flex items-start gap-4 p-5 transition-shadow hover:shadow-md hover:shadow-violet-100/60 ${s.border}`}>
      {icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        <p className={`mt-1 text-2xl font-bold leading-none ${s.value}`}>
          {value}
        </p>
        {sub && <p className="mt-1.5 truncate text-xs text-zinc-400">{sub}</p>}
      </div>
    </div>
  );
}
