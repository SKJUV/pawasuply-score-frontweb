const TZ = 'Africa/Douala';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { timeZone: TZ });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { timeZone: TZ });
}

export function formatAmount(amount: string | number): string {
  return Number(amount).toLocaleString('fr-FR') + ' XAF';
}

// Couleurs primaires par catégorie
export const CATEGORY_COLOR: Record<string, string> = {
  Observation: '#ef4444',
  Standard:    '#f97316',
  Or:          '#eab308',
  Platine:     '#22c55e',
};

// Tailwind classes badge
export const CATEGORY_BG: Record<string, string> = {
  Observation: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  Standard:    'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  Or:          'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  Platine:     'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
};

// Statut crédit → style
export const CREDIT_STATUS_STYLE: Record<string, string> = {
  ACTIVE:           'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
  PENDING_DELIVERY: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  REPAID:           'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  DEFAULT:          'bg-red-100 text-red-700 ring-1 ring-red-200',
  CANCELLED:        'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200',
};
