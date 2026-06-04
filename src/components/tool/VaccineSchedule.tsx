import { useState, useEffect } from 'preact/hooks';
import { loadVaccines, saveVaccines } from '../../lib/persist';
import { VACCINE_SCHEDULE, ageLabel } from '../../lib/vaccines';

export default function VaccineSchedule({ month }: { month: number }) {
  const [done, setDone] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDone(loadVaccines());
    setMounted(true);
  }, []);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = Date.now();
      saveVaccines(next);
      return next;
    });
  };

  const total = VACCINE_SCHEDULE.length;
  const doneCount = VACCINE_SCHEDULE.filter((v) => done[v.id]).length;
  const pct = Math.round((doneCount / total) * 100);
  const overdueCount = mounted ? VACCINE_SCHEDULE.filter((v) => !done[v.id] && v.month < month - 1).length : 0;

  const months = [...new Set(VACCINE_SCHEDULE.map((v) => v.month))].sort((a, b) => a - b);

  return (
    <section aria-label="Lịch tiêm chủng của bé" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          💉 lịch <span class="text-accent-ink">tiêm chủng</span>
        </h2>
        <span class="font-mono text-[0.62rem] text-muted/70 tabular-nums">
          {doneCount}/{total} mũi{overdueCount > 0 ? ` · ${overdueCount} trễ` : ''}
        </span>
      </div>
      <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hair/[0.08]">
        <div class="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>

      <div class="mt-3 space-y-3">
        {months.map((m) => {
          const items = VACCINE_SCHEDULE.filter((v) => v.month === m);
          const isNow = mounted && Math.abs(m - month) <= 1;
          return (
            <div key={m}>
              <p class="font-mono text-[0.66rem] font-medium text-muted">
                {ageLabel(m)}
                {isNow && <span class="ml-1.5 text-accent-ink">● bây giờ</span>}
              </p>
              <ul class="mt-1">
                {items.map((v) => {
                  const isDone = !!done[v.id];
                  const overdue = mounted && !isDone && v.month < month - 1;
                  const dueNow = mounted && !isDone && !overdue && v.month <= month + 1;
                  return (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => toggle(v.id)}
                        aria-pressed={isDone}
                        class="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-hair/[0.03]"
                      >
                        <span
                          class={`grid h-5 w-5 shrink-0 place-items-center rounded-md border font-mono text-[0.7rem] ${
                            isDone ? 'border-accent bg-accent text-white' : 'border-hair/25 text-transparent'
                          }`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class={`block font-mono text-xs ${isDone ? 'text-muted line-through' : 'text-ink'}`}>
                            {v.name}
                          </span>
                          {v.note && <span class="block font-mono text-[0.6rem] leading-tight text-muted/70">{v.note}</span>}
                        </span>
                        {isDone ? (
                          <span class="shrink-0 font-mono text-[0.6rem] text-accent-ink">đã tiêm</span>
                        ) : overdue ? (
                          <span class="shrink-0 font-mono text-[0.6rem] text-tagfix-ink">trễ</span>
                        ) : dueNow ? (
                          <span class="shrink-0 font-mono text-[0.6rem] text-accent-ink">đến hạn</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p class="mt-3 font-mono text-[0.6rem] leading-relaxed text-muted/60">
        * lịch tham khảo (TCMR + dịch vụ); loại vắc-xin, số mũi và thời điểm có thể khác theo hãng và chỉ định — luôn theo lịch của bác sĩ / trạm y tế.
      </p>
    </section>
  );
}
