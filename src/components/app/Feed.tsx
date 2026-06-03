import { visibleCommits, totalCommits, filter } from '../../lib/store';
import { COMMIT_TYPES, type CommitType } from '../../lib/types';
import CommitCard from './CommitCard';

const TABS: ('all' | CommitType)[] = ['all', ...COMMIT_TYPES];

export default function Feed() {
  const list = visibleCommits.value;
  const active = filter.value;

  return (
    <section
      aria-label="Bảng tin commit"
      class="overflow-hidden rounded-xl border border-hair/10 bg-card shadow-card"
    >
      {/* terminal title bar */}
      <div class="flex items-center gap-2 border-b border-hair/[0.08] bg-hair/[0.02] px-4 py-2.5">
        <span class="flex gap-1.5" aria-hidden="true">
          <span class="h-2.5 w-2.5 rounded-full bg-[#E5534B]/70" />
          <span class="h-2.5 w-2.5 rounded-full bg-[#D9930A]/70" />
          <span class="h-2.5 w-2.5 rounded-full bg-[#1D9E75]/70" />
        </span>
        <span class="ml-2 truncate font-mono text-xs text-muted">
          ~/bodev.vn — git log --graph --all
        </span>
        <span class="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-muted">
          <span class="relative flex h-1.5 w-1.5">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span class="tabular-nums">{totalCommits.value}</span> commits
        </span>
      </div>

      {/* filter chips */}
      <div class="term-scroll flex gap-1.5 overflow-x-auto border-b border-hair/[0.06] px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => (filter.value = t)}
            class={`shrink-0 rounded-full px-2.5 py-1 font-mono text-xs transition-colors ${
              active === t
                ? 'bg-ink text-surface'
                : 'text-muted hover:bg-hair/[0.04] hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* commit list */}
      {list.length > 0 ? (
        <div class="divide-y divide-hair/[0.06]">
          {list.map((c, i) => (
            <CommitCard key={c.id} commit={c} index={i} />
          ))}
        </div>
      ) : (
        <p class="px-5 py-10 text-center font-mono text-sm text-muted">
          chưa có commit nào loại <span class="text-accent-ink">{active}</span> — hãy là người đầu
          tiên ship.
        </p>
      )}
    </section>
  );
}
