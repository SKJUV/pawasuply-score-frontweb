// Route dev — simule un callback webhook COMPLETED vers le backend.
// Utilisé uniquement en mode développeur (clé ps_dev).

export async function POST(req: Request) {
  const url    = new URL(req.url);
  const key    = url.searchParams.get('key') ?? '';
  const expected = process.env.NEXT_PUBLIC_DEV_KEY ?? '';

  if (expected && key !== expected) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    payoutId?: string;
    creditId?: string;
    boutiquierId?: string;
  };

  const backend = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const payoutId = body.payoutId ?? body.creditId ?? '';

  if (!payoutId) {
    return Response.json({ error: 'payoutId requis' }, { status: 400 });
  }

  // Envoie un faux webhook COMPLETED au backend
  const webhookPayload = {
    payoutId,
    status:  'COMPLETED',
    amount:  '50000',
    currency: 'XAF',
    country:  'CMR',
    recipient: {
      type: 'MMO',
      accountDetails: { phoneNumber: '237671234567', provider: 'MTN_MOMO_CMR' },
    },
    financialTransactionId: `DEV-COMPLETE-${Date.now()}`,
  };

  try {
    const res = await fetch(`${backend}/pawapay/webhook`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(webhookPayload),
    });
    const data = await res.json().catch(() => ({}));
    return Response.json({ ok: true, webhookResponse: data });
  } catch (err) {
    return Response.json(
      { error: `Impossible de joindre le backend : ${String(err)}` },
      { status: 502 }
    );
  }
}
