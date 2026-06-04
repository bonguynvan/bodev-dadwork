import { signal, computed } from '@preact/signals';
import type { Commit, CommitType, ReactionKind, You } from './types';
import { buildSeedCommits, NOW_BASE, LIVE_AUTHORS, LIVE_MESSAGES } from './seed';
import { epochDay } from './time';
import { makeHandle, makeName } from './handles';
import { DEFAULT_WEEK, dueDateFromWeek, weekFromDueDate } from './pregnancy';
import { clampStage, getStage } from './stages';
import {
  loadYou,
  saveYou,
  loadMyCommits,
  saveMyCommits,
  loadReactions,
  saveReactions,
  loadBaby,
  saveBaby,
  loadComments,
  saveComments,
  loadOnboarded,
  saveOnboarded,
  loadDadDone,
  loadNotifs,
  saveNotifs,
  loadDiary,
  saveDiary,
  loadVaccines,
  loadVaxNotified,
  saveVaxNotified,
} from './persist';
import { seededComments } from './comments';
import type { Comment } from './comments';
import type { AchState } from './achievements';
import type { Notif } from './notifications';
import { reactionNotif, replyNotif, achievementNotif, communityNotif, vaccineNotif, SIM_REPLIES } from './notifications';
import type { Diary } from './diary';
import { HOME_NAMES } from './names';
import { VACCINE_SCHEDULE } from './vaccines';

const MAX_FEED = 80;

// --- signals (SSR-safe deterministic defaults) ---------------------------
export const commits = signal<Commit[]>(buildSeedCommits(NOW_BASE));
export const you = signal<You | null>(null);
export const myReactions = signal<Record<string, ReactionKind[]>>({});
export const presence = signal<number>(24);
export const now = signal<number>(NOW_BASE);
export const filter = signal<CommitType | 'all'>('all');
export const hydrated = signal<boolean>(false);
export const babyWeek = signal<number>(DEFAULT_WEEK);
export const dueDate = signal<number | null>(null);
export const openCommitId = signal<string | null>(null);
export const userComments = signal<Record<string, Comment[]>>({});
export const needsOnboarding = signal<boolean>(false);
export const notifications = signal<Notif[]>([]);
export const babyDiary = signal<Diary>({});

// --- computed ------------------------------------------------------------
export const visibleCommits = computed(() =>
  filter.value === 'all' ? commits.value : commits.value.filter((c) => c.type === filter.value),
);

export const totalCommits = computed(() => commits.value.length);

export const streak = computed(() => {
  const days = you.value?.shipDays ?? [];
  if (days.length === 0) return 0;
  const set = new Set(days);
  const today = epochDay(now.value);
  let anchor = set.has(today) ? today : set.has(today - 1) ? today - 1 : null;
  if (anchor === null) return 0;
  let s = 0;
  for (let d = anchor; set.has(d); d--) s++;
  return s;
});

export const myCommitCount = computed(() => commits.value.filter((c) => c.mine).length);

export const unreadNotifs = computed(() => notifications.value.filter((n) => !n.read).length);

/** Whether the user has already shipped at least once today. */
export const shippedToday = computed(() => (you.value?.shipDays ?? []).includes(epochDay(now.value)));

// --- actions -------------------------------------------------------------
function reactedKinds(id: string): ReactionKind[] {
  return myReactions.value[id] ?? [];
}
export const hasReacted = (id: string, kind: ReactionKind): boolean =>
  reactedKinds(id).includes(kind);

/** Client-only: pull persisted state, rebase seed clock to real time. */
export function hydrate(): void {
  if (hydrated.value) return;
  const real = Date.now();
  const delta = real - NOW_BASE;
  now.value = real;

  // rebase seeded ages onto the real clock
  let next = commits.value.map((c) => ({ ...c, at: c.at + delta }));

  // merge the user's own persisted commits
  const mine = loadMyCommits();
  if (mine.length) next = [...mine, ...next];
  next.sort((a, b) => b.at - a.at);

  // re-apply the user's own reactions on top of the baseline counts
  const reactions = loadReactions();
  for (const [id, kinds] of Object.entries(reactions)) {
    next = next.map((c) =>
      c.id === id
        ? { ...c, reactions: kinds.reduce((r, k) => ({ ...r, [k]: r[k] + 1 }), c.reactions) }
        : c,
    );
  }
  commits.value = next.slice(0, MAX_FEED);
  myReactions.value = reactions;

  // identity
  const existing = loadYou();
  if (existing) {
    you.value = existing.joinedAt ? existing : { ...existing, joinedAt: real };
    if (!existing.joinedAt) saveYou(you.value);
  } else {
    const handle = makeHandle((real ^ 0x9e3779b9) >>> 0);
    const fresh: You = { handle, name: makeName(handle), shipDays: [], joinedAt: real };
    you.value = fresh;
    saveYou(fresh);
  }

  // baby "build" state
  const baby = loadBaby();
  if (typeof baby.week === 'number') babyWeek.value = clampStage(baby.week);
  else if (typeof you.value?.babyWeek === 'number') babyWeek.value = clampStage(you.value.babyWeek);
  dueDate.value = baby.dueDate ?? you.value?.dueDate ?? null;
  babyDiary.value = loadDiary();
  userComments.value = loadComments();
  needsOnboarding.value = !loadOnboarded();

  // notifications inbox — restore, or seed a couple so it isn't empty on first visit
  const storedNotifs = loadNotifs();
  if (storedNotifs.length) {
    notifications.value = storedNotifs;
  } else {
    const actor = LIVE_AUTHORS[real % LIVE_AUTHORS.length];
    const st = getStage(babyWeek.value);
    const seeded: Notif[] = [
      communityNotif(`${actor.name} cũng đang ở ${st.label}`, '🤝', real - 14 * 60_000, actor, `/u/${actor.handle}`),
      communityNotif('Chào mừng tới ship.log! Ship commit đầu tiên để bắt đầu streak 🔥', '👋', real - 30 * 60_000),
    ];
    notifications.value = seeded;
    saveNotifs(seeded);
  }

  hydrated.value = true;
}

export function finishOnboarding(): void {
  saveOnboarded();
  needsOnboarding.value = false;
}

/** Current achievement state derived from the live store (subscribes when read in render). */
export function myAchState(): AchState {
  const mine = commits.value.filter((c) => c.mine);
  return {
    commitCount: mine.length,
    streak: streak.value,
    closedIssues: loadDadDone().length,
    stageValue: babyWeek.value,
    comments: Object.values(userComments.value).reduce((a, arr) => a + arr.length, 0),
    reactions: Object.values(myReactions.value).reduce((a, arr) => a + arr.length, 0),
    hasBio: Boolean(you.value?.bio && you.value.bio.trim()),
    nightOwl: mine.some((c) => {
      const h = new Date(c.at).getHours();
      return h >= 0 && h < 5;
    }),
  };
}

export const openCommit = (id: string): void => {
  openCommitId.value = id;
};
export const closeCommit = (): void => {
  openCommitId.value = null;
};

export function commentsFor(commitId: string): Comment[] {
  return [...seededComments(commitId), ...(userComments.value[commitId] ?? [])];
}
export function commentCount(commitId: string): number {
  return seededComments(commitId).length + (userComments.value[commitId]?.length ?? 0);
}

export function addComment(commitId: string, text: string): void {
  const t = text.trim();
  if (!t || !you.value) return;
  const c: Comment = {
    id: `uc-${Date.now()}`,
    author: { handle: you.value.handle, name: you.value.name },
    text: t.slice(0, 280),
    at: Date.now(),
    mine: true,
  };
  const next = {
    ...userComments.value,
    [commitId]: [...(userComments.value[commitId] ?? []), c],
  };
  userComments.value = next;
  saveComments(next);
}

export function setBabyWeek(week: number): void {
  const w = clampStage(week);
  const due = dueDateFromWeek(w, Date.now());
  babyWeek.value = w;
  dueDate.value = due;
  if (you.value) {
    you.value = { ...you.value, babyWeek: w, dueDate: due };
    saveYou(you.value);
  }
  saveBaby({ week: w, dueDate: due });
}

export function setDueDateMs(ms: number): void {
  const w = weekFromDueDate(ms, Date.now());
  babyWeek.value = w;
  dueDate.value = ms;
  if (you.value) {
    you.value = { ...you.value, babyWeek: w, dueDate: ms };
    saveYou(you.value);
  }
  saveBaby({ week: w, dueDate: ms });
}

export function setHandle(handle: string): void {
  const clean = handle.trim().replace(/\s+/g, '.').toLowerCase().slice(0, 24) || 'anon.dev';
  const cur = you.value ?? { handle: clean, name: makeName(clean), shipDays: [] };
  const nextYou: You = { ...cur, handle: clean, name: makeName(clean) };
  you.value = nextYou;
  saveYou(nextYou);
  commits.value = commits.value.map((c) =>
    c.mine ? { ...c, author: { handle: clean, name: nextYou.name } } : c,
  );
  saveMyCommits(commits.value.filter((c) => c.mine));
}

export function setBio(bio: string): void {
  if (!you.value) return;
  you.value = { ...you.value, bio: bio.slice(0, 160) };
  saveYou(you.value);
}

/** Set or clear the local user's uploaded avatar photo (data URL, local-only). */
export function setAvatar(dataUrl: string | null): void {
  if (!you.value) return;
  you.value = { ...you.value, avatar: dataUrl ?? undefined };
  saveYou(you.value);
}

/** Set or clear the baby's home name / codename. */
export function setBabyName(name: string): void {
  if (!you.value) return;
  const clean = name.trim().slice(0, 24);
  you.value = { ...you.value, babyName: clean || undefined };
  saveYou(you.value);
}

/** Attach a photo to a stage in the local baby diary (data URL, local-only). */
export function setDiaryPhoto(stage: number, dataUrl: string): void {
  const prev = babyDiary.value[stage];
  babyDiary.value = { ...babyDiary.value, [stage]: { url: dataUrl, at: Date.now(), caption: prev?.caption } };
  saveDiary(babyDiary.value);
}

/** Remove a stage's diary photo. */
export function removeDiaryPhoto(stage: number): void {
  if (!(stage in babyDiary.value)) return;
  const next = { ...babyDiary.value };
  delete next[stage];
  babyDiary.value = next;
  saveDiary(next);
}

/** Set (or clear) the short caption on an existing diary entry. */
export function setDiaryCaption(stage: number, caption: string): void {
  const entry = babyDiary.value[stage];
  if (!entry) return;
  const text = caption.trim().slice(0, 80);
  babyDiary.value = { ...babyDiary.value, [stage]: { ...entry, caption: text || undefined } };
  saveDiary(babyDiary.value);
}

/** Add a commit from the local user. Returns it so the caller can celebrate. */
export function ship(type: CommitType, message: string): Commit | null {
  const msg = message.trim();
  if (!msg || !you.value) return null;
  const at = Date.now();
  const commit: Commit = {
    id: `me-${at}`,
    type,
    author: { handle: you.value.handle, name: you.value.name },
    message: msg,
    at,
    reactions: { ship: 0, love: 0, lgtm: 0 },
    lane: 0,
    mine: true,
  };
  commits.value = [commit, ...commits.value].slice(0, MAX_FEED);

  const day = epochDay(at);
  const days = you.value.shipDays.includes(day)
    ? you.value.shipDays
    : [...you.value.shipDays, day];
  you.value = { ...you.value, shipDays: days };
  saveYou(you.value);
  saveMyCommits(commits.value.filter((c) => c.mine));
  return commit;
}

export function toggleReaction(id: string, kind: ReactionKind): void {
  const had = hasReacted(id, kind);
  commits.value = commits.value.map((c) =>
    c.id === id
      ? { ...c, reactions: { ...c.reactions, [kind]: Math.max(0, c.reactions[kind] + (had ? -1 : 1)) } }
      : c,
  );
  const cur = new Set(reactedKinds(id));
  had ? cur.delete(kind) : cur.add(kind);
  const next = { ...myReactions.value };
  if (cur.size) next[id] = [...cur];
  else delete next[id];
  myReactions.value = next;
  saveReactions(next);
}

// --- notifications -------------------------------------------------------
const MAX_NOTIFS = 40;
const randOf = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

function pushNotif(n: Notif): void {
  notifications.value = [n, ...notifications.value].slice(0, MAX_NOTIFS);
  saveNotifs(notifications.value);
}

export function pushAchievementNotif(name: string, emoji: string): void {
  pushNotif(achievementNotif(name, emoji, Date.now()));
}

export function markAllNotifsRead(): void {
  if (!notifications.value.some((n) => !n.read)) return;
  notifications.value = notifications.value.map((n) => (n.read ? n : { ...n, read: true }));
  saveNotifs(notifications.value);
}

export function markNotifRead(id: string): void {
  let changed = false;
  const next = notifications.value.map((n) => {
    if (n.id === id && !n.read) {
      changed = true;
      return { ...n, read: true };
    }
    return n;
  });
  if (!changed) return;
  notifications.value = next;
  saveNotifs(next);
}

/**
 * Occasionally generate a personal notification about the user's own commits —
 * a community member reacting or replying. Keeps the simulated community feeling
 * alive and personal. Called from the homepage heartbeat.
 */
export function notifyAboutYou(): void {
  const mine = commits.value.filter((c) => c.mine);
  const at = Date.now();

  // until the baby is named, the community pitches in name ideas
  if (!you.value?.babyName && Math.random() < 0.22) {
    const actor = randOf(LIVE_AUTHORS);
    const idea = randOf(HOME_NAMES);
    pushNotif(communityNotif(`${actor.name} gợi ý đặt tên bé: “${idea.name}” ${idea.emoji}`, '💡', at, actor));
    return;
  }

  if (mine.length === 0) {
    // not engaged yet — keep the inbox calm, only a rare community ping
    if (Math.random() < 0.15) {
      const actor = randOf(LIVE_AUTHORS);
      const st = getStage(babyWeek.value);
      pushNotif(communityNotif(`${actor.name} cũng đang ở ${st.label}`, '🤝', at, actor, `/u/${actor.handle}`));
    }
    return;
  }

  if (Math.random() > 0.34) return; // most ticks: nothing

  const target = randOf(mine.slice(0, 6)); // a recent-ish own commit
  const actor = randOf(LIVE_AUTHORS);

  if (Math.random() < 0.55) {
    // a community reaction — also bump the count on the commit in the feed
    const kind = randOf(['ship', 'love', 'lgtm'] as ReactionKind[]);
    commits.value = commits.value.map((c) =>
      c.id === target.id ? { ...c, reactions: { ...c.reactions, [kind]: c.reactions[kind] + 1 } } : c,
    );
    pushNotif(reactionNotif(actor, kind, target.id, at));
  } else {
    // a community reply — drop a real comment into the thread, then notify
    const text = randOf(SIM_REPLIES);
    const comment: Comment = {
      id: `sim-${at}-${Math.floor(Math.random() * 1e4)}`,
      author: actor,
      text,
      at,
      mine: false,
    };
    const next = {
      ...userComments.value,
      [target.id]: [...(userComments.value[target.id] ?? []), comment],
    };
    userComments.value = next;
    saveComments(next);
    pushNotif(replyNotif(actor, text, target.id, at));
  }
}

/** Push inbox reminders for vaccines that have just come due and aren't done yet. */
export function checkVaccineReminders(): void {
  const st = getStage(babyWeek.value);
  if (st.phase !== 'born' || st.month == null) return;
  const month = st.month;
  const done = loadVaccines();
  const notified = loadVaxNotified();
  const due = VACCINE_SCHEDULE.filter(
    (v) => v.month >= month - 1 && v.month <= month && !done[v.id] && !notified[v.id],
  ).slice(0, 3);
  if (due.length === 0) return;
  for (const v of due) {
    pushNotif(vaccineNotif(v.name, v.month, Date.now()));
    notified[v.id] = Date.now();
  }
  saveVaxNotified(notified);
}

/** Inject a simulated community commit (client-only). */
export function spawnIncoming(): Commit {
  const author = LIVE_AUTHORS[Math.floor(Math.random() * LIVE_AUTHORS.length)];
  const pick = LIVE_MESSAGES[Math.floor(Math.random() * LIVE_MESSAGES.length)];
  const at = Date.now();
  const commit: Commit = {
    id: `live-${at}-${Math.floor(Math.random() * 1e4)}`,
    type: pick.type,
    author,
    message: pick.msg,
    at,
    reactions: { ship: 0, love: 0, lgtm: 0 },
    lane: Math.random() < 0.18 ? 1 : 0,
    merge: Math.random() < 0.18,
  };
  commits.value = [commit, ...commits.value].slice(0, MAX_FEED);
  return commit;
}

/** Simulate a random community member reacting to an existing commit. */
export function bumpRandomReaction(): void {
  const list = commits.value;
  if (list.length === 0) return;
  const idx = Math.floor(Math.random() * Math.min(list.length, 12));
  const kinds: ReactionKind[] = ['ship', 'love', 'lgtm'];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  commits.value = list.map((c, i) =>
    i === idx ? { ...c, reactions: { ...c.reactions, [kind]: c.reactions[kind] + 1 } } : c,
  );
}

export function nudgePresence(): void {
  const drift = Math.floor(Math.random() * 5) - 2;
  presence.value = Math.max(8, Math.min(99, presence.value + drift));
}
