import { useState, useEffect, useRef } from 'preact/hooks';
import { loadLog, saveLog } from '../../lib/persist';
import { LOG_KINDS, LOG_META, LOG_MAX, startOfToday, type LogEvent, type LogKind } from '../../lib/babylog';
import { timeAgo } from '../../lib/time';

const mmss = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function BabyLog() {
  const ref = useRef<LogEvent[]>([]);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    const e = loadLog();
    ref.current = e;
    setEvents(e);
    setNowMs(Date.now());
  }, []);

  const activeSleep = events.find((e) => e.kind === 'sleep' && !e.endAt) ?? null;
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), activeSleep ? 1000 : 30_000);
    return () => clearInterval(id);
  }, [!!activeSleep]);

  const commit = (next: LogEvent[]) => {
    ref.current = next;
    setEvents(next);
    saveLog(next);
    setNowMs(Date.now());
  };
  const toggleSleep = () => {
    const t = Date.now();
    const a = ref.current.find((e) => e.kind === 'sleep' && !e.endAt);
    if (a) commit(ref.current.map((e) => (e.id === a.id ? { ...e, endAt: t } : e)));
    else commit([{ id: `lg-${t}-sleep`, kind: 'sleep', at: t }, ...ref.current].slice(0, LOG_MAX));
  };
  const logEvent = (kind: LogKind) => {
    if (kind === 'sleep') return toggleSleep();
    const t = Date.now();
    commit([{ id: `lg-${t}-${kind}`, kind, at: t }, ...ref.current].slice(0, LOG_MAX));
  };
  const undoLast = () => {
    if (ref.current.length) commit(ref.current.slice(1));
  };

  const today0 = nowMs ? startOfToday(nowMs) : 0;
  const todayCount = (k: LogKind) => events.filter((e) => e.kind === k && e.at >= today0).length;
  const lastOf = (k: LogKind) => events.find((e) => e.kind === k);
  const lastEndedSleep = events.find((e) => e.kind === 'sleep' && e.endAt);
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

      {activeSleep && (
        <div class="mt-3 flex items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2">
          <span class="font-mono text-xs text-ink">
            💤 bé đang ngủ · <span class="tabular-nums text-accent-ink">{mmss(nowMs - activeSleep.at)}</span>
          </span>
          <button
            type="button"
            onClick={toggleSleep}
            class="rounded-md bg-accent px-2.5 py-1 font-mono text-[0.7rem] font-medium text-white transition-colors hover:bg-accent-ink"
          >
            ☀️ thức dậy
          </button>
        </div>
      )}

      <div class="mt-4 grid grid-cols-3 gap-3">
        {LOG_KINDS.map((k) => {
          const m = LOG_META[k];
          const sleeping = k === 'sleep' && !!activeSleep;
          const last = lastOf(k);
          let hint: string;
          if (k === 'sleep') {
            hint = sleeping
              ? `đang ngủ ${mmss(nowMs - activeSleep!.at)}`
              : lastEndedSleep && nowMs
                ? `dậy ${timeAgo(lastEndedSleep.endAt!, nowMs)}`
                : 'chưa ghi';
          } else {
            hint = last && nowMs ? `gần nhất ${timeAgo(last.at, nowMs)}` : 'chưa ghi';
          }
          return (
            <div class="flex flex-col items-center gap-1.5 text-center">
              <button
                type="button"
                onClick={() => logEvent(k)}
                aria-label={sleeping ? 'ghi: bé thức dậy' : `ghi: ${m.verb}`}
                class={`grid h-16 w-16 place-items-center rounded-2xl border text-2xl transition-all active:scale-90 ${
                  sleeping
                    ? 'border-accent bg-accent/[0.14] hover:bg-accent/20'
                    : 'border-hair/10 bg-accent/[0.06] hover:bg-accent/[0.12]'
                }`}
              >
                {sleeping ? '☀️' : m.emoji}
              </button>
              <p class="font-mono text-[0.7rem] text-ink">
                <span class="font-serif text-lg font-semibold tabular-nums">{todayCount(k)}</span> {m.label}
              </p>
              <p class="font-mono text-[0.6rem] text-muted">{hint}</p>
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
              const isSleep = e.kind === 'sleep';
              return (
                <li key={e.id} class="flex items-center justify-between gap-2 font-mono text-[0.7rem]">
                  <span class="text-ink">
                    {isSleep ? '💤' : m.emoji}{' '}
                    {isSleep
                      ? e.endAt
                        ? `ngủ ${mmss(e.endAt - e.at)}`
                        : 'đang ngủ…'
                      : m.verb}
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
