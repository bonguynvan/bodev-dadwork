/**
 * Postpartum growth tracker. Parents log weight/height at checkups; the chart
 * plots them against the typical-for-age curve (from postpartum.ts MONTHS).
 * Local-first. One entry per age-month (a new measurement replaces the old).
 */
export interface GrowthEntry {
  id: string;
  at: number; // when recorded
  month: number; // baby's age in months at measurement (0–24)
  weightKg?: number;
  heightCm?: number;
  headCm?: number; // head circumference (vòng đầu)
}

export const GROWTH_MAX = 60;
