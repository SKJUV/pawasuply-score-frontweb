export default function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
      <span className="mt-0.5 text-lg">⚠️</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700">Une erreur est survenue</p>
        <p className="mt-0.5 text-sm text-red-600">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
