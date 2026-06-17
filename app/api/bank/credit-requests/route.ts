// Cette route est un stub — la gestion des demandes de crédit
// est traitée directement par le backend Node.js via POST /payouts.
// Elle renvoie toujours une liste vide pour éviter les erreurs silencieuses.

export async function GET() {
  return Response.json({ count: 0, requests: [] });
}

export async function POST() {
  return Response.json(
    { error: 'Utilisez directement POST /payouts sur le backend.' },
    { status: 501 }
  );
}
