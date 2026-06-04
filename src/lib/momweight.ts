/**
 * Mom's pregnancy weight-gain tracker. Local-first. Recommended total gain is
 * based on pre-pregnancy BMI (IOM/Viện Y học guidelines); the per-week band is a
 * simple interpolation (small in T1, ~steady through T2–T3). Reference only.
 */
export interface MomEntry {
  week: number;
  weightKg: number;
  at: number;
}

export interface MomData {
  prePregWeightKg?: number;
  heightCm?: number;
  entries: MomEntry[];
}

export interface GainRange {
  key: string;
  label: string;
  min: number;
  max: number;
}

export const bmiOf = (weightKg: number, heightCm: number): number => {
  const h = heightCm / 100;
  return h > 0 ? weightKg / (h * h) : 0;
};

export function gainRange(bmi: number): GainRange {
  if (bmi < 18.5) return { key: 'under', label: 'nhẹ cân', min: 12.5, max: 18 };
  if (bmi < 25) return { key: 'normal', label: 'bình thường', min: 11.5, max: 16 };
  if (bmi < 30) return { key: 'over', label: 'thừa cân', min: 7, max: 11.5 };
  return { key: 'obese', label: 'thừa cân nhiều', min: 5, max: 9 };
}

/** Recommended cumulative weight-gain bounds (kg) at a gestational week. */
export function recommendedBand(week: number, range: GainRange): { lo: number; hi: number } {
  const w = Math.max(0, Math.min(40, week));
  if (w <= 13) return { lo: (w / 13) * 0.5, hi: (w / 13) * 2 };
  const t = (w - 13) / (40 - 13);
  return { lo: 0.5 + t * (range.min - 0.5), hi: 2 + t * (range.max - 2) };
}
