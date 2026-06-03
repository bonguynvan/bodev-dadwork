import { useState, useEffect, useRef } from 'preact/hooks';
import { loadLog, saveLog } from '../../lib/persist';
import { LOG_KINDS, LOG_META, LOG_MAX, startOfToday, type LogEvent, type LogKind } from '../../lib/babylog';
import { timeAgo } from '../../lib/time';

export default function BabyLog() {
  // ref is the synchronous source of truth so fast taps never drop an entry
  const ref = useRef<LogEvent[]>([]);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    const e = loadLog();
    ref.current = e;
    setEvents(e);
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const commit = (next: LogEvent[]) => {
    ref.current = next;
    setEvents(next);
    saveLog(next);
    setNowMs(Date.now());
  };
  const logEvent = (kind: LogKind) => {
    const t = Date.now();
    commit([{ id: `lg-${t}-${kind}`, kind, at: t }, ...ref.current].slice(0, LOG_MAX));
  };
  const undoLast = () => {
    if (ref.current.length === 0) return;
    commit(ref.current.slice(1));
  };

  const today0 = nowMs ? startOfToday(nowMs) : 0;
  const todayCount = (k: LogKind) => events.filter((e) => e.kind === k && e.at >= today0).length;
  const lastOf = (k: LogKind) => events.find((e) => e.kind === k);
  const recent = events.slice(0, 6);

  return (
    <section aria-label="Nhật ký bé hôm nay" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          📋 nhật ký bé <span class="text-accent-ink">hôm nay</span>
        </h2>
        <span class="font-mono text-[0.62rem] text-muted/70">chạm để ghi nhanh</span>
      </div>
      <p class="mt-0.5 font-mono text-[0.66rem] text-muted">
        bú · ngủ · tã — mỗi lần là một commit nhỏ trong ngày của bé 👶
      </p>

      <div class="mt-4 grid grid-cols-3 gap-3">
        {LOG_KINDS.map((k) => {
          const m = LOG_META[k];
          const last = lastOf(k);
          return (
            <div class="flex flex-col items-center gap-1.5 text-center">
              <button
                type="button"
                onClick={() => logEvent(k)}
                aria-label={`ghi: ${m.verb}`}
                class="grid h-16 w-16 place-items-center rounded-2xl border border-hair/10 bg-accent/[0.06] text-2xl transition-all hover:bg-accent/[0.12] active:scale-90"
              >
                {m.emoji}
              </button>
              <p class="font-mono text-[0.7rem] text-ink">
                <span class="font-serif text-lg font-semibold tabular-nums">{todayCount(k)}</span> {m.label}
              </p>
              <p class="font-mono text-[0.6rem] text-muted">
                {last && nowMs ? `gần nhất ${timeAgo(last.at, nowMs)}` : 'chưa ghi'}
              </p>
            </div>
          );
        })}
      </div>

      {recent.length > 0 && (
        <div class="mt-4 border-t border-hair/[0.06] pt-3">
          <div class="flex items-center justify-between">
            <p class="font-mono text-[0.66rem] text-muted/70">gần đây</p>
            <button
              type="button"
              onClick={undoLast}
              class="font-mono text-[0.66rem] text-muted transition-colors hover:text-tagfix-ink"
            >
              ↩ hoàn tác
            </button>
          </div>
          <ul class="mt-1.5 space-y-1">
            {recent.map((e) => {
              const m = LOG_META[e.kind];
              return (
                <li key={e.id} class="flex items-center justify-between font-mono text-[0.7rem]">
                  <span class="text-ink">
                    {m.emoji} {m.verb}
                  </span>
                  <span class="text-muted">{nowMs ? timeAgo(e.at, nowMs) : ''}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
