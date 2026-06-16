'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/bank',       label: 'Banque',      icon: '🏦' },
  { href: '/grossiste',  label: 'Grossiste',   icon: '🏪' },
  { href: '/simulator',  label: 'Simulateur',  icon: '⚡' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/95 backdrop-blur-md shadow-sm shadow-violet-100/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 shadow-sm shadow-violet-300">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold text-violet-900">PawaSupply</span>
            <span className="ml-1 text-sm font-bold text-violet-400">Score</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-300'
                    : 'text-zinc-500 hover:bg-violet-50 hover:text-violet-700'
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Status badge */}
        <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-violet-500" />
          Temps réel actif
        </div>
      </div>
    </header>
  );
}
