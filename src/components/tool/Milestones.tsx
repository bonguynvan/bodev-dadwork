import { useState, useEffect } from 'preact/hooks';
import { loadMilestones, saveMilestones } from '../../lib/persist';
import { MILESTONES } from '../../lib/milestones';
import { burstConfetti } from '../../lib/confetti';

export default function Milestones({ month }: { month: number }) {
  const [done, setDone] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDone(loadMilestones());
    setMounted(true);
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = Date.now();
        burstConfetti();
      }
      saveMilestones(next);
      return next;
    });
  };

  const total = MILESTONES.length;
  const doneCount = MILESTONES.filter((m) => done[m.id]).length;
  const pct = Math.round((doneCount / total) * 100);

  const sorted = [...MILESTONES].sort((a, b) => a.minMonth - b.minMonth || a.maxMonth - b.maxMonth);

  return (
    <section aria-label="Cột mốc phát triển của bé" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          🌱 cột mốc <span class="text-accent-ink">của bé</span>
        </h2>
        <span class="font-mono text-[0.62rem] text-muted/70 tabular-nums">{doneCount}/{total} kỹ năng</span>
      </div>
      <p class="mt-0.5 font-mono text-[0.66rem] text-muted">mỗi kỹ năng bé mở khoá là một release nhỏ 🚀</p>
      <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hair/[0.08]">
        <div class="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>

      <ul class="mt-3 space-y-0.5">
        {sorted.map((m) => {
          const isDone = !!done[m.id];
          const inWindow = mounted && !isDone && month >= m.minMonth && month <= m.maxMonth;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => toggle(m.id)}
                aria-pressed={isDone}
                class={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors ${
                  inWindow ? 'bg-accent/[0.06]' : 'hover:bg-hair/[0.03]'
                }`}
              >
                <span
                  class={`grid h-5 w-5 shrink-0 place-items-center rounded-md border font-mono text-[0.7rem] ${
                    isDone ? 'border-accent bg-accent text-white' : 'border-hair/25 text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span class="shrink-0 text-base" aria-hidden="true">{m.emoji}</span>
                <span class="min-w-0 flex-1">
                  <span class={`block font-mono text-xs ${isDone ? 'text-muted line-through' : 'text-ink'}`}>
                    {m.name}
                  </span>
                  <span class="block font-mono text-[0.6rem] text-muted/70">
                    thường ~{m.minMonth}–{m.maxMonth} tháng
                  </span>
                </span>
                {isDone ? (
                  <span class="shrink-0 font-mono text-[0.6rem] text-accent-ink">đã làm được 🎉</span>
                ) : inWindow ? (
                  <span class="shrink-0 font-mono text-[0.6rem] text-accent-ink">bé đang tập 👀</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <p class="mt-3 font-mono text-[0.6rem] leading-relaxed text-muted/60">
        * mỗi bé một nhịp — khoảng tuổi chỉ là tham khảo, đến sớm hay muộn một chút đều bình thường. Nếu lo lắng, hỏi bác sĩ nhi nhé.
      </p>
    </section>
  );
}
