import type { Commit, ReactionKind, You } from './types';

const KEY = {
  you: 'shiplog.you.v1',
  mine: 'shiplog.commits.v1',
  reactions: 'shiplog.reactions.v1',
  baby: 'shiplog.baby.v1',
  dad: 'shiplog.dadtasks.v1',
  comments: 'shiplog.comments.v1',
  onboarded: 'shiplog.onboarded.v1',
  seenAch: 'shiplog.seenach.v1',
  notifs: 'shiplog.notifs.v1',
  diary: 'shiplog.diary.v1',
  kicks: 'shiplog.kicks.v1',
  babylog: 'shiplog.babylog.v1',
  growth: 'shiplog.growth.v1',
  vaccines: 'shiplog.vaccines.v1',
  milestones: 'shiplog.milestones.v1',
  contractions: 'shiplog.contractions.v1',
  momweight: 'shiplog.momweight.v1',
} as const;

export interface BabyState {
  week?: number;
  dueDate?: number;
}

const hasStorage = (): boolean => {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
};

function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — non-fatal, app still works in-memory */
  }
}

export const loadYou = (): You | null => read<You | null>(KEY.you, null);
export const saveYou = (you: You): void => write(KEY.you, you);

export const loadMyCommits = (): Commit[] => read<Commit[]>(KEY.mine, []);
export const saveMyCommits = (commits: Commit[]): void => write(KEY.mine, commits);

export const loadReactions = (): Record<string, ReactionKind[]> =>
  read<Record<string, ReactionKind[]>>(KEY.reactions, {});
export const saveReactions = (map: Record<string, ReactionKind[]>): void =>
  write(KEY.reactions, map);

export const loadBaby = (): BabyState => read<BabyState>(KEY.baby, {});
export const saveBaby = (state: BabyState): void => write(KEY.baby, state);

/** Completed dad-task keys, e.g. "24:0". */
export const loadDadDone = (): string[] => read<string[]>(KEY.dad, []);
export const saveDadDone = (keys: string[]): void => write(KEY.dad, keys);

import type { Comment } from './comments';
export const loadComments = (): Record<string, Comment[]> =>
  read<Record<string, Comment[]>>(KEY.comments, {});
export const saveComments = (map: Record<string, Comment[]>): void => write(KEY.comments, map);

export const loadOnboarded = (): boolean => read<boolean>(KEY.onboarded, false);
export const saveOnboarded = (): void => write(KEY.onboarded, true);

export const loadSeenAch = (): string[] => read<string[]>(KEY.seenAch, []);
export const saveSeenAch = (ids: string[]): void => write(KEY.seenAch, ids);

import type { Notif } from './notifications';
export const loadNotifs = (): Notif[] => read<Notif[]>(KEY.notifs, []);
export const saveNotifs = (list: Notif[]): void => write(KEY.notifs, list);

import type { Diary } from './diary';
export const loadDiary = (): Diary => read<Diary>(KEY.diary, {});
export const saveDiary = (diary: Diary): void => write(KEY.diary, diary);

import type { KickSession } from './kicks';
export const loadKicks = (): KickSession[] => read<KickSession[]>(KEY.kicks, []);
export const saveKicks = (list: KickSession[]): void => write(KEY.kicks, list);

import type { LogEvent } from './babylog';
export const loadLog = (): LogEvent[] => read<LogEvent[]>(KEY.babylog, []);
export const saveLog = (list: LogEvent[]): void => write(KEY.babylog, list);

import type { GrowthEntry } from './growth';
export const loadGrowth = (): GrowthEntry[] => read<GrowthEntry[]>(KEY.growth, []);
export const saveGrowth = (list: GrowthEntry[]): void => write(KEY.growth, list);

/** Map of vaccine id → epoch ms it was marked done. */
export const loadVaccines = (): Record<string, number> => read<Record<string, number>>(KEY.vaccines, {});
export const saveVaccines = (done: Record<string, number>): void => write(KEY.vaccines, done);

/** Map of milestone id → epoch ms it was achieved. */
export const loadMilestones = (): Record<string, number> => read<Record<string, number>>(KEY.milestones, {});
export const saveMilestones = (done: Record<string, number>): void => write(KEY.milestones, done);

import type { Contraction } from './contractions';
export const loadContractions = (): Contraction[] => read<Contraction[]>(KEY.contractions, []);
export const saveContractions = (list: Contraction[]): void => write(KEY.contractions, list);

import type { MomData } from './momweight';
export const loadMom = (): MomData => read<MomData>(KEY.momweight, { entries: [] });
export const saveMom = (data: MomData): void => write(KEY.momweight, data);
