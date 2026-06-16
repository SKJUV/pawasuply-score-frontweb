import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PawaSupply Score',
  description: 'Plateforme de scoring boutiquier — PawaSupply',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#fafafa] text-zinc-900">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 page-enter">
          {children}
        </main>
        <footer className="mt-8 border-t border-violet-100 bg-white py-4 text-center text-xs text-zinc-400">
          <span className="font-medium text-violet-500">PawaSupply Score</span>
          {' '}© {new Date().getFullYear()} —{' '}
          Heures affichées en <span className="font-medium">Africa/Douala (UTC+1)</span>
        </footer>
      </body>
    </html>
  );
}
