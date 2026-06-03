import type { ReactionKind } from './types';

export type NotifKind = 'reaction' | 'reply' | 'achievement' | 'community';

export interface NotifActor {
  handle: string;
  name: string;
}

export interface Notif {
  id: string;
  kind: NotifKind;
  at: number;
  text: string;
  /** leading glyph: reaction glyph / 🏆 / 👋 / 🤝 … */
  emoji: string;
  /** present for person-driven notifs (reaction / reply / community) */
  actor?: NotifActor;
  /** reaction & reply open this commit in the drawer */
  commitId?: string;
  /** navigation target (achievement → /me, community → /u/handle) */
  href?: string;
  read: boolean;
}

export const REACTION_GLYPH: Record<ReactionKind, string> = {
  ship: '🚀',
  love: '❤️',
  lgtm: '👍',
};

/** Short community replies — also dropped into the commit thread when used. */
export const SIM_REPLIES = [
  'Chúc mừng bố nhé! 🎉',
  'Mình cũng đang ở giai đoạn này 😅',
  'Cố lên, sắp tới đích rồi! 🚀',
  'LGTM, ship it! 🚀',
  'Heroic. Respect bố 🙌',
  'Khoảnh khắc vàng, lưu lại liền nha 📸',
  'Same here, hai bố cùng cảnh ngộ 🤝',
  'Hóng update tập tiếp theo 👀',
  'Mạnh mẽ lên, bố làm được mà 💪',
  'Để lại bí kíp cho anh em với 🙏',
];

let seq = 0;
const nid = (at: number): string => `nt-${at}-${(seq++).toString(36)}`;

export function reactionNotif(actor: NotifActor, kind: ReactionKind, commitId: string, at: number): Notif {
  return {
    id: nid(at),
    kind: 'reaction',
    at,
    actor,
    emoji: REACTION_GLYPH[kind],
    commitId,
    text: `${actor.name} đã thả ${REACTION_GLYPH[kind]} cho commit của bạn`,
    read: false,
  };
}

export function replyNotif(actor: NotifActor, text: string, commitId: string, at: number): Notif {
  return {
    id: nid(at),
    kind: 'reply',
    at,
    actor,
    emoji: '💬',
    commitId,
    text: `${actor.name} bình luận: “${text}”`,
    read: false,
  };
}

export function achievementNotif(name: string, emoji: string, at: number): Notif {
  return {
    id: nid(at),
    kind: 'achievement',
    at,
    emoji: '🏆',
    text: `Mở khoá huy hiệu: ${name} ${emoji}`,
    href: '/me',
    read: false,
  };
}

export function communityNotif(
  text: string,
  emoji: string,
  at: number,
  actor?: NotifActor,
  href?: string,
): Notif {
  return { id: nid(at), kind: 'community', at, emoji, text, actor, href, read: false };
}
