import { useState, useEffect, useRef } from 'preact/hooks';
import { loadLog, saveLog } from '../../lib/persist';
import { LOG_KINDS, LOG_META, LOG_MAX, startOfToday, type LogEvent, type LogKind } from '../../lib/babylog';
import { timeAgo, epochDay } from '../../lib/time';

const mmss = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const dayLabel = (epochD: number): string => DOW[(((epochD + 4) % 7) + 7) % 7];

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

  // 7-day trend
  const todayD = nowMs ? epochDay(nowMs) : 0;
  const weekDays = Array.from({ length: 7 }, (_, i) => todayD - 6 + i);
  const weekStats = nowMs
    ? weekDays.map((d) => {
        const de = events.filter((e) => epochDay(e.at) === d);
        return {
          feeds: de.filter((e) => e.kind === 'feed').length,
          diapers: de.filter((e) => e.kind === 'diaper').length,
          sleepMs: de.filter((e) => e.kind === 'sleep').reduce((s, e) => s + ((e.endAt ?? nowMs) - e.at), 0),
        };
      })
    : [];
  const hasWeek = weekStats.some((x) => x.feeds || x.diapers || x.sleepMs);
  const maxFeed = Math.max(1, ...weekStats.map((x) => x.feeds));
  const avg = (f: (x: { feeds: number; diapers: number; sleepMs: number }) => number) =>
    weekStats.reduce((s, x) => s + f(x), 0) / 7;

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

      {hasWeek && (
        <div class="mt-4 border-t border-hair/[0.06] pt-3">
          <p class="font-mono text-[0.66rem] text-muted/70">
            📊 7 ngày qua · <span class="text-muted">🍼 cữ bú/ngày</span>
          </p>
          <div class="mt-2 flex h-14 items-end gap-1.5">
            {weekStats.map((x, i) => (
              <div key={weekDays[i]} class="flex h-full flex-1 flex-col items-center justify-end">
                <div
                  class={`w-full rounded-t ${weekDays[i] === todayD ? 'bg-accent' : 'bg-accent/45'}`}
                  style={{ height: `${Math.round((x.feeds / maxFeed) * 100)}%`, minHeight: x.feeds ? '3px' : '0px' }}
                  title={`${dayLabel(weekDays[i])}: ${x.feeds} cữ bú · ${x.diapers} tã`}
                />
              </div>
            ))}
          </div>
          <div class="mt-1 flex gap-1.5">
            {weekDays.map((d) => (
              <span
                key={d}
                class={`flex-1 text-center font-mono text-[0.55rem] ${d === todayD ? 'text-accent-ink' : 'text-muted/60'}`}
              >
                {dayLabel(d)}
              </span>
            ))}
          </div>
          <p class="mt-2 font-mono text-[0.66rem] text-muted">
            TB/ngày: <span class="text-ink">🍼 {avg((x) => x.feeds).toFixed(1)}</span> ·{' '}
            <span class="text-ink">💤 {(avg((x) => x.sleepMs) / 3_600_000).toFixed(1)}h</span> ·{' '}
            <span class="text-ink">💩 {avg((x) => x.diapers).toFixed(1)}</span>
          </p>
        </div>
      )}
    </section>
  );
}
