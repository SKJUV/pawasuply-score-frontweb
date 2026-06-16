'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { CategoryCount } from '@/lib/types';
import { CATEGORY_COLOR } from '@/lib/format';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart({ categories }: { categories: CategoryCount[] }) {
  const total = categories.reduce((s, c) => s + parseInt(c.count), 0);

  const data = {
    labels: categories.map((c) => `${c.category} (${c.count})`),
    datasets: [
      {
        data: categories.map((c) => parseInt(c.count)),
        backgroundColor: categories.map((c) => CATEGORY_COLOR[c.category] ?? '#a78bfa'),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-48 w-48">
        <Doughnut
          data={data}
          options={{
            cutout: '68%',
            plugins: { legend: { display: false } },
          }}
        />
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-violet-800">{total}</p>
          <p className="text-xs text-zinc-400">boutiquiers</p>
        </div>
      </div>
      {/* Custom legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((c) => (
          <div key={c.category} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: CATEGORY_COLOR[c.category] ?? '#a78bfa' }}
            />
            <span className="text-xs text-zinc-500">
              {c.category}{' '}
              <span className="font-semibold text-zinc-700">{c.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
