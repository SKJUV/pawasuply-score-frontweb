export default function WalletLimitAlert({ grossisteName }: { grossisteName?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
        ⚠️
      </div>
      <div>
        <p className="font-semibold text-amber-900">Limite portefeuille atteinte</p>
        <p className="mt-0.5 text-sm text-amber-700">
          Le portefeuille Mobile Money{grossisteName ? ` de ${grossisteName}` : ''} a atteint
          sa limite (WALLET_LIMIT_REACHED). Le crédit a été{' '}
          <strong>annulé (CANCELLED)</strong> — aucune pénalité de score pour le boutiquier.
        </p>
      </div>
    </div>
  );
}
