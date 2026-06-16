export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz =
    size === 'sm' ? 'h-4 w-4 border-2' :
    size === 'lg' ? 'h-10 w-10 border-[3px]' :
                    'h-6 w-6 border-2';
  return (
    <div
      className={`animate-spin rounded-full border-violet-200 border-t-violet-600 ${sz}`}
      role="status"
      aria-label="Chargement"
    />
  );
}
