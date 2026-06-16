'use client';

import Link from 'next/link';
import CategoryBadge from './CategoryBadge';
import { IconArrowRight } from './icons';
import { formatAmount } from '@/lib/format';
import type { BankBoutiquier } from '@/lib/types';

export default function ScoreTable({ boutiquiers }: { boutiquiers: BankBoutiquier[] }) {
  if (boutiquiers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-300">
        <IconArrowRight size={32} className="opacity-30" />
        <p className="text-sm">Aucun boutiquier trouvé.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-violet-50">
            {['Boutiquier', 'Téléphone', 'Score', 'Catégorie', 'Limite', 'Encours actif', 'Crédits', ''].map(
              (h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 ${
                    h === 'Score' || h === 'Limite' || h === 'Encours actif'
                      ? 'text-right'
                      : h === 'Crédits' || h === ''
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-violet-50">
          {boutiquiers.map((b) => {
            const score = parseFloat(b.current_score);
            const scoreColor =
              score >= 75 ? 'text-emerald-600' :
              score >= 50 ? 'text-yellow-600'  :
              score >= 25 ? 'text-orange-500'  : 'text-red-500';

            return (
              <tr key={b.id} className="table-row-hover transition-colors">
                <td className="px-4 py-3.5 font-semibold text-violet-900">{b.name}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-zinc-400">{b.phone_number}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`text-base font-bold tabular-nums ${scoreColor}`}>
                    {score.toFixed(1)}
                  </span>
                  <span className="ml-0.5 text-[11px] text-zinc-300">/100</span>
                </td>
                <td className="px-4 py-3.5">
                  <CategoryBadge category={b.category} />
                </td>
                <td className="px-4 py-3.5 text-right text-xs text-zinc-500 tabular-nums">
                  {formatAmount(b.credit_limit)}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums">
                  {parseFloat(b.active_encours) > 0 ? (
                    <span className="font-semibold text-violet-700">
                      {formatAmount(b.active_encours)}
                    </span>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  {parseInt(b.active_credits_count) > 0 ? (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                      {b.active_credits_count}
                    </span>
                  ) : (
                    <span className="text-zinc-300">0</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Link
                    href={`/boutiquier/${b.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700"
                  >
                    Voir
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
