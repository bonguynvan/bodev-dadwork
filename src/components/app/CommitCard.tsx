import type { Commit } from '../../lib/types';
import CommitTag from './CommitTag';
import Avatar from './Avatar';
import Reactions from './Reactions';
import { TAG_COLOR } from '../../lib/tags';
import { now, you, openCommit, commentCount } from '../../lib/store';
import { timeAgo } from '../../lib/time';

function GraphCell({ color, merge, mine }: { color: string; merge?: boolean; mine?: boolean }) {
  return (
    <div class="relative w-7 shrink-0" aria-hidden="true">
      <span class="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-hair/[0.12]" />
      {merge && (
        <svg
          class="absolute left-1/2 top-[0.5rem] h-8 w-8 overflow-visible"
          viewBox="0 0 28 28"
          fill="none"
        >
          <path
            d="M14 24 C14 17 23 18 23 10"
            stroke={color}
            stroke-opacity="0.5"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx="23" cy="9" r="2.4" fill={color} fill-opacity="0.6" />
        </svg>
      )}
      <span
        class="absolute left-1/2 top-[1.15rem] h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-white"
        style={{ backgroundColor: color }}
      >
        {mine && (
          <span
            class="absolute inset-0 animate-ping rounded-full"
            style={{ backgroundColor: color, opacity: 0.5 }}
          />
        )}
      </span>
    </div>
  );
}

export default function CommitCard({ commit, index }: { commit: Commit; index: number }) {
  const ago = timeAgo(commit.at, now.value);
  const color = TAG_COLOR[commit.type];

  return (
    <article
      class="card-in group flex gap-1 pl-2 pr-3 transition-colors hover:bg-accent/[0.025]"
      style={{ animationDelay: `${Math.min(index, 14) * 35}ms` }}
    >
      <GraphCell color={color} merge={commit.merge} mine={commit.mine} />

      <div class="min-w-0 flex-1 py-3.5">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <CommitTag type={commit.type} />
          <a
            href={commit.author.handle === you.value?.handle ? '/me' : `/u/${commit.author.handle}`}
            class="inline-flex min-w-0 items-center gap-1.5 transition-colors hover:text-accent-ink"
          >
            <Avatar handle={commit.author.handle} size={18} />
            <span class="truncate font-mono text-xs text-muted hover:text-accent-ink">
              @{commit.author.handle}
            </span>
          </a>
          {commit.mine && (
            <span class="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-medium text-accent-ink ring-1 ring-accent/20">
              you
            </span>
          )}
          <span class="ml-auto shrink-0 font-mono text-[0.7rem] tabular-nums text-muted/70">
            {ago}
          </span>
        </div>

        <p class="mt-1.5 font-serif text-[1.05rem] leading-snug text-ink">{commit.message}</p>

        <div class="mt-2.5 flex flex-wrap items-center gap-2">
          <Reactions commit={commit} />
          <button
            type="button"
            onClick={() => openCommit(commit.id)}
            aria-label="bình luận"
            class="inline-flex items-center gap-1 rounded-full border border-hair/10 px-2 py-0.5 font-mono text-xs text-muted transition-colors hover:border-hair/20 hover:bg-hair/[0.03]"
          >
            💬{commentCount(commit.id) > 0 ? ` ${commentCount(commit.id)}` : ''}
          </button>
        </div>
      </div>
    </article>
  );
}
