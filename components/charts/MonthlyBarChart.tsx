'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { MonthlyStats } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function MonthlyBarChart({ monthly }: { monthly: MonthlyStats[] }) {
  const data = {
    labels: monthly.map((m) => m.month),
    datasets: [
      {
        label: 'Accordé',
        data: monthly.map((m) => parseFloat(m.total_accorde)),
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Remboursé',
        data: monthly.map((m) => parseFloat(m.total_rembourse)),
        backgroundColor: '#22c55e',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Défaut',
        data: monthly.map((m) => parseFloat(m.total_defaut)),
        backgroundColor: '#ef4444',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { boxWidth: 10, boxHeight: 10, borderRadius: 3, useBorderRadius: true, font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label} : ${Number(ctx.parsed.y).toLocaleString('fr-FR')} XAF`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 12 } } },
          y: {
            grid: { color: '#f5f3ff' },
            ticks: {
              font: { size: 11 },
              callback: (v) => `${Number(v).toLocaleString('fr-FR')}`,
            },
          },
        },
      }}
    />
  );
}
