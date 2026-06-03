import { mulberry32 } from './prng';

/**
 * "Tên ở nhà" (affectionate home names) Vietnamese parents use before/after
 * birth — the baby's codename for v1.0.0. A few dev-flavoured ones mixed in.
 */
export interface NameIdea {
  name: string;
  emoji: string;
}

export const HOME_NAMES: NameIdea[] = [
  { name: 'Bún', emoji: '🍜' },
  { name: 'Bắp', emoji: '🌽' },
  { name: 'Bống', emoji: '🐟' },
  { name: 'Mít', emoji: '🟡' },
  { name: 'Sóc', emoji: '🐿️' },
  { name: 'Nấm', emoji: '🍄' },
  { name: 'Xíu', emoji: '🐣' },
  { name: 'Tép', emoji: '🦐' },
  { name: 'Kẹo', emoji: '🍬' },
  { name: 'Bơ', emoji: '🥑' },
  { name: 'Dâu', emoji: '🍓' },
  { name: 'Cốm', emoji: '🌾' },
  { name: 'Đậu', emoji: '🫘' },
  { name: 'Su', emoji: '🥬' },
  { name: 'Tôm', emoji: '🦞' },
  { name: 'Na', emoji: '🍈' },
  { name: 'Ổi', emoji: '🟢' },
  { name: 'Mây', emoji: '☁️' },
  { name: 'Cà', emoji: '🍅' },
  { name: 'Bi', emoji: '🔵' },
  { name: 'Min', emoji: '🌙' },
  { name: 'Cherry', emoji: '🍒' },
  // dev codenames, for fun
  { name: 'Pixel', emoji: '🟦' },
  { name: 'Bit', emoji: '💾' },
  { name: 'Cookie', emoji: '🍪' },
  { name: 'Nimbus', emoji: '⛅' },
  { name: 'Echo', emoji: '🔊' },
  { name: 'Kernel', emoji: '🌽' },
];

/** A stable shuffled subset for the given seed (changes when the seed changes). */
export function suggestNames(count: number, seed: number): NameIdea[] {
  const rng = mulberry32((seed * 2654435761 + 12345) >>> 0);
  const pool = [...HOME_NAMES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
