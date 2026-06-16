'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { NplEvolutionPoint } from '@/lib/types';
import { formatDate } from '@/lib/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function NplLineChart({ nplEvolution }: { nplEvolution: NplEvolutionPoint[] }) {
  const labels = nplEvolution.map((p) => formatDate(p.day));
  const nplRates = nplEvolution.map((p) => {
    const obs = parseInt(p.observation_count);
    const total = parseInt(p.total_count);
    return total > 0 ? parseFloat(((obs / total) * 100).toFixed(2)) : 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Taux NPL (%)',
        data: nplRates,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` NPL : ${ctx.parsed.y}%` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: {
            beginAtZero: true,
            grid: { color: '#f5f3ff' },
            ticks: { font: { size: 11 }, callback: (v) => `${v}%` },
          },
        },
      }}
    />
  );
}
