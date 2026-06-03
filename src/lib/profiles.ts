import { buildSeedCommits, NOW_BASE, LIVE_MESSAGES } from './seed';
import { timeAgo } from './time';
import { mulberry32, hashString } from './prng';
import type { CommitType } from './types';

export interface Profile {
  handle: string;
  name: string;
  week: number; // gestational week (their "build")
  bio: string;
  joinedDaysAgo: number;
}

export const PROFILES: Profile[] = [
  { handle: 'minh.dev', name: 'Minh Nguyễn', week: 31, bio: 'Backend dev, lần đầu làm bố. Đang debug giấc ngủ của con.', joinedDaysAgo: 210 },
  { handle: 'lan.codes', name: 'Lan Phạm', week: 12, bio: 'Frontend + mẹ bỉm. Ship UI ban ngày, ship sữa ban đêm.', joinedDaysAgo: 95 },
  { handle: 'nam.be', name: 'Nam Đỗ', week: 24, bio: 'DevOps. Tự động hoá mọi thứ, trừ việc dỗ con ngủ.', joinedDaysAgo: 160 },
  { handle: 'huong.ui', name: 'Hương Trần', week: 8, bio: 'UI/UX designer. Đang thiết kế phòng cho bé.', joinedDaysAgo: 60 },
  { handle: 'tuan.js', name: 'Tuấn Lê', week: 36, bio: 'Fullstack JS. Sắp lên chức bố, hồi hộp như deploy thứ 6.', joinedDaysAgo: 240 },
  { handle: 'dat.fs', name: 'Đạt Hoàng', week: 19, bio: 'Freelancer. Code một tay, bế con một tay.', joinedDaysAgo: 130 },
  { handle: 'quynh.qa', name: 'Quỳnh Bùi', week: 27, bio: 'QA engineer. Test mọi loại bỉm để tìm bug rò rỉ.', joinedDaysAgo: 180 },
  { handle: 'long.rs', name: 'Long Phan', week: 39, bio: 'Rustacean. Sắp release v1.0.0 — không còn panic nữa.', joinedDaysAgo: 270 },
  { handle: 'khoa.ml', name: 'Khoa Đặng', week: 15, bio: 'ML engineer. Đang train model nhận diện tiếng khóc.', joinedDaysAgo: 110 },
  { handle: 'thao.mobile', name: 'Thảo Lý', week: 22, bio: 'Mobile dev. Một app, một bé — hai dự án lớn nhất đời.', joinedDaysAgo: 150 },
  { handle: 'mai.pm', name: 'Mai Ngô', week: 33, bio: 'Product manager. Quản lý sprint và cả lịch ăn ngủ của con.', joinedDaysAgo: 320 },
  { handle: 'phuong.data', name: 'Phương Vũ', week: 6, bio: 'Data engineer. Pipeline dữ liệu thì ổn, pipeline giấc ngủ chưa.', joinedDaysAgo: 45 },
  // postpartum (stage value 41 = newborn, +1 per month)
  { handle: 'huy.android', name: 'Huy Vũ', week: 44, bio: 'Android dev. Con 3 tháng — ngủ xuyên đêm là KPI lớn nhất quý này.', joinedDaysAgo: 300 },
  { handle: 'chi.devops', name: 'Chi Lê', week: 49, bio: 'DevOps mom. Con biết bò, nhà thành production cần monitoring 24/7.', joinedDaysAgo: 430 },
  { handle: 'son.fe', name: 'Sơn Phạm', week: 55, bio: 'Frontend. Con biết đi rồi — mọi thứ trong nhà giờ đều interactive.', joinedDaysAgo: 520 },
];

const BY = new Map(PROFILES.map((p) => [p.handle, p]));
export const getProfile = (handle: string): Profile | undefined => BY.get(handle);
export const profileHandles = (): string[] => PROFILES.map((p) => p.handle);

export interface PCommit {
  type: CommitType;
  message: string;
  ago: string;
  reactions: number;
}

const AGOS = ['2h', '5h', '8h', '1d', '2d', '4d', '1w', '2w'];

/** A believable commit history for a community member (deterministic). */
export function profileCommits(handle: string): PCommit[] {
  const own = buildSeedCommits(NOW_BASE)
    .filter((c) => c.author.handle === handle)
    .map((c) => ({
      type: c.type,
      message: c.message,
      ago: timeAgo(c.at, NOW_BASE),
      reactions: c.reactions.ship + c.reactions.love + c.reactions.lgtm,
    }));
  const rng = mulberry32(hashString('pc-' + handle));
  const extra: PCommit[] = Array.from({ length: 5 }, () => {
    const m = LIVE_MESSAGES[Math.floor(rng() * LIVE_MESSAGES.length)];
    return {
      type: m.type,
      message: m.msg,
      ago: AGOS[Math.floor(rng() * AGOS.length)],
      reactions: Math.floor(rng() * 24),
    };
  });
  return [...own, ...extra].slice(0, 7);
}

export const HEAT_DAYS = 18 * 7;

/** Deterministic contribution heatmap levels (0–3) for a community member. */
export function fauxHeat(handle: string): number[] {
  const rng = mulberry32(hashString('heat-' + handle));
  return Array.from({ length: HEAT_DAYS }, () => {
    const r = rng();
    return r > 0.8 ? 3 : r > 0.63 ? 2 : r > 0.42 ? 1 : 0;
  });
}
export const fauxStreak = (handle: string): number => 2 + (hashString('s-' + handle) % 21);
export const fauxCommitCount = (handle: string): number => 40 + (hashString('cc-' + handle) % 180);

export function joinedLabelFromDays(days: number): string {
  if (days < 30) return `${days} ngày trước`;
  if (days < 365) return `~${Math.round(days / 30)} tháng trước`;
  return 'hơn 1 năm trước';
}
