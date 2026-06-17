import fs from 'fs/promises';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'server-logs', 'client-logs.jsonl');

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get('key') ?? '';
    const expected = process.env.NEXT_PUBLIC_DEV_KEY ?? '';
    if (expected && key !== expected) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => null);
    if (!body) return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    const line = JSON.stringify({ received_at: new Date().toISOString(), body }) + '\n';
    await fs.appendFile(LOG_FILE, line);

    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(req: Request) {
  try {
    const file = LOG_FILE;
    const raw = await fs.readFile(file, 'utf8').catch(() => '');
    const lines = raw.trim() ? raw.trim().split('\n') : [];
    const parsed = lines.map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean).reverse(); // newest first

    const url = new URL(req.url);
    const limit = Math.min(200, parseInt(url.searchParams.get('limit') ?? '50') || 50);
    return new Response(JSON.stringify({ count: parsed.length, entries: parsed.slice(0, limit) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
