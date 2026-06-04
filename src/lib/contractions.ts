/**
 * Contraction timer ("đếm cơn gò") for late pregnancy / early labour. Local-first.
 * Times each contraction and the interval between starts so parents can apply
 * the 5-1-1 rule. Reference only — always follow the doctor.
 */
export interface Contraction {
  id: string;
  start: number;
  end?: number;
}

export const CONTRACTION_MAX = 60;

/** m:ss duration label. */
export function fmtMMSS(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
