'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBank, IconStore, IconBolt, IconLive } from './icons';

const links = [
  { href: '/bank',      label: 'Banque',     Icon: IconBank },
  { href: '/grossiste', label: 'Grossiste',  Icon: IconStore },
  { href: '/simulator', label: 'Simulateur', Icon: IconBolt },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/95 backdrop-blur-md shadow-sm shadow-violet-100/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-sm shadow-violet-300">
            <span className="text-sm font-bold text-white leading-none">PS</span>
          </div>
          <span className="text-sm font-bold text-violet-900 tracking-tight">
            PawaSupply <span className="text-violet-400 font-semibold">Score</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                    : 'text-zinc-500 hover:bg-violet-50 hover:text-violet-700'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Live indicator */}
        <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600">
          <IconLive className="live-dot text-violet-500" size={7} />
          Temps réel
        </div>
      </div>
    </header>
  );
}
