import { REACTION_KINDS } from '../../lib/types';
import type { Commit } from '../../lib/types';
import { hasReacted, toggleReaction } from '../../lib/store';

export default function Reactions({ commit }: { commit: Commit }) {
  return (
    <div class="flex flex-wrap items-center gap-1.5">
      {REACTION_KINDS.map(({ kind, glyph, label }) => {
        const on = hasReacted(commit.id, kind);
        const count = commit.reactions[kind];
        return (
          <button
            key={kind}
            type="button"
            onClick={() => toggleReaction(commit.id, kind)}
            aria-pressed={on}
            aria-label={`${label}${count ? ` (${count})` : ''}`}
            class={`group inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs transition-colors ${
              on
                ? 'border-accent/40 bg-accent/10 text-accent-ink'
                : 'border-hair/10 text-muted hover:border-hair/20 hover:bg-hair/[0.03]'
            }`}
          >
            <span class="inline-block transition-transform duration-150 group-hover:scale-110 group-active:scale-125">
              {glyph}
            </span>
            {count > 0 && <span class="tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
