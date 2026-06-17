// Stub — redirige vers le backend réel.
export async function POST() {
  return Response.json(
    { error: 'Utilisez directement POST /payouts sur le backend.' },
    { status: 501 }
  );
}
