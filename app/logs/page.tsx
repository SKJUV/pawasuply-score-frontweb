'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscribeLogs, clearLogs, type ApiLogEntry } from '@/lib/api';
import { IconLogs, IconTrash, IconChevronDown, IconLock, IconLive } from '@/components/icons';

const DEV_KEY = process.env.NEXT_PUBLIC_DEV_KEY ?? 'dev';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, ok }: { status: number | null; ok: boolean }) {
  if (status === null) {
    return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-500">ERR</span>;
  }
  const cls =
    ok             ? 'bg-emerald-100 text-emerald-700' :
    status >= 500  ? 'bg-red-100 text-red-700'         :
    status >= 400  ? 'bg-orange-100 text-orange-700'   :
                     'bg-zinc-100 text-zinc-600';
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${cls}`}>{status}</span>;
}

// ── Method badge ──────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: string }) {
  const cls =
    method === 'GET'    ? 'bg-blue-50 text-blue-700'     :
    method === 'POST'   ? 'bg-violet-50 text-violet-700' :
    method === 'PUT'    ? 'bg-amber-50 text-amber-700'   :
    method === 'DELETE' ? 'bg-red-50 text-red-700'       :
                          'bg-zinc-50 text-zinc-600';
  return <span className={`w-14 rounded px-1.5 py-0.5 text-center text-xs font-bold ${cls}`}>{method}</span>;
}

// ── Log row ───────────────────────────────────────────────────────────────────
function LogRow({ entry }: { entry: ApiLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const ts = new Date(entry.ts).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala', hour12: false });

  return (
    <div className={`border-b border-zinc-100 transition-colors last:border-0 ${!entry.ok ? 'bg-red-50/30' : ''}`}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-violet-50/40 transition-colors"
      >
        {/* Time */}
        <span className="w-20 shrink-0 font-mono text-xs text-zinc-400 tabular-nums">{ts}</span>

        {/* Method */}
        <MethodBadge method={entry.method} />

        {/* Path */}
        <span className="flex-1 truncate font-mono text-xs text-zinc-700">{entry.path}</span>

        {/* Status */}
        <StatusBadge status={entry.status} ok={entry.ok} />

        {/* Duration */}
        <span className="w-16 text-right font-mono text-xs tabular-nums text-zinc-400">
          {entry.durationMs}ms
        </span>

        {/* Expand chevron */}
        <IconChevronDown
          size={14}
          className={`shrink-0 text-zinc-300 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-950 px-4 py-3">
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            {entry.requestBody !== undefined && (
              <div>
                <p className="mb-1 font-semibold text-zinc-400">Request body</p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all text-emerald-300">
                  {JSON.stringify(entry.requestBody, null, 2)}
                </pre>
              </div>
            )}
            {entry.responseBody !== undefined && (
              <div>
                <p className="mb-1 font-semibold text-zinc-400">Response body</p>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all text-violet-300">
                  {JSON.stringify(entry.responseBody, null, 2)}
                </pre>
              </div>
            )}
            {entry.error && (
              <div className="sm:col-span-2">
                <p className="mb-1 font-semibold text-zinc-400">Error</p>
                <pre className="whitespace-pre-wrap break-all text-red-400">{entry.error}</pre>
              </div>
            )}
          </div>
          <p className="mt-2 font-mono text-[10px] text-zinc-600">id: {entry.id}</p>
        </div>
      )}
    </div>
  );
}

// ── Access gate ───────────────────────────────────────────────────────────────
function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() === DEV_KEY) {
      sessionStorage.setItem('ps_dev', DEV_KEY);
      onUnlock();
    } else {
      setError(true);
      setInput('');
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <IconLock size={28} />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-violet-900">Accès restreint</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Cette page est réservée aux développeurs et n&apos;est pas visible des utilisateurs.
        </p>
      </div>
      <form onSubmit={submit} className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          placeholder="Clé d'accès développeur"
          autoFocus
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-violet-100 ${
            error ? 'border-red-300 bg-red-50' : 'border-violet-200 bg-violet-50/40 focus:border-violet-400'
          }`}
        />
        {error && <p className="text-xs text-red-600">Clé incorrecte.</p>}
        <button
          type="submit"
          className="rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
        >
          Déverrouiller
        </button>
      </form>
      <p className="text-xs text-zinc-400">
        Clé par défaut : variable <code className="rounded bg-zinc-100 px-1 font-mono">NEXT_PUBLIC_DEV_KEY</code>
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const [unlocked,  setUnlocked]  = useState(false);
  const [logs,      setLogs]      = useState<ApiLogEntry[]>([]);
  const [filter,    setFilter]    = useState<'all' | 'ok' | 'error'>('all');
  const [search,    setSearch]    = useState('');
  // Check session unlock
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ps_dev') === DEV_KEY) {
      Promise.resolve().then(() => {
        setUnlocked(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    return subscribeLogs(setLogs);
  }, [unlocked]);

  const handleClear = useCallback(() => clearLogs(), []);

  if (!unlocked) {
    return <AccessGate onUnlock={() => setUnlocked(true)} />;
  }

  const filtered = logs.filter((l) => {
    if (filter === 'ok'    && !l.ok)  return false;
    if (filter === 'error' && l.ok)   return false;
    if (search && !l.path.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const countOk  = logs.filter((l) => l.ok).length;
  const countErr = logs.filter((l) => !l.ok).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <IconLogs className="text-violet-600" size={20} />
            <h1 className="text-2xl font-bold text-violet-900">Logs API</h1>
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">
            Journal client des appels vers le backend — session courante uniquement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {countOk} OK
          </span>
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
            {countErr} erreurs
          </span>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <IconTrash size={13} />
            Vider
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <IconLock className="mt-0.5 shrink-0 text-amber-500" size={16} />
        <p>
          Cette page est <strong>protégée</strong> et n&apos;est accessible qu&apos;aux développeurs via la clé de session.
          Elle ne fait pas partie de la navigation utilisateur.
        </p>
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer par chemin…"
            className="w-full rounded-xl border border-violet-200 bg-violet-50/40 py-2 pl-3 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-xl border border-zinc-100 bg-zinc-50 p-1">
          {(['all', 'ok', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'ok' ? 'Succès' : 'Erreurs'}
            </button>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <IconLive className="live-dot text-violet-500" size={7} />
          Temps réel · {filtered.length} entrées
        </div>
      </div>

      {/* Log list */}
      <div className="card overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center gap-3 border-b border-violet-50 bg-zinc-50 px-4 py-2">
          <span className="w-20 text-xs font-semibold uppercase tracking-wider text-zinc-400">Heure</span>
          <span className="w-14 text-xs font-semibold uppercase tracking-wider text-zinc-400">Méth.</span>
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">Chemin</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Statut</span>
          <span className="w-16 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Durée</span>
          <span className="w-4" />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-300">
            <IconLogs size={32} className="opacity-30" />
            <p className="text-sm">
              {logs.length === 0
                ? 'Aucun appel API enregistré — naviguez dans l&apos;app pour générer des logs.'
                : 'Aucun résultat pour ce filtre.'}
            </p>
          </div>
        ) : (
          <div id="log-list">
            {filtered.map((entry) => (
              <LogRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-zinc-300">
        Maximum {200} entrées conservées en mémoire · Données perdues au rechargement de la page
      </p>
    </div>
  );
}
