const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// ── In-memory log store (client-side only) ────────────────────────────────────
export interface ApiLogEntry {
  id:         string;
  ts:         string;          // ISO timestamp
  method:     string;
  path:       string;
  status:     number | null;   // null = network error
  ok:         boolean;
  durationMs: number;
  requestBody?: unknown;
  responseBody?: unknown;
  error?:     string;
}

const MAX_LOGS = 200;
let   _logs: ApiLogEntry[] = [];
const _listeners: Array<(logs: ApiLogEntry[]) => void> = [];

function pushLog(entry: ApiLogEntry) {
  _logs = [entry, ..._logs].slice(0, MAX_LOGS);
  _listeners.forEach((fn) => fn([..._logs]));
}

export function subscribeLogs(fn: (logs: ApiLogEntry[]) => void) {
  _listeners.push(fn);
  fn([..._logs]);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i >= 0) _listeners.splice(i, 1);
  };
}

export function getLogs() { return [..._logs]; }
export function clearLogs() { _logs = []; _listeners.forEach((fn) => fn([])); }

// ── Core fetch ────────────────────────────────────────────────────────────────
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const t0     = Date.now();
  const id     = crypto.randomUUID();
  let   requestBody: unknown;

  try {
    requestBody = options.body ? JSON.parse(options.body as string) : undefined;
  } catch { /* not JSON */ }

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const durationMs = Date.now() - t0;
    let responseBody: unknown;
    let cloned: unknown;

    try { cloned = await res.clone().json(); responseBody = cloned; } catch { /* not JSON */ }

    const entry: ApiLogEntry = {
      id, ts: new Date().toISOString(), method, path,
      status: res.status, ok: res.ok, durationMs, requestBody, responseBody,
    };
    pushLog(entry);

    if (!res.ok) {
      const err = (responseBody as { error?: string }) ?? {};
      throw new ApiError(err.error ?? res.statusText, res.status, responseBody);
    }

    return responseBody as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;

    const entry: ApiLogEntry = {
      id, ts: new Date().toISOString(), method, path,
      status: null, ok: false, durationMs: Date.now() - t0,
      requestBody, error: (e as Error).message,
    };
    pushLog(entry);
    throw e;
  }
}
