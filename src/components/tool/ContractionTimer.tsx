import { useState, useEffect, useRef } from 'preact/hooks';
import { loadContractions, saveContractions } from '../../lib/persist';
import { CONTRACTION_MAX, fmtMMSS, type Contraction } from '../../lib/contractions';

const fmtClock = (ms: number): string => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function ContractionTimer() {
  const ref = useRef<Contraction[]>([]);
  const [list, setList] = useState<Contraction[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const c = loadContractions();
    ref.current = c;
    setList(c);
  }, []);

  const cur = list[0];
  const active = cur && !cur.end ? cur : null;

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active?.id]);

  const commit = (next: Contraction[]) => {
    ref.current = next;
    setList(next);
    saveContractions(next);
  };
  const toggle = () => {
    const t = Date.now();
    const c = ref.current[0];
    if (c && !c.end) commit([{ ...c, end: t }, ...ref.current.slice(1)]);
    else commit([{ id: `c-${t}`, start: t }, ...ref.current].slice(0, CONTRACTION_MAX));
  };
  const reset = () => commit([]);

  const recent = list.slice(0, 6);
  const ended = list.filter((c) => c.end);
  const starts = list.slice(0, 6).map((c) => c.start);
  let avgInterval: number | null = null;
  if (starts.length >= 2) {
    let sum = 0;
    for (let i = 0; i < starts.length - 1; i++) sum += starts[i] - starts[i + 1];
    avgInterval = sum / (starts.length - 1);
  }
  const lastDur = ended.slice(0, 5);
  const avgDur = lastDur.length ? lastDur.reduce((a, c) => a + (c.end! - c.start), 0) / lastDur.length : null;

  return (
    <section aria-label="Đếm cơn gò chuyển dạ" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          ⏱ đếm <span class="text-accent-ink">cơn gò</span>
        </h2>
        {list.length > 0 && (
          <button type="button" onClick={reset} class="font-mono text-[0.62rem] text-muted/70 transition-colors hover:text-tagfix-ink">
            xoá hết
          </button>
        )}
      </div>
      <p class="mt-0.5 font-mono text-[0.66rem] text-muted">bấm khi cơn gò bắt đầu, bấm lại khi kết thúc</p>

      <button
        type="button"
        onClick={toggle}
        class={`mt-4 w-full rounded-xl py-4 font-mono text-base font-medium text-white transition-all active:scale-[0.98] ${
          active ? 'bg-tagfix-ink hover:opacity-90' : 'bg-accent hover:bg-accent-ink'
        }`}
      >
        {active ? `⏹ kết thúc · ${fmtMMSS(Date.now() - active.start)}` : '⏺ bắt đầu cơn gò'}
      </button>

      {avgInterval != null && (
        <p class="mt-3 text-center font-mono text-xs text-ink">
          cứ <span class="text-accent-ink">~{Math.max(1, Math.round(avgInterval / 60000))} phút</span> một cơn
          {avgDur != null && (
            <>
              {' '}
              · kéo dài <span class="text-accent-ink">~{fmtMMSS(avgDur)}</span>
            </>
          )}
        </p>
      )}

      {recent.length > 0 && (
        <ul class="mt-3 space-y-1 border-t border-hair/[0.06] pt-3">
          {recent.map((c, i) => {
            const dur = c.end ? c.end - c.start : active && c.id === active.id ? Date.now() - c.start : 0;
            const interval = i < recent.length - 1 ? c.start - recent[i + 1].start : null;
            return (
              <li key={c.id} class="flex items-center justify-between gap-2 font-mono text-[0.7rem]">
                <span class="text-ink">
                  {fmtClock(c.start)} · kéo dài {fmtMMSS(dur)}
                  {!c.end && <span class="text-accent-ink"> · đang diễn ra</span>}
                </span>
                {interval != null && <span class="text-muted">cách {fmtMMSS(interval)}</span>}
              </li>
            );
          })}
        </ul>
      )}

      <p class="mt-3 font-mono text-[0.6rem] leading-relaxed text-muted/60">
        * quy tắc 5-1-1: cơn cách nhau ~5 phút, kéo dài ~1 phút, đều trong ~1 giờ → nên tới bệnh viện. Đây là gợi ý, luôn nghe theo bác sĩ.
      </p>
    </section>
  );
}
