import {
  getWeek,
  weekMood,
  dadTasks,
  buildPercent,
  weeksRemaining,
  trimesterLabel,
  MAX_WEEK,
} from './pregnancy';
import type { Mood, DadTask } from './pregnancy';
import { getMonth, monthVersion } from './postpartum';

// One continuous slider value:
//   4..40  → gestational week (womb)
//   41..65 → postpartum month 0..24 (born); 41 = newborn (month 0)
export const STAGE_MIN = 4;
export const BORN_AT = 41;
export const STAGE_MAX = BORN_AT + 24; // 65
export const DEFAULT_STAGE = 20;

export const clampStage = (v: number): number => {
  if (Number.isNaN(v)) return DEFAULT_STAGE;
  return Math.max(STAGE_MIN, Math.min(STAGE_MAX, Math.round(v)));
};
export const isBorn = (v: number): boolean => clampStage(v) >= BORN_AT;
export const monthOf = (v: number): number => clampStage(v) - BORN_AT;

export interface StageInfo {
  phase: 'womb' | 'born';
  key: string; // 'w24' | 'm6'
  label: string; // 'tuần 24' | 'sơ sinh' | 'tháng 6'
  sub: string; // 'tam cá nguyệt 2' | 'đã sinh · v1.6.0'
  version: string; // 'build v1.0.0' | 'v1.6.0'
  lengthCm: number;
  weightG: number;
  compare: string;
  emoji: string;
  milestone: string;
  mood: Mood;
  dad: DadTask[];
  pct: number; // progress: gestation→v1.0.0, or age→2 tuổi
  week?: number;
  month?: number;
  weeksLeft?: number;
}

export function getStage(v: number): StageInfo {
  const s = clampStage(v);
  if (s < BORN_AT) {
    const info = getWeek(s);
    return {
      phase: 'womb',
      key: `w${s}`,
      label: `tuần ${s}`,
      sub: trimesterLabel(info.trimester),
      version: 'build v1.0.0',
      lengthCm: info.lengthCm,
      weightG: info.weightG,
      compare: info.compare,
      emoji: info.emoji,
      milestone: info.milestone,
      mood: weekMood(s),
      dad: dadTasks(s),
      pct: buildPercent(s),
      week: s,
      weeksLeft: weeksRemaining(s),
    };
  }
  const m = monthOf(s);
  const info = getMonth(m);
  const version = monthVersion(m);
  return {
    phase: 'born',
    key: `m${m}`,
    label: m === 0 ? 'trẻ sơ sinh' : `tháng ${m}`,
    sub: 'đã sinh 🎉',
    version,
    lengthCm: info.lengthCm,
    weightG: info.weightG,
    compare: info.compare,
    emoji: info.emoji,
    milestone: info.milestone,
    mood: info.mood,
    dad: info.dad,
    pct: Math.round((m / 24) * 100),
    month: m,
  };
}

export { MAX_WEEK };
