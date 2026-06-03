import type { CommitType } from './types';

/** Full literal class strings so Tailwind's scanner keeps them. */
export const TAG_CLASS: Record<CommitType, string> = {
  feat: 'bg-tagfeat-bg text-tagfeat-ink',
  fix: 'bg-tagfix-bg text-tagfix-ink',
  docs: 'bg-tagdocs-bg text-tagdocs-ink',
  test: 'bg-tagtest-bg text-tagtest-ink',
  perf: 'bg-tagperf-bg text-tagperf-ink',
  refactor: 'bg-tagrefactor-bg text-tagrefactor-ink',
  chore: 'bg-tagchore-bg text-tagchore-ink',
};

/** Solid hue per type — used for commit-graph nodes (inline style). */
export const TAG_COLOR: Record<CommitType, string> = {
  feat: '#1D9E75',
  fix: '#E5534B',
  docs: '#3B82F6',
  test: '#D9930A',
  perf: '#7C5CFF',
  refactor: '#0EA5A0',
  chore: '#8A8A8A',
};
