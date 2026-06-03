import { useState } from 'preact/hooks';
import { you, streak, myCommitCount, presence, setHandle, babyWeek } from '../../lib/store';
import { getStage } from '../../lib/stages';
import Avatar from './Avatar';

export default function RepoCard() {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const handle = you.value?.handle ?? 'anon.dev';

  const start = () => {
    setDraft(handle);
    setEditing(true);
  };
  const save = (e: Event) => {
    e.preventDefault();
    if (draft.trim()) setHandle(draft);
    setEditing(false);
  };

  return (
    <div class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-center gap-3">
        <Avatar handle={handle} size={44} />
        <div class="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={save} class="flex items-center gap-1.5">
              <span class="font-mono text-sm text-muted">@</span>
              <input
                autofocus
                value={draft}
                maxLength={24}
                onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
                onBlur={save}
                class="min-w-0 flex-1 rounded border border-hair/15 bg-surface px-1.5 py-0.5 font-mono text-sm text-ink focus:outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={start}
              class="group flex items-center gap-1.5"
              title="Đổi tên"
            >
              <span class="truncate font-mono text-sm font-medium text-ink">@{handle}</span>
              <span class="text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
                ✎
              </span>
            </button>
          )}
          <p class="mt-0.5 font-mono text-[0.7rem] text-muted">
            <span class="inline-flex h-1.5 w-1.5 translate-y-px rounded-full bg-accent" /> online ·
            repo của bạn
          </p>
        </div>
      </div>

      <dl class="mt-4 grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg bg-hair/[0.025] py-2">
          <dt class="font-mono text-[0.65rem] text-muted">streak</dt>
          <dd class="font-serif text-lg font-medium text-ink">{streak.value}🔥</dd>
        </div>
        <div class="rounded-lg bg-hair/[0.025] py-2">
          <dt class="font-mono text-[0.65rem] text-muted">commits</dt>
          <dd class="font-serif text-lg font-medium text-ink tabular-nums">{myCommitCount.value}</dd>
        </div>
        <div class="rounded-lg bg-hair/[0.025] py-2">
          <dt class="font-mono text-[0.65rem] text-muted">online</dt>
          <dd class="font-serif text-lg font-medium text-ink tabular-nums">{presence.value}</dd>
        </div>
      </dl>

      {(() => {
        const st = getStage(babyWeek.value);
        return (
          <a
            href={st.week ? `/thai-ky/tuan-${st.week}` : '/thai-ky'}
            class="mt-3 block rounded-lg bg-[var(--term)] px-3 py-2.5 transition-opacity hover:opacity-90"
          >
            <div class="flex items-center justify-between font-mono text-[0.7rem]">
              <span class="text-accent">{st.version}</span>
              <span class="text-white/55 tabular-nums">
                {st.label}
                {st.phase === 'womb' ? ` · còn ${st.weeksLeft}t` : ` · ${st.month}th tuổi`}
              </span>
            </div>
            <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div class="h-full rounded-full bg-accent" style={{ width: `${st.pct}%` }} />
            </div>
          </a>
        );
      })()}
    </div>
  );
}
