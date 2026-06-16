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
import type { ScoreHistoryPoint } from '@/lib/types';
import { formatDate, CATEGORY_COLOR } from '@/lib/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function ScoreLineChart({ history }: { history: ScoreHistoryPoint[] }) {
  const labels = history.map((h) => formatDate(h.recorded_at));
  const scores = history.map((h) => parseFloat(h.score));
  const pointColors = history.map((h) => CATEGORY_COLOR[h.category] ?? '#8b5cf6');

  const data = {
    labels,
    datasets: [
      {
        label: 'Score',
        data: scores,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.06)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
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
            callbacks: {
              label: (ctx) => ` Score : ${ctx.parsed.y}`,
              afterLabel: (ctx) => {
                const h = history[ctx.dataIndex];
                return `  ${h.category}  ·  Limite : ${Number(h.credit_limit).toLocaleString('fr-FR')} XAF`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, maxRotation: 45 },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: '#f5f3ff' },
            ticks: { font: { size: 11 }, stepSize: 25 },
          },
        },
      }}
    />
  );
}
