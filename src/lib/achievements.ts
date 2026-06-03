export interface Ach {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export const ACHIEVEMENTS: Ach[] = [
  { id: 'first-commit', name: 'Hello, World', emoji: '🌱', desc: 'Ship commit đầu tiên' },
  { id: 'commits-10', name: 'Prolific', emoji: '📦', desc: '10 commit' },
  { id: 'commits-50', name: 'Commit Machine', emoji: '🤖', desc: '50 commit' },
  { id: 'streak-3', name: 'Đều đặn', emoji: '📅', desc: 'Streak 3 ngày' },
  { id: 'streak-7', name: 'On Fire', emoji: '🔥', desc: 'Streak 7 ngày' },
  { id: 'streak-30', name: 'Unstoppable', emoji: '⚡', desc: 'Streak 30 ngày' },
  { id: 'issues-5', name: 'Task Master', emoji: '✅', desc: 'Đóng 5 issue cho bố' },
  { id: 'issues-20', name: 'Get Things Done', emoji: '🧰', desc: 'Đóng 20 issue' },
  { id: 'commenter', name: 'Hậu phương', emoji: '💬', desc: 'Viết bình luận đầu tiên' },
  { id: 'reactor', name: 'Hype Man', emoji: '🚀', desc: 'Thả reaction đầu tiên' },
  { id: 'night-owl', name: '2AM Committer', emoji: '🦉', desc: 'Ship lúc 0–5 giờ sáng' },
  { id: 'profile', name: 'Có danh tính', emoji: '🪪', desc: 'Thêm bio cho hồ sơ' },
  { id: 'trimester-2', name: 'Halfway There', emoji: '🌗', desc: 'Vào tam cá nguyệt 2 (tuần 13)' },
  { id: 'survival', name: 'Survival Threshold', emoji: '💪', desc: 'Bé đạt tuần 24' },
  { id: 'trimester-3', name: 'Final Stretch', emoji: '🏁', desc: 'Vào tam cá nguyệt 3 (tuần 28)' },
  { id: 'shipped', name: 'v1.0.0 Shipped', emoji: '🚀', desc: 'Bé đã chào đời!' },
  { id: 'walking', name: 'v2.0.0', emoji: '🎂', desc: 'Bé tròn 1 tuổi, biết đi' },
];

export const ACH_BY_ID: Record<string, Ach> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export interface AchState {
  commitCount: number;
  streak: number;
  closedIssues: number;
  stageValue: number;
  comments: number;
  reactions: number;
  hasBio: boolean;
  nightOwl: boolean;
}

/** Ordered list of unlocked achievement ids for the given state. */
export function unlockedIds(s: AchState): string[] {
  const u: string[] = [];
  if (s.commitCount >= 1) u.push('first-commit');
  if (s.commitCount >= 10) u.push('commits-10');
  if (s.commitCount >= 50) u.push('commits-50');
  if (s.streak >= 3) u.push('streak-3');
  if (s.streak >= 7) u.push('streak-7');
  if (s.streak >= 30) u.push('streak-30');
  if (s.closedIssues >= 5) u.push('issues-5');
  if (s.closedIssues >= 20) u.push('issues-20');
  if (s.comments >= 1) u.push('commenter');
  if (s.reactions >= 1) u.push('reactor');
  if (s.nightOwl) u.push('night-owl');
  if (s.hasBio) u.push('profile');
  if (s.stageValue >= 13) u.push('trimester-2');
  if (s.stageValue >= 24) u.push('survival');
  if (s.stageValue >= 28) u.push('trimester-3');
  if (s.stageValue >= 41) u.push('shipped');
  if (s.stageValue >= 53) u.push('walking');
  return u;
}

export const unlockedAch = (s: AchState): Ach[] => unlockedIds(s).map((id) => ACH_BY_ID[id]);
