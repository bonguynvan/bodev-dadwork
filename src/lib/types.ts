export type CommitType =
  | 'feat'
  | 'fix'
  | 'docs'
  | 'test'
  | 'perf'
  | 'refactor'
  | 'chore';

export const COMMIT_TYPES: CommitType[] = [
  'feat',
  'fix',
  'docs',
  'test',
  'perf',
  'refactor',
  'chore',
];

export type ReactionKind = 'ship' | 'love' | 'lgtm';

export const REACTION_KINDS: { kind: ReactionKind; glyph: string; label: string }[] = [
  { kind: 'ship', glyph: '🚀', label: 'ship it' },
  { kind: 'love', glyph: '❤', label: 'love' },
  { kind: 'lgtm', glyph: '+1', label: 'LGTM' },
];

export interface Author {
  handle: string;
  name: string;
}

export interface Commit {
  id: string;
  type: CommitType;
  author: Author;
  message: string;
  /** epoch ms. For seeded items this is a fixed offset applied on the client. */
  at: number;
  reactions: Record<ReactionKind, number>;
  /** lane index for the commit-graph rail (0 = trunk) */
  lane: number;
  /** true when this card should draw a branch/merge flourish */
  merge?: boolean;
  /** marks the local user's own commits */
  mine?: boolean;
}

export interface You {
  handle: string;
  name: string;
  /** epoch-day numbers on which the user shipped at least once */
  shipDays: number[];
  /** current gestational week of their "v1.0.0 build" */
  babyWeek?: number;
  /** estimated due date, epoch ms */
  dueDate?: number;
  /** profile bio */
  bio?: string;
  /** uploaded avatar photo as a local data URL (never leaves the browser) */
  avatar?: string;
  /** the baby's "tên ở nhà" / codename, set by the parent */
  babyName?: string;
  /** account creation, epoch ms ("member since") */
  joinedAt?: number;
}
