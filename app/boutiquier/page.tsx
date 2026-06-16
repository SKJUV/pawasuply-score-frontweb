'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api';
import type { Boutiquier, ScoreHistoryPoint } from '@/lib/types';
import Spinner from '@/components/Spinner';
import ErrorAlert from '@/components/ErrorAlert';
import CategoryBadge from '@/components/CategoryBadge';
import SectionHeader from '@/components/SectionHeader';
import { formatAmount, formatDateTime, CREDIT_STATUS_STYLE } from '@/lib/format';

const ScoreLineChart = dynamic(() => import('@/components/charts/ScoreLineChart'), { ssr: false });

function BoutiquierSearchContent() {
  const params   = useSearchParams();
  const idParam  = params.get('id') ?? '';

  const [query,      setQuery]      = useState(idParam);
  const [boutiquier, setBoutiquier] = useState<Boutiquier | null>(null);
  const [history,    setHistory]    = useState<ScoreHistoryPoint[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function search(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setBoutiquier(null);
    setHistory([]);
    try {
      const [b, h] = await Promise.all([
        apiFetch<Boutiquier>(`/boutiquiers/${id.trim()}`),
        apiFetch<ScoreHistoryPoint[]>(`/boutiquiers/${id.trim()}/score-history?limit=90`),
      ]);
      setBoutiquier(b);
      setHistory(h);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (idParam) search(idParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = boutiquier ? parseFloat(boutiquier.current_score) : 0;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Profil Boutiquier"
        sub="Rechercher par UUID ou numéro de téléphone"
      />

      {/* Search form */}
      <div className="card p-5">
        <form
          onSubmit={(e) => { e.preventDefault(); search(query); }}
          className="flex gap-2"
        >
          <input
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="UUID ou 237XXXXXXXXX"
            className="flex-1 rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm placeholder-zinc-400 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-300 hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading && <Spinner size="sm" />}
            Rechercher
          </button>
        </form>
      </div>

      {error && <ErrorAlert message={error} />}

      {boutiquier && (
        <div className="space-y-6">
          {/* Header card */}
          <div className="card overflow-hidden">
            <div className="h-1.5 gradient-bg" />
            <div className="flex flex-wrap items-center gap-6 p-6">
              {/* Score badge */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-violet-50 px-6 py-5">
                <span className="text-4xl font-extrabold text-violet-700">
                  {score.toFixed(0)}
                </span>
                <span className="text-xs text-zinc-400">/100</span>
                <div className="mt-2">
                  <CategoryBadge category={boutiquier.category} />
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-violet-900">{boutiquier.name}</h2>
                <p className="font-mono text-sm text-zinc-400">{boutiquier.phone_number}</p>
                <p className="font-mono text-xs text-zinc-300">{boutiquier.id}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Limite crédit</p>
                  <p className="mt-1 font-bold text-violet-700">{formatAmount(boutiquier.credit_limit)}</p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Membre depuis</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-700">
                    {formatDateTime(boutiquier.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active credit */}
          {boutiquier.activeCredit ? (
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-violet-900">Crédit en cours</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CREDIT_STATUS_STYLE[boutiquier.activeCredit.status] ?? ''}`}>
                  {boutiquier.activeCredit.status}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Montant',  value: formatAmount(boutiquier.activeCredit.amount) },
                  { label: 'Grossiste', value: boutiquier.activeCredit.grossiste_name },
                  { label: 'Échéance', value: formatDateTime(boutiquier.activeCredit.due_date) },
                  { label: 'Credit ID', value: boutiquier.activeCredit.id, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="rounded-xl bg-violet-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
                    <p className={`mt-1.5 break-all text-sm font-semibold text-violet-900 ${mono ? 'font-mono text-xs text-zinc-400' : ''}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card flex items-center gap-3 p-5">
              <span className="text-2xl">💤</span>
              <p className="text-sm text-zinc-400">Aucun crédit actif ou en attente de livraison.</p>
            </div>
          )}

          {/* Score chart */}
          <div className="card p-6">
            <p className="mb-4 text-sm font-bold text-violet-900">
              Historique des scores ({history.length} points)
            </p>
            {history.length > 0 ? (
              <ScoreLineChart history={history} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-300">
                <span className="text-4xl">📉</span>
                <p className="text-sm">Aucun historique disponible.</p>
              </div>
            )}
          </div>

          <Link
            href="/bank"
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
          >
            ← Retour au dashboard banque
          </Link>
        </div>
      )}
    </div>
  );
}

export default function BoutiquierSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-72 flex-col items-center justify-center gap-4 text-zinc-400">
          <Spinner size="lg" />
          <p className="text-sm">Chargement…</p>
        </div>
      }
    >
      <BoutiquierSearchContent />
    </Suspense>
  );
}
