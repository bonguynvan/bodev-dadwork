import { mulberry32, pick } from './prng';

const ADJ = [
  'sleepy', 'caffeinated', 'async', 'lazy', 'eager', 'nightly',
  'stable', 'flaky', 'hotfix', 'verbose', 'quiet', 'rusty',
];
const NOUN = [
  'dad', 'mom', 'dev', 'parent', 'shipper', 'committer',
  'maintainer', 'builder', 'hacker', 'debugger', 'pusher', 'merger',
];

/** A deterministic-from-seed display handle, e.g. "sleepy.dad_482". */
export function makeHandle(seed: number): string {
  const rng = mulberry32(seed);
  const a = pick(rng, ADJ);
  const n = pick(rng, NOUN);
  const num = 100 + Math.floor(rng() * 900);
  return `${a}.${n}_${num}`;
}

export function makeName(handle: string): string {
  const base = handle.split(/[._]/).slice(0, 2).join(' ');
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}
