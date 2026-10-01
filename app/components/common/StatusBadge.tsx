interface Props { status: 'live' | 'fallback' | 'unavailable'; }
export function StatusBadge({ status }: Props) {
  const label = status === 'live' ? 'Live' : status === 'fallback' ? 'Cached source' : 'Unavailable';
  return <span className={`status-badge status-${status}`} aria-label={`Market data status: ${label}`}>{label}</span>;
}
