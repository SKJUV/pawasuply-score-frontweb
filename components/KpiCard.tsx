interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  accent?: 'violet' | 'green' | 'red' | 'amber' | 'default';
}

const accentStyles = {
  violet:  { card: 'border-violet-100 bg-white',    icon: 'bg-violet-50 text-violet-600',   value: 'text-violet-700' },
  green:   { card: 'border-emerald-100 bg-white',   icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700' },
  red:     { card: 'border-red-100 bg-white',        icon: 'bg-red-50 text-red-600',         value: 'text-red-700' },
  amber:   { card: 'border-amber-100 bg-white',      icon: 'bg-amber-50 text-amber-600',     value: 'text-amber-700' },
  default: { card: 'border-zinc-100 bg-white',       icon: 'bg-zinc-50 text-zinc-500',       value: 'text-zinc-800' },
};

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = 'default',
}: KpiCardProps) {
  const s = accentStyles[accent];
  return (
    <div className={`card flex items-start gap-4 p-5 transition-all hover:shadow-md hover:shadow-violet-100/60 ${s.card}`}>
      {icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${s.icon}`}>
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
        {sub && (
          <p className="mt-1.5 truncate text-xs text-zinc-400">{sub}</p>
        )}
      </div>
    </div>
  );
}
