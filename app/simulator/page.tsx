'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { DepositResponse, PayoutResponse, RepaymentResponse } from '@/lib/types';
import Spinner from '@/components/Spinner';
import WalletLimitAlert from '@/components/WalletLimitAlert';
import SectionHeader from '@/components/SectionHeader';

const DEMO_BOUTIQUIER_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DEMO_BOUTIQUIER_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const DEMO_GROSSISTE_MTN = 'b0000000-0000-0000-0000-000000000001';
const DEMO_GROSSISTE_ORA = 'b0000000-0000-0000-0000-000000000002';
const PHONE_SUCCESS      = '237653456789';
const PHONE_INSUF        = '237653456049';

type ResultState =
  | { type: 'deposit';    data: DepositResponse }
  | { type: 'payout';     data: PayoutResponse }
  | { type: 'repayment';  data: RepaymentResponse }
  | { type: 'walletLimit' }
  | { type: 'error';      message: string };

interface ActionDef {
  id:          string;
  label:       string;
  description: string;
  icon:        string;
  category:    'deposit' | 'payout' | 'repayment';
  variant:     'success' | 'danger' | 'violet' | 'orange' | 'purple';
  run:         (amount: number, creditId: string) => Promise<ResultState>;
}

const variantStyles: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800',
  danger:  'border-red-200 bg-red-50 hover:bg-red-100/70 text-red-800',
  violet:  'border-violet-200 bg-violet-50 hover:bg-violet-100/70 text-violet-800',
  orange:  'border-orange-200 bg-orange-50 hover:bg-orange-100/70 text-orange-800',
  purple:  'border-purple-200 bg-purple-50 hover:bg-purple-100/70 text-purple-800',
};

export default function SimulatorPage() {
  const [loading,       setLoading]       = useState<string | null>(null);
  const [result,        setResult]        = useState<ResultState | null>(null);
  const [customAmount,  setCustomAmount]  = useState(10000);
  const [customCreditId, setCustomCreditId] = useState('');

  const actions: ActionDef[] = [
    {
      id: 'deposit-ok', label: 'Dépôt réussi', icon: '✅',
      category: 'deposit', variant: 'success',
      description: 'Collecte Mobile Money — PIN validé → COMPLETED, score amélioré',
      run: async (amount) => {
        const d = await apiFetch<DepositResponse>('/deposits', {
          method: 'POST',
          body: JSON.stringify({ boutiquierId: DEMO_BOUTIQUIER_A, phoneRaw: PHONE_SUCCESS, amount, currency: 'XAF' }),
        });
        return { type: 'deposit', data: d };
      },
    },
    {
      id: 'deposit-fail', label: 'Solde insuffisant', icon: '❌',
      category: 'deposit', variant: 'danger',
      description: 'Collecte rejetée — INSUFFICIENT_BALANCE → score pénalisé',
      run: async (amount) => {
        const d = await apiFetch<DepositResponse>('/deposits', {
          method: 'POST',
          body: JSON.stringify({ boutiquierId: DEMO_BOUTIQUIER_A, phoneRaw: PHONE_INSUF, amount, currency: 'XAF' }),
        });
        return { type: 'deposit', data: d };
      },
    },
    {
      id: 'payout-mtn', label: 'Payout MTN', icon: '💸',
      category: 'payout', variant: 'violet',
      description: 'Crédit stock 50 000 XAF → Socada MTN (PENDING_DELIVERY → ACTIVE)',
      run: async () => {
        const d = await apiFetch<PayoutResponse>('/payouts', {
          method: 'POST',
          body: JSON.stringify({ boutiquierId: DEMO_BOUTIQUIER_B, grossisteId: DEMO_GROSSISTE_MTN, amount: 50000, currency: 'XAF' }),
        });
        return { type: 'payout', data: d };
      },
    },
    {
      id: 'payout-orange', label: 'Payout Orange', icon: '🍊',
      category: 'payout', variant: 'orange',
      description: 'Crédit stock 50 000 XAF → Congelcam Orange Money',
      run: async () => {
        const d = await apiFetch<PayoutResponse>('/payouts', {
          method: 'POST',
          body: JSON.stringify({ boutiquierId: DEMO_BOUTIQUIER_B, grossisteId: DEMO_GROSSISTE_ORA, amount: 50000, currency: 'XAF' }),
        });
        return { type: 'payout', data: d };
      },
    },
    {
      id: 'repayment', label: 'Remboursement', icon: '🔄',
      category: 'repayment', variant: 'purple',
      description: 'Initie le remboursement d\'un crédit ACTIVE (saisir le Credit ID)',
      run: async (amount, creditId) => {
        if (!creditId.trim()) throw new Error('Veuillez saisir un Credit ID valide');
        const d = await apiFetch<RepaymentResponse>('/repayments', {
          method: 'POST',
          body: JSON.stringify({ boutiquierId: DEMO_BOUTIQUIER_A, creditId: creditId.trim(), amount, currency: 'XAF', phoneRaw: PHONE_SUCCESS }),
        });
        return { type: 'repayment', data: d };
      },
    },
  ];

  async function run(action: ActionDef) {
    setLoading(action.id);
    setResult(null);
    try {
      setResult(await action.run(customAmount, customCreditId));
    } catch (e) {
      setResult({ type: 'error', message: (e as Error).message });
    } finally {
      setLoading(null);
    }
  }

  const categories = [
    { key: 'deposit',   label: 'Dépôts',         icon: '📲' },
    { key: 'payout',    label: 'Payouts',         icon: '💸' },
    { key: 'repayment', label: 'Remboursements',  icon: '🔄' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Simulateur"
        sub="Testez les flux pawaPay sur les boutiquiers de démo (sandbox)"
      />

      {/* Params */}
      <div className="card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Paramètres
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Montant (XAF)</label>
            <input
              type="number" value={customAmount} min={100} step={1000}
              onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
              className="w-44 rounded-xl border border-violet-200 bg-violet-50/50 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Credit ID (remboursement)</label>
            <input
              type="text" value={customCreditId} placeholder="uuid-credit"
              onChange={(e) => setCustomCreditId(e.target.value)}
              className="w-80 rounded-xl border border-violet-200 bg-violet-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>
      </div>

      {/* Action groups */}
      {categories.map(({ key, label, icon }) => {
        const group = actions.filter((a) => a.category === key);
        return (
          <div key={key}>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <span>{icon}</span> {label}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((action) => (
                <button
                  key={action.id}
                  onClick={() => run(action)}
                  disabled={loading !== null}
                  className={`flex items-start gap-3.5 rounded-2xl border-2 p-5 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[action.variant]}`}
                >
                  <span className="mt-0.5 text-2xl leading-none">{action.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">{action.label}</p>
                      {loading === action.id && <Spinner size="sm" />}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed opacity-70">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Result */}
      {result && (
        <div className="card p-6">
          <p className="mb-4 text-sm font-bold text-violet-900">Résultat</p>

          {result.type === 'error' && (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
              <span className="text-xl">❌</span>
              <div>
                <p className="font-semibold text-red-700">Erreur API</p>
                <p className="mt-0.5 text-sm text-red-600">{result.message}</p>
              </div>
            </div>
          )}

          {result.type === 'walletLimit' && <WalletLimitAlert />}

          {result.type === 'deposit' && (
            <div className={`rounded-xl border p-5 ${
              result.data.status === 'ACCEPTED'
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{result.data.status === 'ACCEPTED' ? '✅' : '❌'}</span>
                <p className={`font-bold ${result.data.status === 'ACCEPTED' ? 'text-emerald-800' : 'text-red-800'}`}>
                  Dépôt {result.data.status === 'ACCEPTED' ? 'Accepté' : 'Rejeté'}
                </p>
              </div>
              <p className="mt-2 font-mono text-xs text-zinc-400">ID : {result.data.depositId}</p>
              {result.data.nextStep && (
                <p className="mt-2 text-sm text-emerald-700">{result.data.nextStep}</p>
              )}
              {result.data.reason && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-red-600 font-medium">Raison :</span>
                  <code className="rounded-lg bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    {result.data.reason}
                  </code>
                </div>
              )}
              {result.data.status === 'ACCEPTED' && (
                <p className="mt-3 rounded-lg bg-emerald-100 px-3 py-2 text-xs text-emerald-600">
                  ℹ️ Statut final (COMPLETED/FAILED) via webhook · Écoutez{' '}
                  <code className="font-bold">score:updated</code> sur Socket.io
                </p>
              )}
            </div>
          )}

          {result.type === 'payout' && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">💸</span>
                <p className="font-bold text-violet-800">Payout Accepté</p>
              </div>
              <p className="mt-2 font-mono text-xs text-zinc-400">ID : {result.data.payoutId}</p>
              <p className="mt-3 rounded-lg bg-violet-100 px-3 py-2 text-xs text-violet-600">
                Crédit créé en <strong>PENDING_DELIVERY</strong> → passera en{' '}
                <strong>ACTIVE</strong> après confirmation webhook (due_date = +14 jours)
              </p>
            </div>
          )}

          {result.type === 'repayment' && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <p className="font-bold text-purple-800">Remboursement initié</p>
              </div>
              <div className="mt-2 space-y-0.5">
                <p className="font-mono text-xs text-zinc-400">Deposit : {result.data.depositId}</p>
                <p className="font-mono text-xs text-zinc-400">Credit : {result.data.creditId}</p>
              </div>
              <p className="mt-2 text-sm text-purple-700">{result.data.nextStep}</p>
            </div>
          )}

          {/* Raw JSON */}
          {result.type !== 'error' && result.type !== 'walletLimit' && (
            <details className="mt-4">
              <summary className="cursor-pointer select-none text-xs font-medium text-zinc-400 hover:text-violet-600 transition-colors">
                Voir la réponse JSON brute
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-violet-950 p-4 text-xs leading-relaxed text-violet-100">
                {JSON.stringify(
                  result.type === 'deposit'   ? result.data :
                  result.type === 'payout'    ? result.data :
                  result.data, null, 2
                )}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Sandbox reference */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Boutiquiers de démo
          </p>
          <div className="space-y-2 text-xs">
            <div className="rounded-lg bg-violet-50 p-3">
              <span className="font-bold text-violet-700">Boutiquier A</span>
              <p className="mt-0.5 font-mono text-zinc-400 break-all">{DEMO_BOUTIQUIER_A}</p>
              <p className="mt-0.5 text-zinc-500">Amadou Diallo · Platine</p>
            </div>
            <div className="rounded-lg bg-violet-50 p-3">
              <span className="font-bold text-violet-700">Boutiquier B</span>
              <p className="mt-0.5 font-mono text-zinc-400 break-all">{DEMO_BOUTIQUIER_B}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Suffixes téléphone sandbox
          </p>
          <div className="space-y-2 text-xs">
            {[
              { suffix: '…789', label: 'COMPLETED', color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
              { suffix: '…049', label: 'INSUFFICIENT_BALANCE', color: 'bg-red-100 text-red-700', icon: '❌' },
              { suffix: '…099', label: 'WALLET_LIMIT_REACHED', color: 'bg-amber-100 text-amber-700', icon: '⚠️' },
            ].map(({ suffix, label, color, icon }) => (
              <div key={suffix} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5">
                <code className="w-14 shrink-0 text-center font-bold text-zinc-600">{suffix}</code>
                <span className="text-zinc-400">→</span>
                <span className={`rounded-full px-2.5 py-0.5 font-semibold ${color}`}>
                  {icon} {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
