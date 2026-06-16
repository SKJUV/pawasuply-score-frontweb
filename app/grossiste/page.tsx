'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Grossiste, GrossisteOrder, PendingOrder, PayoutCompletedEvent } from '@/lib/types';
import Spinner from '@/components/Spinner';
import ErrorAlert from '@/components/ErrorAlert';
import SectionHeader from '@/components/SectionHeader';
import { formatAmount, formatDateTime } from '@/lib/format';

const PROVIDER_LABEL: Record<string, string> = {
  MTN_MOMO_CMR: 'MTN MoMo',
  ORANGE_CMR:   'Orange Money',
};

const PROVIDER_COLOR: Record<string, string> = {
  MTN_MOMO_CMR: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  ORANGE_CMR:   'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
};

export default function GrossistePage() {
  const [grossistes,   setGrossistes]   = useState<Grossiste[]>([]);
  const [selected,     setSelected]     = useState<string>('');
  const [orders,       setOrders]       = useState<GrossisteOrder[]>([]);
  const [pending,      setPending]      = useState<PendingOrder[]>([]);
  const [days,         setDays]         = useState(30);
  const [loading,      setLoading]      = useState(false);
  const [initLoading,  setInitLoading]  = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [toast,        setToast]        = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Grossiste[]>('/grossistes')
      .then((g) => { setGrossistes(g); if (g.length > 0) setSelected(g[0].id); })
      .catch((e) => setError((e as Error).message))
      .finally(() => setInitLoading(false));
  }, []);

  const loadOrders = useCallback(async (id: string, d: number) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [o, p] = await Promise.all([
        apiFetch<GrossisteOrder[]>(`/grossistes/${id}/orders?days=${d}`),
        apiFetch<PendingOrder[]>(`/grossistes/${id}/pending`),
      ]);
      setOrders(o);
      setPending(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (selected) loadOrders(selected, days); }, [selected, days, loadOrders]);

  // Socket.io
  useEffect(() => {
    if (!selected) return;
    const socket = getSocket();
    const handle = async ({ boutiquierId }: PayoutCompletedEvent) => {
      const [o, p] = await Promise.all([
        apiFetch<GrossisteOrder[]>(`/grossistes/${selected}/orders?days=${days}`).catch(() => null),
        apiFetch<PendingOrder[]>(`/grossistes/${selected}/pending`).catch(() => null),
      ]);
      if (o) setOrders(o);
      if (p) setPending(p);
      setToast(`Livraison confirmée pour boutiquier ${boutiquierId.slice(0, 8)}…`);
      setTimeout(() => setToast(null), 5000);
    };
    socket.on('payout:completed', handle);
    return () => { socket.off('payout:completed', handle); };
  }, [selected, days]);

  const selectedGrossiste = grossistes.find((g) => g.id === selected);

  if (initLoading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-4 text-zinc-400">
        <Spinner size="lg" />
        <p className="text-sm">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard Grossiste"
        sub="Commandes et livraisons Mobile Money"
        right={
          <div className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs text-violet-600">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-violet-500" />
            Mises à jour en direct
          </div>
        }
      />

      {error && <ErrorAlert message={error} onRetry={() => loadOrders(selected, days)} />}

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="text-lg">🎉</span>
          <p className="text-sm font-medium text-emerald-700">{toast}</p>
        </div>
      )}

      {/* Selector + info */}
      <div className="card flex flex-wrap items-end gap-5 p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Grossiste
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-xl border border-violet-200 bg-violet-50/50 px-3.5 py-2.5 text-sm font-medium text-violet-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            {grossistes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} — {PROVIDER_LABEL[g.mmo_provider] ?? g.mmo_provider}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Période
          </label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="rounded-xl border border-violet-200 bg-violet-50/50 px-3.5 py-2.5 text-sm font-medium text-violet-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            {[1, 7, 14, 30, 90].map((d) => (
              <option key={d} value={d}>
                {d === 1 ? "Aujourd'hui" : `${d} derniers jours`}
              </option>
            ))}
          </select>
        </div>

        {selectedGrossiste && (
          <div className="ml-auto flex items-center gap-3">
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${PROVIDER_COLOR[selectedGrossiste.mmo_provider] ?? 'bg-zinc-100 text-zinc-500'}`}>
              {PROVIDER_LABEL[selectedGrossiste.mmo_provider] ?? selectedGrossiste.mmo_provider}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-violet-900">{selectedGrossiste.name}</p>
              <p className="font-mono text-xs text-zinc-400">{selectedGrossiste.phone_number}</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPIs */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              ⏳
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                En attente
              </p>
              <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
              <p className="text-xs text-zinc-400">commande{pending.length > 1 ? 's' : ''} PENDING_DELIVERY</p>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              ✅
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Livrées
              </p>
              <p className="text-2xl font-bold text-emerald-600">{orders.length}</p>
              <p className="text-xs text-zinc-400">commande{orders.length > 1 ? 's' : ''} COMPLETED sur la période</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center gap-3 text-zinc-400">
          <Spinner />
          <span className="text-sm">Chargement des commandes…</span>
        </div>
      ) : (
        <>
          {/* Pending */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-violet-50 px-6 py-4">
              <div>
                <p className="text-sm font-bold text-violet-900">En attente de livraison</p>
                <p className="text-xs text-zinc-400">Payouts acceptés, en attente de confirmation opérateur</p>
              </div>
              {pending.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                  {pending.length}
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-300">
                <span className="text-4xl">✨</span>
                <p className="text-sm">Aucune commande en attente</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-violet-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Boutiquier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Téléphone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Opérateur</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-50">
                    {pending.map((p) => (
                      <tr key={p.credit_id} className="table-row-hover">
                        <td className="px-4 py-3.5 font-semibold text-violet-900">{p.boutiquier_name}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-400">{p.phone_number}</td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PROVIDER_COLOR[p.provider] ?? 'bg-zinc-100 text-zinc-500'}`}>
                            {PROVIDER_LABEL[p.provider] ?? p.provider}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-amber-700">
                          {formatAmount(p.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                            {p.credit_status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-400">{formatDateTime(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completed */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-violet-50 px-6 py-4">
              <div>
                <p className="text-sm font-bold text-violet-900">Commandes livrées</p>
                <p className="text-xs text-zinc-400">Payouts COMPLETED sur la période sélectionnée</p>
              </div>
              {orders.length > 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {orders.length}
                </span>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-zinc-300">
                <span className="text-4xl">📭</span>
                <p className="text-sm">Aucune commande sur cette période</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-violet-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Boutiquier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Téléphone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Opérateur</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-50">
                    {orders.map((o) => (
                      <tr key={o.id} className="table-row-hover">
                        <td className="px-4 py-3.5 font-semibold text-violet-900">{o.boutiquier_name}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-400">{o.boutiquier_phone}</td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PROVIDER_COLOR[o.provider] ?? 'bg-zinc-100 text-zinc-500'}`}>
                            {PROVIDER_LABEL[o.provider] ?? o.provider}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-700">
                          {formatAmount(o.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-400">{formatDateTime(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
