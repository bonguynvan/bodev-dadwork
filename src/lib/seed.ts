import type { Commit, CommitType, ReactionKind } from './types';

/**
 * Fixed reference "now" used ONLY for the deterministic initial render.
 * On mount the client rebases every commit's `at` against the real clock,
 * so the relative ages ("3m", "1h") stay correct and start ticking.
 */
export const NOW_BASE = 1_900_000_000_000;

interface SeedSpec {
  type: CommitType;
  handle: string;
  name: string;
  msg: string;
  ago: number; // seconds before NOW_BASE
  r: [number, number, number]; // ship, love, lgtm
  lane: number;
  merge?: boolean;
}

const SPEC: SeedSpec[] = [
  { type: 'feat', handle: 'minh.dev', name: 'Minh Nguyễn', msg: 'con biết lẫy rồi — rollover v1.0 đã shipped 🎉', ago: 95, r: [12, 8, 5], lane: 0 },
  { type: 'fix', handle: 'lan.codes', name: 'Lan Phạm', msg: 'hotfix 3 giờ sáng: con sốt mọc răng, đã hạ sốt', ago: 320, r: [4, 9, 2], lane: 0 },
  { type: 'perf', handle: 'nam.be', name: 'Nam Đỗ', msg: 'con ngủ xuyên đêm 7 tiếng — tối ưu giấc ngủ thành công 🚀', ago: 540, r: [21, 14, 9], lane: 0 },
  { type: 'feat', handle: 'huong.ui', name: 'Hương Trần', msg: "first words: con gọi 'ba' trước 'mẹ', speech module online", ago: 900, r: [17, 22, 4], lane: 0 },
  { type: 'docs', handle: 'phuong.data', name: 'Phương Vũ', msg: 'review 4 loại bỉm sau 6 tháng benchmark thực chiến', ago: 1500, r: [3, 2, 11], lane: 1, merge: true },
  { type: 'test', handle: 'quynh.qa', name: 'Quỳnh Bùi', msg: 'siêu âm tuần 20: tất cả chỉ số test đều pass ❤', ago: 2400, r: [9, 31, 3], lane: 0 },
  { type: 'feat', handle: 'tuan.js', name: 'Tuấn Lê', msg: 'con tự xúc cơm — autonomy feature đã merge vào main', ago: 3600, r: [14, 6, 8], lane: 0 },
  { type: 'fix', handle: 'dat.fs', name: 'Đạt Hoàng', msg: 'revert: cho ăn dặm sớm quá, rollback về sữa mẹ', ago: 5200, r: [2, 1, 15], lane: 1, merge: true },
  { type: 'refactor', handle: 'mai.pm', name: 'Mai Ngô', msg: 'đổi lịch sinh hoạt cả nhà để con đi mẫu giáo đúng giờ', ago: 7200, r: [6, 4, 3], lane: 0 },
  { type: 'feat', handle: 'long.rs', name: 'Long Phan', msg: 'con biết đi! 12 tháng, walk() chạy không còn panic 🦀', ago: 9000, r: [40, 18, 12], lane: 0 },
  { type: 'chore', handle: 'khoa.ml', name: 'Khoa Đặng', msg: 'archive đồ sơ sinh v0, để dành cho bản phát hành tiếp theo', ago: 12600, r: [3, 7, 2], lane: 0 },
  { type: 'fix', handle: 'minh.dev', name: 'Minh Nguyễn', msg: 'đêm thứ 4 mất ngủ liên tiếp, patch thêm caffeine cho bố', ago: 18000, r: [8, 2, 19], lane: 0 },
  { type: 'feat', handle: 'thao.mobile', name: 'Thảo Lý', msg: 'deploy nhà trẻ ngày đầu tiên — con khóc, mẹ cũng khóc', ago: 26000, r: [11, 27, 3], lane: 0 },
  { type: 'feat', handle: 'lan.codes', name: 'Lan Phạm', msg: 'thôi nôi: v1.0.0 release 🎂 — 1 năm uptime, 0 downtime', ago: 50000, r: [55, 33, 21], lane: 1, merge: true },
  { type: 'perf', handle: 'nam.be', name: 'Nam Đỗ', msg: 'ship side project lúc con ngủ trưa — 2 commit/ngày là max rồi', ago: 70000, r: [9, 5, 14], lane: 0 },
  { type: 'fix', handle: 'dat.fs', name: 'Đạt Hoàng', msg: 'fix bug production bằng 1 tay, tay kia bế con đang ngủ', ago: 96000, r: [23, 4, 17], lane: 0 },
  { type: 'docs', handle: 'huong.ui', name: 'Hương Trần', msg: 'viết lại README cho ông bà: cách pha sữa đúng tỉ lệ', ago: 130000, r: [4, 12, 6], lane: 0 },
  { type: 'test', handle: 'quynh.qa', name: 'Quỳnh Bùi', msg: 'khám 9 tháng: chiều cao cân nặng pass, đã mọc 6 răng', ago: 160000, r: [7, 9, 4], lane: 0 },
  { type: 'feat', handle: 'tuan.js', name: 'Tuấn Lê', msg: 'con biết vẫy tay bye-bye — event handler đã được đăng ký', ago: 200000, r: [13, 15, 5], lane: 0 },
  { type: 'refactor', handle: 'phuong.data', name: 'Phương Vũ', msg: 'dọn lại codebase phòng em bé, tách riêng module đồ chơi', ago: 250000, r: [2, 3, 8], lane: 1, merge: true },
  { type: 'feat', handle: 'khoa.ml', name: 'Khoa Đặng', msg: 'con cười thành tiếng lần đầu — laugh() trả về true 😄', ago: 300000, r: [28, 40, 6], lane: 0 },
  { type: 'chore', handle: 'mai.pm', name: 'Mai Ngô', msg: 'bump tuổi: 18 tháng → 19 tháng, cập nhật dependencies', ago: 380000, r: [5, 2, 9], lane: 0 },
];

const REACT_ORDER: ReactionKind[] = ['ship', 'love', 'lgtm'];

export function buildSeedCommits(base: number): Commit[] {
  return SPEC.map((s, i) => {
    const reactions = {} as Record<ReactionKind, number>;
    REACT_ORDER.forEach((k, ri) => (reactions[k] = s.r[ri]));
    return {
      id: `seed-${i}`,
      type: s.type,
      author: { handle: s.handle, name: s.name },
      message: s.msg,
      at: base - s.ago * 1000,
      reactions,
      lane: s.lane,
      merge: s.merge,
    } satisfies Commit;
  });
}

/** Pool used by the live simulator to spawn "incoming" community commits. */
export const LIVE_AUTHORS = [
  { handle: 'minh.dev', name: 'Minh Nguyễn' },
  { handle: 'lan.codes', name: 'Lan Phạm' },
  { handle: 'nam.be', name: 'Nam Đỗ' },
  { handle: 'huong.ui', name: 'Hương Trần' },
  { handle: 'tuan.js', name: 'Tuấn Lê' },
  { handle: 'dat.fs', name: 'Đạt Hoàng' },
  { handle: 'quynh.qa', name: 'Quỳnh Bùi' },
  { handle: 'long.rs', name: 'Long Phan' },
  { handle: 'khoa.ml', name: 'Khoa Đặng' },
  { handle: 'thao.mobile', name: 'Thảo Lý' },
];

export const LIVE_MESSAGES: { type: CommitType; msg: string }[] = [
  { type: 'feat', msg: 'con biết bò ngược — crawl() đã hỗ trợ chiều âm' },
  { type: 'fix', msg: 'dỗ con nín trong 2 phút, kỷ lục mới của bố' },
  { type: 'perf', msg: 'pha sữa nhanh hơn 30% nhờ chuẩn bị sẵn từ tối' },
  { type: 'feat', msg: 'con biết chỉ tay vào đồ muốn lấy — pointer events ok' },
  { type: 'docs', msg: 'ghi chú lịch tiêm chủng vào shared calendar' },
  { type: 'test', msg: 'thử món ăn dặm mới: bí đỏ pass, cà rốt fail' },
  { type: 'refactor', msg: 'sắp xếp lại tủ quần áo theo size, dễ maintain hơn' },
  { type: 'feat', msg: 'con tự cầm bình sữa — feature self-serve released 🍼' },
  { type: 'chore', msg: 'giặt sạch toàn bộ ti giả, reset về trạng thái clean' },
  { type: 'fix', msg: 'hotfix: con trớ lúc 2am, đã thay ga và bế vác' },
  { type: 'perf', msg: 'rút ngắn quy trình tắm bé xuống còn 10 phút' },
  { type: 'feat', msg: 'con vỗ tay theo nhạc — animation loop chạy mượt 🎵' },
];
