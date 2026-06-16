interface SectionHeaderProps {
  title: string;
  sub?: string;
  right?: React.ReactNode;
}

export default function SectionHeader({ title, sub, right }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-violet-900">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-zinc-400">{sub}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
