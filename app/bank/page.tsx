'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { BankDashboard, ScoreUpdatedEvent } from '@/lib/types';
import KpiCard from '@/components/KpiCard';
import ScoreTable from '@/components/ScoreTable';
import Spinner from '@/components/Spinner';
import ErrorAlert from '@/components/ErrorAlert';
import SectionHeader from '@/components/SectionHeader';
import {
  IconCreditCard, IconCheck, IconWarning, IconChart,
  IconRefresh, IconLive,
} from '@/components/icons';
import { formatAmount } from '@/lib/format';

const DonutChart      = dynamic(() => import('@/components/charts/DonutChart'),      { ssr: false });
const MonthlyBarChart = dynamic(() => import('@/components/charts/MonthlyBarChart'), { ssr: false });
const NplLineChart    = dynamic(() => import('@/components/charts/NplLineChart'),    { ssr: false });

export default function BankPage() {
  const [data,       setData]       = useState<BankDashboard | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiFetch<BankDashboard>('/bank/dashboard'));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data) return;
    const socket = getSocket();
    data.boutiquiers.forEach((b) => socket.emit('join:boutiquier', b.id));

    const handleScoreUpdate = ({ boutiquierId, finalScore, category, creditLimit }: ScoreUpdatedEvent) => {
      setData((prev) =>
        prev ? {
          ...prev,
          boutiquiers: prev.boutiquiers.map((b) =>
            b.id === boutiquierId
              ? { ...b, current_score: String(finalScore), category, credit_limit: String(creditLimit) }
              : b
          ),
        } : prev
      );
      setLastUpdate(new Date());
    };

    socket.on('score:updated', handleScoreUpdate);
    return () => { socket.off('score:updated', handleScoreUpdate); };
  }, [data?.boutiquiers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-4 text-zinc-400">
        <Spinner size="lg" />
        <p className="text-sm">Chargement du dashboard…</p>
      </div>
    );
  }

  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!data) return null;

  const { metrics, categories, monthly, npl_evolution, boutiquiers } = data;

  return (
    <div className="space-y-8">

      <SectionHeader
        title="Dashboard Banque"
        sub={`${boutiquiers.length} boutiquier${boutiquiers.length > 1 ? 's' : ''} enregistré${boutiquiers.length > 1 ? 's' : ''}`}
        right={
          <>
            {lastUpdate && (
              <span className="flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs text-violet-600">
                <IconLive className="live-dot text-violet-500" size={7} />
                {lastUpdate.toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala' })}
              </span>
            )}
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-sm font-medium text-violet-700 shadow-sm hover:bg-violet-50 transition-colors"
            >
              <IconRefresh size={15} />
              Actualiser
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Crédits actifs"
          value={metrics.credits_actifs}
          sub={`Encours : ${formatAmount(metrics.encours_total)}`}
          icon={<IconCreditCard size={18} />}
          accent="violet"
        />
        <KpiCard
          label="Remboursés"
          value={metrics.credits_rembourses}
          sub={`Montant : ${formatAmount(metrics.montant_rembourse)}`}
          icon={<IconCheck size={18} />}
          accent="green"
        />
        <KpiCard
          label="En défaut"
          value={metrics.credits_defaut}
          sub={`Montant : ${formatAmount(metrics.montant_defaut)}`}
          icon={<IconWarning size={18} />}
          accent={metrics.credits_defaut > 0 ? 'red' : 'default'}
        />
        <KpiCard
          label="Taux NPL"
          value={`${metrics.npl_rate.toFixed(1)}%`}
          sub={`${metrics.total_credits} crédits au total`}
          icon={<IconChart size={18} />}
          accent={metrics.npl_rate > 5 ? 'red' : metrics.npl_rate > 0 ? 'amber' : 'default'}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <p className="mb-5 text-sm font-bold text-violet-900">Répartition par catégorie</p>
          {categories.length > 0
            ? <DonutChart categories={categories} />
            : <div className="flex h-44 items-center justify-center text-sm text-zinc-300">Aucune donnée</div>}
        </div>
        <div className="card p-5 lg:col-span-2">
          <p className="mb-5 text-sm font-bold text-violet-900">
            Crédits mensuels — accordés / remboursés / défaut
          </p>
          {monthly.length > 0
            ? <MonthlyBarChart monthly={monthly} />
            : <div className="flex h-44 items-center justify-center text-sm text-zinc-300">Aucune donnée</div>}
        </div>
      </div>

      {/* NPL line */}
      <div className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-bold text-violet-900">
            Évolution du taux NPL — 30 derniers jours
          </p>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
            {metrics.npl_rate.toFixed(1)}% actuellement
          </span>
        </div>
        {npl_evolution.length > 0
          ? <NplLineChart nplEvolution={npl_evolution} />
          : <div className="flex h-40 items-center justify-center text-sm text-zinc-300">Aucune donnée</div>}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-violet-50 px-5 py-4">
          <p className="text-sm font-bold text-violet-900">Boutiquiers</p>
          <p className="text-xs text-zinc-400">{boutiquiers.length} résultats</p>
        </div>
        <ScoreTable boutiquiers={boutiquiers} />
      </div>

    </div>
  );
}
