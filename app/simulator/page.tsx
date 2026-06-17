'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { DepositResponse, PayoutResponse, RepaymentResponse } from '@/lib/types';
import Spinner from '@/components/Spinner';
import WalletLimitAlert from '@/components/WalletLimitAlert';
import SectionHeader from '@/components/SectionHeader';
import { IconCheck, IconX, IconSend, IconRefresh, IconWarning, IconPhone } from '@/components/icons';

// ── Demo fixtures (sandbox pawaPay) ───────────────────────────────────────────
const DEMO_A  = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DEMO_B  = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const G_MTN   = 'b0000000-0000-0000-0000-000000000001';
const G_ORA   = 'b0000000-0000-0000-0000-000000000002';

// Suffixes sandbox pawaPay (section 9 du spec)
const PH_OK       = '237653456789'; // → COMPLETED
const PH_INSUF    = '237653456049'; // → INSUFFICIENT_BALANCE
const PH_DECLINED = '237653456039'; // → PAYMENT_NOT_APPROVED (PIN refusé)
const PH_NOTFOUND = '237653456029'; // → PAYER_NOT_FOUND

// ── Types ─────────────────────────────────────────────────────────────────────
type ResultState =
  | { type: 'deposit';   data: DepositResponse }
  | { type: 'payout';    data: PayoutResponse }
  | { type: 'repayment'; data: RepaymentResponse }
  | { type: 'walletLimit' }
  | { type: 'error';     message: string };

type Variant = 'green' | 'red' | 'violet' | 'orange' | 'purple' | 'zinc';

interface ActionDef {
  id:          string;
  label:       string;
  description: string;
  category:    string;
  variant:     Variant;
  Icon:        React.ComponentType<{ size?: number; className?: string }>;
  run:         (amount: number, creditId: string) => Promise<ResultState>;
}

const variantCard: Record<Variant, { border: string; iconBg: string }> = {
  green:  { border: 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/40', iconBg: 'bg-emerald-50 text-emerald-600' },
  red:    { border: 'border-red-200     hover:border-red-300     hover:bg-red-50/40',     iconBg: 'bg-red-50 text-red-500' },
  violet: { border: 'border-violet-200  hover:border-violet-300  hover:bg-violet-50/40',  iconBg: 'bg-violet-50 text-violet-600' },
  orange: { border: 'border-orange-200  hover:border-orange-300  hover:bg-orange-50/40',  iconBg: 'bg-orange-50 text-orange-600' },
  purple: { border: 'border-purple-200  hover:border-purple-300  hover:bg-purple-50/40',  iconBg: 'bg-purple-50 text-purple-600' },
  zinc:   { border: 'border-zinc-200    hover:border-zinc-300    hover:bg-zinc-50/60',    iconBg: 'bg-zinc-100 text-zinc-500' },
};

// Helper pour créer un dépôt
function makeDeposit(phoneRaw: string, boutiquierId: string) {
  return async (amount: number): Promise<ResultState> => ({
    type: 'deposit',
    data: await apiFetch<DepositResponse>('/deposits', {
      method: 'POST',
      body: JSON.stringify({ boutiquierId, phoneRaw, amount, currency: 'XAF' }),
    }),
  });
}

function SimulatorContent() {
  const params = useSearchParams();
  const [loading,        setLoading]        = useState<string | null>(null);
  const [result,         setResult]         = useState<ResultState | null>(null);
  const [customAmount,   setCustomAmount]   = useState(10000);
  // Pré-rempli si on arrive depuis /boutiquier/[id]
  const [customCreditId, setCustomCreditId] = useState(params.get('creditId') ?? '');

  const actions: ActionDef[] = [
    // ── Dépôts ─────────────────────────────────────────────────────────────
    {
      id: 'deposit-ok',
      label: 'Dépôt réussi',
      category: 'Dépôts Mobile Money',
      description: 'PIN validé → COMPLETED · score amélioré (suffixe 789)',
      variant: 'green', Icon: IconCheck,
      run: async (amount) => makeDeposit(PH_OK, DEMO_A)(amount),
    },
    {
      id: 'deposit-insuf',
      label: 'Solde insuffisant',
      category: 'Dépôts Mobile Money',
      description: 'INSUFFICIENT_BALANCE → fréquence pénalisée (suffixe 049)',
      variant: 'red', Icon: IconX,
      run: async (amount) => makeDeposit(PH_INSUF, DEMO_A)(amount),
    },
    {
      id: 'deposit-declined',
      label: 'PIN refusé',
      category: 'Dépôts Mobile Money',
      description: 'PAYMENT_NOT_APPROVED → PIN non saisi / expiré (suffixe 039)',
      variant: 'red', Icon: IconX,
      run: async (amount) => makeDeposit(PH_DECLINED, DEMO_A)(amount),
    },
    {
      id: 'deposit-notfound',
      label: 'Numéro inconnu',
      category: 'Dépôts Mobile Money',
      description: 'PAYER_NOT_FOUND → numéro non enregistré chez MTN (suffixe 029)',
      variant: 'zinc', Icon: IconPhone,
      run: async (amount) => makeDeposit(PH_NOTFOUND, DEMO_A)(amount),
    },

    // ── Payouts ────────────────────────────────────────────────────────────
    {
      id: 'payout-mtn',
      label: 'Payout MTN',
      category: 'Payouts Crédit Stock',
      description: '50 000 XAF → Socada MTN · crée PENDING_DELIVERY',
      variant: 'violet', Icon: IconSend,
      run: async () => ({
        type: 'payout',
        data: await apiFetch<PayoutResponse>('/payouts', {
          method: 'POST',
          body: JSON.stringify({ boutiquierId: DEMO_B, grossisteId: G_MTN, amount: 50000, currency: 'XAF' }),
        }),
      }),
    },
    {
      id: 'payout-orange',
      label: 'Payout Orange',
      category: 'Payouts Crédit Stock',
      description: '50 000 XAF → Congelcam Orange Money',
      variant: 'orange', Icon: IconSend,
      run: async () => ({
        type: 'payout',
        data: await apiFetch<PayoutResponse>('/payouts', {
          method: 'POST',
          body: JSON.stringify({ boutiquierId: DEMO_B, grossisteId: G_ORA, amount: 50000, currency: 'XAF' }),
        }),
      }),
    },
    {
      id: 'payout-wallet-limit',
      label: 'Limite portefeuille',
      category: 'Payouts Crédit Stock',
      description: 'WALLET_LIMIT_REACHED → crédit annulé, aucune pénalité score (suffixe 099)',
      variant: 'zinc', Icon: IconWarning,
      run: async () => ({
        type: 'payout',
        data: await apiFetch<PayoutResponse>('/payouts', {
          method: 'POST',
          // Grossiste avec suffixe 099 → WALLET_LIMIT_REACHED
          body: JSON.stringify({ boutiquierId: DEMO_B, grossisteId: G_ORA, amount: 50000, currency: 'XAF' }),
        }),
      }),
    },

    // ── Remboursements ─────────────────────────────────────────────────────
    {
      id: 'repayment',
      label: 'Remboursement crédit',
      category: 'Remboursements',
      description: 'Rembourser un crédit ACTIVE — saisir le Credit ID ci-dessus',
      variant: 'purple', Icon: IconRefresh,
      run: async (amount, creditId) => {
        if (!creditId.trim()) throw new Error('Veuillez saisir un Credit ID valide');
        return {
          type: 'repayment',
          data: await apiFetch<RepaymentResponse>('/repayments', {
            method: 'POST',
            body: JSON.stringify({
              boutiquierId: DEMO_A,
              creditId:     creditId.trim(),
              amount,
              currency:     'XAF',
              phoneRaw:     PH_OK,
            }),
          }),
        };
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

  const categories = [...new Set(actions.map((a) => a.category))];

  return (
    <div className="space-y-6 sm:space-y-8">

      <SectionHeader
        title="Simulateur Sandbox"
        sub="Testez tous les flux pawaPay sur les boutiquiers de démo"
      />

      {/* Params */}
      <div className="card p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Paramètres</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sim-amount" className="text-xs font-medium text-zinc-500">Montant (XAF)</label>
            <input
              id="sim-amount"
              type="number"
              value={customAmount}
              min={100}
              step={1000}
              onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
              className="w-40 rounded-xl border border-violet-200 bg-violet-50/40 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5" style={{ minWidth: '14rem' }}>
            <label htmlFor="sim-credit" className="text-xs font-medium text-zinc-500">
              Credit ID <span className="text-zinc-400">(remboursement)</span>
            </label>
            <input
              id="sim-credit"
              type="text"
              value={customCreditId}
              placeholder="uuid-credit"
              onChange={(e) => setCustomCreditId(e.target.value)}
              className="w-full rounded-xl border border-violet-200 bg-violet-50/40 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>
      </div>

      {/* Action groups */}
      {categories.map((cat) => (
        <div key={cat}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">{cat}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actions.filter((a) => a.category === cat).map((action) => {
              const s = variantCard[action.variant];
              return (
                <button
                  key={action.id}
                  onClick={() => run(action)}
                  disabled={loading !== null}
                  className={`flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${s.border}`}
                >
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}>
                    {loading === action.id ? <Spinner size="sm" /> : <action.Icon size={17} />}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-800">{action.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Result panel */}
      {result && (
        <div className="card p-5">
          <p className="mb-4 text-sm font-bold text-violet-900">Résultat</p>

          {result.type === 'error' && (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
              <IconX className="mt-0.5 shrink-0 text-red-500" size={17} />
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
                : 'border-red-100 bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                {result.data.status === 'ACCEPTED'
                  ? <IconCheck className="text-emerald-600" size={18} />
                  : <IconX className="text-red-500" size={18} />}
                <p className={`font-bold ${result.data.status === 'ACCEPTED' ? 'text-emerald-800' : 'text-red-700'}`}>
                  Dépôt {result.data.status === 'ACCEPTED' ? 'Accepté' : 'Rejeté'}
                </p>
              </div>
              <p className="mt-2 break-all font-mono text-xs text-zinc-400">ID : {result.data.depositId}</p>
              {result.data.nextStep && (
                <p className="mt-2 text-sm text-emerald-700">{result.data.nextStep}</p>
              )}
              {result.data.reason && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-red-600">Raison :</span>
                  <code className="rounded-lg bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    {result.data.reason}
                  </code>
                </div>
              )}
              {result.data.status === 'ACCEPTED' && (
                <div className="mt-3 space-y-2">
                  <p className="rounded-lg bg-emerald-100 px-3 py-2 text-xs text-emerald-600">
                    Statut final via webhook pawaPay · Écoutez{' '}
                    <code className="font-bold">score:updated</code> sur Socket.io
                  </p>
                  {/* Bouton USSD de secours — si le pop-up PIN ne s'affiche pas */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-xs font-semibold text-amber-800">
                      Pop-up PIN non reçu ?
                    </p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Composez le code USSD manuellement sur votre téléphone MTN :
                    </p>
                    <a
                      href="tel:*126#"
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
                    >
                      <IconPhone size={13} />
                      Composer *126# sur MTN
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {result.type === 'payout' && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
              <div className="flex items-center gap-2">
                <IconSend className="text-violet-600" size={17} />
                <p className="font-bold text-violet-800">Payout Accepté</p>
              </div>
              <p className="mt-2 break-all font-mono text-xs text-zinc-400">
                ID : {result.data.payoutId}
              </p>
              <p className="mt-3 rounded-lg bg-violet-100 px-3 py-2 text-xs text-violet-600">
                Crédit <strong>PENDING_DELIVERY</strong> → <strong>ACTIVE</strong> après webhook
                (due_date = J+14)
              </p>
            </div>
          )}

          {result.type === 'repayment' && (
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
              <div className="flex items-center gap-2">
                <IconRefresh className="text-purple-600" size={17} />
                <p className="font-bold text-purple-800">Remboursement initié</p>
              </div>
              <div className="mt-2 space-y-0.5">
                <p className="break-all font-mono text-xs text-zinc-400">Deposit : {result.data.depositId}</p>
                <p className="break-all font-mono text-xs text-zinc-400">Credit  : {result.data.creditId}</p>
              </div>
              <p className="mt-2 text-sm text-purple-700">{result.data.nextStep}</p>
            </div>
          )}

          {result.type !== 'error' && result.type !== 'walletLimit' && (
            <details className="mt-4">
              <summary className="cursor-pointer select-none text-xs font-medium text-zinc-400 hover:text-violet-600 transition-colors">
                Réponse JSON brute
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100">
                {JSON.stringify(
                  result.type === 'deposit'  ? result.data :
                  result.type === 'payout'   ? result.data :
                  result.data,
                  null, 2
                )}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Reference cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Boutiquiers de démo
          </p>
          <div className="space-y-2 text-xs">
            {[
              { key: 'A', id: DEMO_A, info: 'Amadou Diallo · Platine' },
              { key: 'B', id: DEMO_B, info: 'Boutiquier B — utilisé pour les payouts' },
            ].map(({ key, id, info }) => (
              <div key={key} className="rounded-lg bg-violet-50 p-3">
                <span className="font-bold text-violet-700">Boutiquier {key}</span>
                {info && <span className="ml-1.5 text-zinc-500">{info}</span>}
                <p className="mt-0.5 break-all font-mono text-zinc-400">{id}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Suffixes téléphone sandbox
          </p>
          <div className="space-y-2">
            {[
              { suffix: '…789', label: 'COMPLETED',            style: 'bg-emerald-50 text-emerald-700', Icon: IconCheck },
              { suffix: '…049', label: 'INSUFFICIENT_BALANCE', style: 'bg-red-50 text-red-700',         Icon: IconX },
              { suffix: '…039', label: 'PAYMENT_NOT_APPROVED', style: 'bg-red-50 text-red-700',         Icon: IconX },
              { suffix: '…029', label: 'PAYER_NOT_FOUND',      style: 'bg-zinc-100 text-zinc-600',      Icon: IconPhone },
              { suffix: '…099', label: 'WALLET_LIMIT_REACHED', style: 'bg-amber-50 text-amber-700',     Icon: IconWarning },
            ].map(({ suffix, label, style, Icon }) => (
              <div key={suffix} className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs">
                <code className="w-12 shrink-0 text-center font-bold text-zinc-600">{suffix}</code>
                <span className="text-zinc-300">→</span>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${style}`}>
                  <Icon size={12} />{label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// Wrapper Suspense requis par useSearchParams
export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-72 items-center justify-center text-zinc-400">
          <Spinner size="lg" />
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}