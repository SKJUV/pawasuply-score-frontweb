'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Boutiquier, ScoreHistoryPoint, ScoreUpdatedEvent } from '@/lib/types';
import Spinner from '@/components/Spinner';
import ErrorAlert from '@/components/ErrorAlert';
import CategoryBadge from '@/components/CategoryBadge';
import { IconArrowLeft, IconLive, IconRefresh } from '@/components/icons';
import { formatAmount, formatDateTime, CREDIT_STATUS_STYLE } from '@/lib/format';

const ScoreLineChart = dynamic(() => import('@/components/charts/ScoreLineChart'), { ssr: false });

// ── Score ring SVG ─────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r    = 40;
  const circ = 2 * Math.PI * r;
  const fill = (Math.min(score, 100) / 100) * circ;
  const color =
    score >= 75 ? '#22c55e' :
    score >= 50 ? '#eab308' :
    score >= 25 ? '#f97316' : '#ef4444';

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="-rotate-90" width="112" height="112" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#ede9fe" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold tabular-nums text-violet-900">{score.toFixed(0)}</span>
        <span className="text-xs text-zinc-400">/100</span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BoutiquierProfilePage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [boutiquier, setBoutiquier] = useState<Boutiquier | null>(null);
  const [history,    setHistory]    = useState<ScoreHistoryPoint[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [liveAlert,  setLiveAlert]  = useState<string | null>(null);

  // Chargement initial
  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<Boutiquier>(`/boutiquiers/${id}`),
      apiFetch<ScoreHistoryPoint[]>(`/boutiquiers/${id}/score-history?limit=90`),
    ])
      .then(([b, h]) => { setBoutiquier(b); setHistory(h); })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  // Socket.io — score en temps réel
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    socket.emit('join:boutiquier', id);

    const handle = ({ boutiquierId, finalScore, category, creditLimit }: ScoreUpdatedEvent) => {
      if (boutiquierId !== id) return;
      setBoutiquier((prev) =>
        prev
          ? { ...prev, current_score: String(finalScore), category, credit_limit: String(creditLimit) }
          : prev
      );
      setLiveAlert(`Score mis à jour : ${finalScore} · ${category}`);
      setTimeout(() => setLiveAlert(null), 6000);
    };

    socket.on('score:updated', handle);
    return () => { socket.off('score:updated', handle); };
  }, [id]);

  // Naviguer vers le simulateur avec le credit ID pré-rempli
  function goToRepayment(creditId: string) {
    router.push(`/simulator?creditId=${encodeURIComponent(creditId)}`);
  }

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-4 text-zinc-400">
        <Spinner size="lg" />
        <p className="text-sm">Chargement du profil…</p>
      </div>
    );
  }

  if (error) return <ErrorAlert message={error} />;
  if (!boutiquier) return null;

  const score      = parseFloat(boutiquier.current_score);
  const histScores = history.map((h) => parseFloat(h.score));

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/bank"
          className="flex items-center gap-1 text-zinc-400 hover:text-violet-600 transition-colors"
        >
          <IconArrowLeft size={15} />
          Dashboard Banque
        </Link>
        <span className="text-zinc-200">/</span>
        <span className="font-medium text-violet-700">{boutiquier.name}</span>
      </nav>

      {/* Alerte temps réel */}
      {liveAlert && (
        <div className="flex items-center gap-2.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
          <IconLive className="live-dot shrink-0 text-violet-500" size={7} />
          <p className="text-sm font-semibold text-violet-700">{liveAlert}</p>
        </div>
      )}

      {/* Profil principal */}
      <div className="card overflow-hidden">
        <div className="h-1 w-full gradient-bg" />
        <div className="flex flex-wrap items-center gap-6 p-5 sm:p-6">
          <ScoreRing score={score} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0">
                <h1 className="text-xl font-extrabold text-violet-900">{boutiquier.name}</h1>
                <p className="font-mono text-sm text-zinc-400">{boutiquier.phone_number}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-zinc-300">{boutiquier.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <CategoryBadge category={boutiquier.category} />
                <span className="flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                  <IconLive className="live-dot text-violet-500" size={7} />
                  Live
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-violet-100 bg-violet-50 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Limite crédit</p>
              <p className="mt-1 font-bold tabular-nums text-violet-700">
                {formatAmount(boutiquier.credit_limit)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Depuis</p>
              <p className="mt-1 text-sm font-semibold text-zinc-700">
                {new Date(boutiquier.created_at).toLocaleDateString('fr-FR', {
                  timeZone: 'Africa/Douala',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crédit actif */}
      {boutiquier.activeCredit ? (
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-violet-900">Crédit en cours</p>
              <p className="text-xs text-zinc-400">
                Échéance :{' '}
                <span className={
                  new Date(boutiquier.activeCredit.due_date) < new Date()
                    ? 'font-semibold text-red-600'
                    : 'text-zinc-600'
                }>
                  {formatDateTime(boutiquier.activeCredit.due_date)}
                </span>
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                CREDIT_STATUS_STYLE[boutiquier.activeCredit.status] ?? 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {boutiquier.activeCredit.status}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Montant',   value: formatAmount(boutiquier.activeCredit.amount) },
              { label: 'Grossiste', value: boutiquier.activeCredit.grossiste_name },
              { label: 'Credit ID', value: boutiquier.activeCredit.id, mono: true },
              { label: 'Payout ID', value: boutiquier.activeCredit.payout_transaction_id, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="rounded-xl bg-violet-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
                <p
                  className={`mt-1.5 break-all text-sm font-semibold ${
                    mono ? 'font-mono text-xs text-zinc-400' : 'text-violet-900'
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card flex items-center gap-3 p-5 text-sm text-zinc-400">
          Aucun crédit actif ou en attente de livraison.
        </div>
      )}

      {/* Historique des scores */}
      <div className="card p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-violet-900">Historique des scores</p>
            <p className="text-xs text-zinc-400">
              {history.length} enregistrement{history.length > 1 ? 's' : ''} · 90 derniers
            </p>
          </div>
          {histScores.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>
                Min{' '}
                <strong className="tabular-nums text-zinc-600">
                  {Math.min(...histScores).toFixed(0)}
                </strong>
              </span>
              <span>
                Max{' '}
                <strong className="tabular-nums text-violet-700">
                  {Math.max(...histScores).toFixed(0)}
                </strong>
              </span>
            </div>
          )}
        </div>

        {history.length > 0 ? (
          <ScoreLineChart history={history} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-300">
            <p className="text-sm">Aucun historique disponible.</p>
          </div>
        )}
      </div>

    </div>
  );
}
