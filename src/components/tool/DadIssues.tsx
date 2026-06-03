import { useState, useEffect, useRef } from 'preact/hooks';
import type { DadTask, DadLabel } from '../../lib/pregnancy';
import { loadDadDone, saveDadDone } from '../../lib/persist';
import { ship } from '../../lib/store';

const LABEL_CLASS: Record<DadLabel, string> = {
  'chuẩn bị': 'bg-tagdocs-bg text-tagdocs-ink',
  'sức khoẻ': 'bg-tagfeat-bg text-tagfeat-ink',
  'gắn kết': 'bg-[#FCE3EE] text-[#C03A77]',
  'mua sắm': 'bg-tagtest-bg text-tagtest-ink',
  'tài chính': 'bg-tagperf-bg text-tagperf-ink',
  học: 'bg-tagrefactor-bg text-tagrefactor-ink',
};

export default function DadIssues({ tasks, tag }: { tasks: DadTask[]; tag: string }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const committed = useRef<Set<string>>(new Set());
  useEffect(() => setDone(new Set(loadDadDone())), []);

  const toggle = (key: string, task: DadTask) => {
    const closing = !done.has(key);
    const next = new Set(done);
    closing ? next.add(key) : next.delete(key);
    setDone(next);
    saveDadDone([...next]);
    // closing an issue ships a commit (builds streak + shows in the feed)
    if (closing && !committed.current.has(key)) {
      committed.current.add(key);
      ship('chore', `✅ ${task.t}`);
    }
  };

  if (tasks.length === 0) return null;
  const open = tasks.filter((_, i) => !done.has(`${tag}:${i}`)).length;

  return (
    <section
      aria-label="Việc cho bố"
      class="overflow-hidden rounded-xl border border-hair/10 bg-card shadow-card"
    >
      <div class="flex items-center justify-between border-b border-hair/[0.08] bg-hair/[0.02] px-4 py-2.5">
        <h3 class="font-mono text-sm font-medium text-ink">
          <span class="text-accent-ink">◉</span> issues · @bố
        </h3>
        <span class="font-mono text-xs text-muted">
          <span class="text-accent-ink">{open}</span> open · {tasks.length - open} closed
        </span>
      </div>

      <ul class="divide-y divide-hair/[0.06]">
        {tasks.map((task, i) => {
          const key = `${tag}:${i}`;
          const isDone = done.has(key);
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => toggle(key, task)}
                aria-pressed={isDone}
                class="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/[0.025]"
              >
                <span
                  class={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isDone ? 'border-accent bg-accent text-white' : 'border-hair/25 group-hover:border-accent/60'
                  }`}
                >
                  {isDone && (
                    <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M3.5 8.5l3 3 6-7" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  )}
                </span>

                <span class="min-w-0 flex-1">
                  <span
                    class={`font-serif text-[1.02rem] leading-snug ${isDone ? 'text-muted line-through' : 'text-ink'}`}
                  >
                    {task.t}
                  </span>
                  <span
                    class={`ml-2 inline-flex items-center whitespace-nowrap rounded-full px-1.5 py-0.5 align-middle font-mono text-[0.62rem] ${LABEL_CLASS[task.l]}`}
                  >
                    {task.l}
                  </span>
                </span>

                <span class="shrink-0 pt-0.5 font-mono text-[0.7rem] text-muted/60">#{tag}.{i + 1}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p class="border-t border-hair/[0.06] px-4 py-2 font-mono text-[0.68rem] text-muted/70">
        tick để “close issue” → ship 1 commit vào feed &amp; +1 streak 🔥
      </p>
    </section>
  );
}
