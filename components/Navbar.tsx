'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBank, IconStore, IconBolt, IconLive, IconLogs, IconMenu, IconClose } from './icons';

const links = [
  { href: '/bank',      label: 'Banque',     Icon: IconBank },
  { href: '/grossiste', label: 'Grossiste',  Icon: IconStore },
  { href: '/simulator', label: 'Simulateur', Icon: IconBolt },
];

export default function Navbar() {
  const pathname      = usePathname();
  const [open, setOpen]         = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  // Détection côté client uniquement — sessionStorage n'existe pas côté SSR
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_DEV_KEY ?? 'dev';
    setIsDevMode(sessionStorage.getItem('ps_dev') === key);
  }, []);

  // Fermer le drawer sur changement de route
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-sm shadow-violet-300">
            <span className="text-xs font-bold leading-none text-white">PS</span>
          </div>
          <span className="hidden text-sm font-bold tracking-tight text-violet-900 sm:block">
            PawaSupply <span className="font-semibold text-violet-400">Score</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                    : 'text-zinc-500 hover:bg-violet-50 hover:text-violet-700'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}

          {/* Logs — visible uniquement si session dev active */}
          {isDevMode && (
            <Link
              href="/logs"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                pathname.startsWith('/logs')
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
              }`}
            >
              <IconLogs size={15} />
              Logs
            </Link>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600 sm:flex">
            <IconLive className="live-dot text-violet-500" size={7} />
            Temps réel
          </div>

          {/* Burger mobile */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-violet-50 hover:text-violet-700 md:hidden"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="border-t border-violet-100 bg-white px-4 pb-4 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            {links.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-600 hover:bg-violet-50 hover:text-violet-700'
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
            {isDevMode && (
              <Link
                href="/logs"
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  pathname.startsWith('/logs')
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                <IconLogs size={17} />
                Logs API
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
