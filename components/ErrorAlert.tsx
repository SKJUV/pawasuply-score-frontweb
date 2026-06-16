import { IconWarning, IconRefresh } from './icons';

export default function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
      <IconWarning className="mt-0.5 shrink-0 text-red-500" size={18} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700">Une erreur est survenue</p>
        <p className="mt-0.5 text-sm text-red-600">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <IconRefresh size={13} />
          Réessayer
        </button>
      )}
    </div>
  );
}
