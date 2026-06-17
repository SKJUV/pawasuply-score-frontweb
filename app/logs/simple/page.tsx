'use client';

import { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';

type SimpleLog = {
  ts: string;
  method?: string;
  path?: string;
  status?: number | null;
};

interface RawEntry {
  received_at?: string;
  ts?: string;
  body?: {
    method?: string;
    path?: string;
    status?: number | null;
    request?: {
      method?: string;
      path?: string;
    };
    response?: {
      status?: number | null;
    };
  };
}

export default function SimpleLogsPage() {
  const [logs, setLogs] = useState<SimpleLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/client-logs?limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setLogs(
          (data.entries ?? []).map((e: RawEntry) => ({
            ts: e.received_at ?? e.ts ?? '',
            method: e.body?.method ?? e.body?.request?.method ?? undefined,
            path: e.body?.path ?? e.body?.request?.path ?? undefined,
            status: e.body?.status ?? e.body?.response?.status ?? undefined,
          }))
        );
      })
      .catch((e) => { if (!mounted) return; setError((e as Error).message); })
    return () => { mounted = false; };
  }, []);

  if (error) return <div className="text-red-600">Erreur : {error}</div>;
  if (!logs) return (
    <div className="flex h-40 items-center justify-center"><Spinner /></div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Logs récents</h1>
      <p className="text-sm text-zinc-500">Vue simplifiée pour les utilisateurs — montre l&apos;heure, la méthode et le chemin.</p>
      <div className="card overflow-hidden">
        <div className="px-4 py-2 text-xs text-zinc-400 flex gap-4">
          <div className="w-24">Heure</div>
          <div className="w-20">Méthode</div>
          <div className="flex-1">Chemin</div>
          <div className="w-16 text-right">Statut</div>
        </div>
        <div>
          {logs.length === 0 ? (
            <div className="p-6 text-zinc-400">Aucun log disponible.</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-t border-zinc-100">
                <div className="w-24 font-mono text-xs text-zinc-500">{new Date(l.ts).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala', hour12: false })}</div>
                <div className="w-20 text-xs font-semibold">{l.method ?? '-'}</div>
                <div className="flex-1 truncate text-xs text-zinc-700">{l.path ?? '-'}</div>
                <div className="w-16 text-right text-xs text-zinc-500">{l.status ?? '-'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
