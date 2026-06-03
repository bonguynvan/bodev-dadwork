import { you, commits, now, streak } from '../../lib/store';
import { epochDay } from '../../lib/time';

const WEEKS = 18;
const DAYS = WEEKS * 7;
const LEVEL = ['bg-hair/[0.05]', 'bg-accent/25', 'bg-accent/55', 'bg-accent'];

export default function Heatmap() {
  const today = epochDay(now.value);
  const start = today - (DAYS - 1);

  const counts = new Map<number, number>();
  for (const c of commits.value) {
    if (!c.mine) continue;
    const d = epochDay(c.at);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const shipped = new Set(you.value?.shipDays ?? []);

  const cells = Array.from({ length: DAYS }, (_, i) => {
    const day = start + i;
    const count = counts.get(day) ?? (shipped.has(day) ? 1 : 0);
    const level = count >= 3 ? 3 : count;
    return { day, level, isToday: day === today };
  });

  const s = streak.value;

  return (
    <div class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between">
        <h3 class="font-mono text-xs font-medium text-ink">đóng góp của bạn</h3>
        <span class="font-mono text-[0.7rem] text-muted">
          🔥 <span class="text-accent-ink">{s}</span> ngày
        </span>
      </div>

      <div class="term-scroll mt-3 overflow-x-auto pb-1">
        <div class="grid grid-flow-col grid-rows-7 gap-1" style={{ width: 'max-content' }}>
          {cells.map((c) => (
            <span
              key={c.day}
              class={`h-2.5 w-2.5 rounded-[3px] ${LEVEL[c.level]} ${
                c.isToday
                  ? c.level === 0
                    ? 'animate-pulse ring-1 ring-accent ring-offset-1 ring-offset-white'
                    : 'ring-1 ring-accent ring-offset-1 ring-offset-white'
                  : ''
              }`}
              title={c.level > 0 ? `${c.level === 3 ? '3+' : c.level} commit` : ''}
            />
          ))}
        </div>
      </div>

      <div class="mt-3 flex items-center justify-end gap-1.5 font-mono text-[0.65rem] text-muted">
        <span>ít</span>
        {LEVEL.map((l, i) => (
          <span key={i} class={`h-2.5 w-2.5 rounded-[3px] ${l}`} />
        ))}
        <span>nhiều</span>
      </div>
    </div>
  );
}
