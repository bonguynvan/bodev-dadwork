/** Compact "time ago" label, Vietnamese-flavoured. */
export function timeAgo(at: number, now: number): string {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 8) return 'vừa xong';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  return `${w}w`;
}

/** Epoch-day number (UTC) for streak/heatmap bucketing. */
export function epochDay(at: number): number {
  return Math.floor(at / 86_400_000);
}
