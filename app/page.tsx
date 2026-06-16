import Link from 'next/link';

const cards = [
  {
    href: '/bank',
    icon: '🏦',
    title: 'Dashboard Banque',
    description: 'KPIs globaux, répartition des catégories, évolution NPL et tableau complet des boutiquiers.',
    accentBorder: 'hover:border-violet-400',
    accentIcon: 'bg-violet-50 text-violet-600',
    tag: 'Temps réel',
    tagStyle: 'bg-violet-100 text-violet-700',
  },
  {
    href: '/grossiste',
    icon: '🏪',
    title: 'Dashboard Grossiste',
    description: 'Commandes livrées, commandes en attente de livraison, mises à jour automatiques via Socket.io.',
    accentBorder: 'hover:border-emerald-400',
    accentIcon: 'bg-emerald-50 text-emerald-600',
    tag: 'Commandes',
    tagStyle: 'bg-emerald-100 text-emerald-700',
  },
  {
    href: '/simulator',
    icon: '⚡',
    title: 'Simulateur',
    description: 'Testez dépôts Mobile Money, payouts grossiste et remboursements sur les boutiquiers de démo.',
    accentBorder: 'hover:border-amber-400',
    accentIcon: 'bg-amber-50 text-amber-600',
    tag: 'Sandbox',
    tagStyle: 'bg-amber-100 text-amber-700',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-bg px-8 py-14 text-white shadow-xl shadow-violet-300/40">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
              Plateforme en direct · Africa/Douala UTC+1
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              PawaSupply <span className="text-violet-200">Score</span>
            </h1>
            <p className="mt-2 max-w-lg text-base text-violet-100/90">
              Scoring et gestion du crédit stock Mobile Money pour les boutiquiers
              camerounais — MTN MoMo & Orange Money.
            </p>
          </div>

          {/* Quick stats placeholder */}
          <div className="flex gap-4">
            {[
              { label: 'Catégories', value: '4' },
              { label: 'Opérateurs', value: '2' },
              { label: 'Score max', value: '100' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-violet-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation cards */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Modules
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {cards.map(({ href, icon, title, description, accentBorder, accentIcon, tag, tagStyle }) => (
            <Link
              key={href}
              href={href}
              className={`group card flex flex-col gap-5 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-violet-100/80 ${accentBorder} border-2`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${accentIcon}`}>
                  {icon}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagStyle}`}>
                  {tag}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-violet-900 group-hover:text-violet-700 transition-colors">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{description}</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-violet-500 group-hover:gap-2 transition-all">
                Ouvrir
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search + Category reference */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Quick search */}
        <div className="card p-6">
          <h2 className="mb-1 text-sm font-bold text-violet-900">Recherche rapide</h2>
          <p className="mb-4 text-xs text-zinc-400">Accédez directement au profil d'un boutiquier</p>
          <form action="/boutiquier" method="get" className="flex gap-2">
            <input
              name="id"
              type="text"
              placeholder="UUID ou numéro de téléphone"
              className="flex-1 rounded-xl border border-violet-200 bg-violet-50/50 px-3.5 py-2.5 text-sm placeholder-zinc-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-300 hover:bg-violet-700 transition-colors"
            >
              Chercher
            </button>
          </form>
        </div>

        {/* Category reference */}
        <div className="card p-6">
          <h2 className="mb-1 text-sm font-bold text-violet-900">Grille des catégories</h2>
          <p className="mb-4 text-xs text-zinc-400">Seuils de score et limites de crédit</p>
          <div className="space-y-2">
            {[
              { cat: 'Observation', range: '< 25',  limit: '0 XAF',       color: 'bg-red-500' },
              { cat: 'Standard',    range: '25–49', limit: '50 000 XAF',  color: 'bg-orange-500' },
              { cat: 'Or',          range: '50–74', limit: '100 000 XAF', color: 'bg-yellow-500' },
              { cat: 'Platine',     range: '≥ 75',  limit: '250 000 XAF', color: 'bg-emerald-500' },
            ].map(({ cat, range, limit, color }) => (
              <div key={cat} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-violet-50 transition-colors">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                <span className="w-24 text-sm font-medium text-zinc-700">{cat}</span>
                <span className="w-16 text-center text-xs text-zinc-400">{range}</span>
                <span className="ml-auto text-xs font-semibold text-zinc-600">{limit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
