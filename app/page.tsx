import Link from 'next/link';
import { IconBank, IconStore, IconBolt, IconArrowRight, IconSearch } from '@/components/icons';

const cards = [
  {
    href: '/bank',
    Icon: IconBank,
    title: 'Dashboard Banque',
    description: 'KPIs globaux, répartition des catégories, évolution NPL et tableau des boutiquiers.',
    accentBorder: 'hover:border-violet-300',
    iconStyle: 'bg-violet-50 text-violet-600',
  },
  {
    href: '/grossiste',
    Icon: IconStore,
    title: 'Dashboard Grossiste',
    description: 'Commandes livrées, commandes en attente, mises à jour automatiques Socket.io.',
    accentBorder: 'hover:border-emerald-300',
    iconStyle: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/simulator',
    Icon: IconBolt,
    title: 'Simulateur',
    description: 'Testez dépôts Mobile Money, payouts grossiste et remboursements en sandbox.',
    accentBorder: 'hover:border-amber-300',
    iconStyle: 'bg-amber-50 text-amber-600',
  },
];

const categories = [
  { name: 'Observation', range: '< 25',  limit: '0 XAF',        dot: 'bg-red-500' },
  { name: 'Standard',    range: '25–49', limit: '50 000 XAF',   dot: 'bg-orange-500' },
  { name: 'Or',          range: '50–74', limit: '100 000 XAF',  dot: 'bg-yellow-500' },
  { name: 'Platine',     range: '≥ 75',  limit: '250 000 XAF',  dot: 'bg-emerald-500' },
];

export default function HomePage() {
  return (
    <div className="space-y-10">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-bg px-8 py-12 text-white shadow-lg shadow-violet-300/30">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 left-0 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-200">
              Plateforme de scoring
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              PawaSupply Score
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-violet-100/90">
              Gestion du crédit stock Mobile Money pour les boutiquiers
              camerounais — MTN MoMo &amp; Orange Money.
            </p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Catégories', value: '4' },
              { label: 'Opérateurs', value: '2' },
              { label: 'Score max',  value: '100' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-violet-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module cards */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Modules
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map(({ href, Icon, title, description, accentBorder, iconStyle }) => (
            <Link
              key={href}
              href={href}
              className={`card group flex flex-col gap-4 border-2 p-5 transition-all duration-200 hover:shadow-md hover:shadow-violet-100/80 ${accentBorder}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-violet-900 group-hover:text-violet-700 transition-colors">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:text-violet-600 transition-colors">
                Ouvrir <IconArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search + categories */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Search */}
        <div className="card p-5">
          <p className="mb-1 text-sm font-bold text-violet-900">Recherche rapide</p>
          <p className="mb-4 text-xs text-zinc-400">Accédez directement au profil d'un boutiquier</p>
          <form action="/boutiquier" method="get" className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
              <input
                name="id"
                type="text"
                placeholder="UUID ou numéro de téléphone"
                className="w-full rounded-xl border border-violet-200 bg-violet-50/40 py-2.5 pl-9 pr-3 text-sm placeholder-zinc-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-300 hover:bg-violet-700 transition-colors"
            >
              Chercher
            </button>
          </form>
        </div>

        {/* Categories */}
        <div className="card p-5">
          <p className="mb-1 text-sm font-bold text-violet-900">Grille des catégories</p>
          <p className="mb-4 text-xs text-zinc-400">Seuils de score et limites de crédit</p>
          <div className="space-y-1.5">
            {categories.map(({ name, range, limit, dot }) => (
              <div
                key={name}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-violet-50 transition-colors"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                <span className="w-24 text-sm font-medium text-zinc-700">{name}</span>
                <span className="w-14 text-center text-xs tabular-nums text-zinc-400">{range}</span>
                <span className="ml-auto text-xs font-semibold tabular-nums text-zinc-600">{limit}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
