/**
 * Postpartum quick-log: feed / sleep / diaper events. Local-first. The newborn
 * counterpart to the kick counter — each entry is a tiny commit in the baby's day.
 */
export type LogKind = 'feed' | 'sleep' | 'diaper';

export interface LogEvent {
  id: string;
  kind: LogKind;
  at: number;
}

export const LOG_KINDS: LogKind[] = ['feed', 'sleep', 'diaper'];
export const LOG_MAX = 200;

export const LOG_META: Record<LogKind, { emoji: string; label: string; verb: string }> = {
  feed: { emoji: '🍼', label: 'cữ bú', verb: 'cho bú' },
  sleep: { emoji: '💤', label: 'giấc ngủ', verb: 'ngủ' },
  diaper: { emoji: '💩', label: 'lần thay tã', verb: 'thay tã' },
};

/** Local midnight (ms) for "today" bucketing. */
export function startOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
