import { CATEGORY_BG } from '@/lib/format';

export default function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_BG[category] ?? 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {category}
    </span>
  );
}
