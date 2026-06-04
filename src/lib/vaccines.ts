/**
 * Vietnamese childhood immunisation schedule — the national EPI (Tiêm chủng
 * mở rộng) plus commonly-taken service vaccines, by age in months. Reference
 * only; brands/regions vary, so the copy points parents to their doctor.
 */
export interface VaccineItem {
  id: string;
  month: number; // recommended age in months (0 = newborn)
  name: string;
  note?: string;
}

export const VACCINE_SCHEDULE: VaccineItem[] = [
  { id: 'bcg', month: 0, name: 'Lao (BCG)', note: 'TCMR · trong tháng đầu' },
  { id: 'hepb0', month: 0, name: 'Viêm gan B (sơ sinh)', note: 'TCMR · trong 24h đầu' },
  { id: '6in1-1', month: 2, name: '6 trong 1 — mũi 1', note: 'Bạch hầu·Ho gà·Uốn ván·Hib·Bại liệt·VGB' },
  { id: 'rota-1', month: 2, name: 'Rota — liều 1', note: 'uống' },
  { id: 'pcv-1', month: 2, name: 'Phế cầu — mũi 1' },
  { id: '6in1-2', month: 3, name: '6 trong 1 — mũi 2' },
  { id: 'rota-2', month: 3, name: 'Rota — liều 2', note: 'uống' },
  { id: 'pcv-2', month: 3, name: 'Phế cầu — mũi 2' },
  { id: '6in1-3', month: 4, name: '6 trong 1 — mũi 3' },
  { id: 'pcv-3', month: 4, name: 'Phế cầu — mũi 3' },
  { id: 'flu-1', month: 6, name: 'Cúm — mũi 1', note: 'nhắc hằng năm' },
  { id: 'measles-1', month: 9, name: 'Sởi — mũi 1', note: 'TCMR' },
  { id: 'mmr-1', month: 12, name: 'Sởi·Quai bị·Rubella (MMR)' },
  { id: 'jev-1', month: 12, name: 'Viêm não Nhật Bản — mũi 1' },
  { id: 'varicella', month: 12, name: 'Thuỷ đậu' },
  { id: 'hepa', month: 12, name: 'Viêm gan A' },
  { id: 'pcv-4', month: 12, name: 'Phế cầu — nhắc' },
  { id: 'dpt4', month: 18, name: 'Bạch hầu·Ho gà·Uốn ván — nhắc', note: 'TCMR' },
  { id: 'mr2', month: 18, name: 'Sởi·Rubella (MR) — mũi 2', note: 'TCMR' },
];

export const ageLabel = (m: number): string => (m === 0 ? 'Sơ sinh' : `${m} tháng`);
