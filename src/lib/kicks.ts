/**
 * Fetal kick counter ("đếm cử động thai"). Local-first sessions using the
 * classic count-to-10 method. Reframed in the app's git metaphor: each kick is
 * a tiny commit the baby pushes.
 */
export interface KickSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  /** kick timestamps (ms) */
  kicks: number[];
}

export const KICK_GOAL = 10;
export const MAX_SESSIONS = 30;

/** Compact duration label, e.g. "8m 12s" / "47s". */
export function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m <= 0) return `${s}s`;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export const isActive = (s: KickSession | undefined): s is KickSession => !!s && !s.endedAt;
