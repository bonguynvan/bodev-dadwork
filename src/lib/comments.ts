import { mulberry32, hashString } from './prng';

export interface Comment {
  id: string;
  author: { handle: string; name: string };
  text: string;
  at: number; // epoch ms (user comments); seeded use `ago`
  ago?: string; // baked relative label for seeded comments
  mine?: boolean;
}

const COMMENTERS = [
  { handle: 'minh.dev', name: 'Minh Nguyễn' },
  { handle: 'lan.codes', name: 'Lan Phạm' },
  { handle: 'nam.be', name: 'Nam Đỗ' },
  { handle: 'tuan.js', name: 'Tuấn Lê' },
  { handle: 'dat.fs', name: 'Đạt Hoàng' },
  { handle: 'long.rs', name: 'Long Phan' },
  { handle: 'khoa.ml', name: 'Khoa Đặng' },
  { handle: 'mai.pm', name: 'Mai Ngô' },
];

const TEXTS = [
  'Chúc mừng bố nhé! 🎉',
  'Mình cũng đang ở giai đoạn này 😅',
  'Cố lên, sắp tới đích rồi! 🚀',
  'LGTM, ship it! 🚀',
  'Đêm nay lại thức trắng đây 😴',
  'Bé nhà mình hồi đó cũng y chang!',
  'Heroic. Respect bố 🙌',
  'Caffeine cứu cả thế giới, tin mình đi ☕',
  'Khoảnh khắc vàng, lưu lại liền nha 📸',
  'Same here, hai bố cùng cảnh ngộ 🤝',
  'Hóng update tập tiếp theo 👀',
  'Mạnh mẽ lên, bố làm được mà 💪',
  'Cười không nhặt được mồm 🤣',
  'Bug này khó fix lắm đây 😂',
  'Để lại bí kíp cho anh em với 🙏',
];

const AGOS = ['1h', '3h', '6h', '12h', '1d', '2d', '3d'];

/** Deterministic community replies for a seeded commit (0–3). */
export function seededComments(commitId: string): Comment[] {
  if (!commitId.startsWith('seed-')) return [];
  const rng = mulberry32(hashString('cm-' + commitId));
  const n = Math.floor(rng() * 3.4); // 0..3
  return Array.from({ length: n }, (_, i) => {
    const a = COMMENTERS[Math.floor(rng() * COMMENTERS.length)];
    return {
      id: `${commitId}-c${i}`,
      author: a,
      text: TEXTS[Math.floor(rng() * TEXTS.length)],
      at: 0,
      ago: AGOS[Math.floor(rng() * AGOS.length)],
    } satisfies Comment;
  });
}
