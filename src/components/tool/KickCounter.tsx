import { useState, useEffect, useRef } from 'preact/hooks';
import { loadKicks, saveKicks } from '../../lib/persist';
import { KICK_GOAL, MAX_SESSIONS, fmtDuration, type KickSession } from '../../lib/kicks';
import { burstConfetti } from '../../lib/confetti';

function fmtClock(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function KickCounter() {
  // ref is the synchronous source of truth so fast taps never drop a kick
  const ref = useRef<KickSession[]>([]);
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const s = loadKicks();
    ref.current = s;
    setSessions(s);
  }, []);

  const cur = sessions[0];
  const curActive = !!cur && !cur.endedAt;
  const curComplete = !!cur && !!cur.endedAt && cur.kicks.length >= KICK_GOAL;
  const activeId = curActive ? cur.id : null;

  // live elapsed ticker only while a session is open
  useEffect(() => {
    if (!activeId) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [activeId]);

  const commit = (next: KickSession[]) => {
    ref.current = next;
    setSessions(next);
    saveKicks(next);
  };

  const logKick = () => {
    const t = Date.now();
    const prev = ref.current;
    const c = prev[0];
    if (c && !c.endedAt) {
      const kicks = [...c.kicks, t];
      const done = kicks.length >= KICK_GOAL;
      commit([{ ...c, kicks, endedAt: done ? t : undefined }, ...prev.slice(1)]);
      if (done) burstConfetti();
    } else {
      commit([{ id: `k-${t}`, startedAt: t, kicks: [t] }, ...prev].slice(0, MAX_SESSIONS));
    }
  };

  const endSession = () => {
    const prev = ref.current;
    const c = prev[0];
    if (!c || c.endedAt) return;
    commit([{ ...c, endedAt: Date.now() }, ...prev.slice(1)]);
  };

  const count = curActive || curComplete ? cur.kicks.length : 0;
  const elapsed = curActive ? Date.now() - cur.startedAt : curComplete ? (cur.endedAt ?? 0) - cur.startedAt : 0;
  const pct = Math.min(100, (count / KICK_GOAL) * 100);

  const ended = sessions.filter((s) => s.endedAt);
  const history = curComplete ? ended.slice(1) : ended;

  return (
    <section aria-label="Đếm cú đạp của bé" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          👟 đếm cú đạp <span class="text-accent-ink">của bé</span>
        </h2>
        <span class="font-mono text-[0.62rem] text-muted/70">đếm tới {KICK_GOAL}</span>
      </div>
      <p class="mt-0.5 font-mono text-[0.66rem] text-muted">mỗi cú đạp là một commit nhỏ của bé 👶</p>

      <div class="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={logKick}
          aria-label={curComplete ? 'bắt đầu phiên đếm mới' : 'ghi một cú đạp'}
          class="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-accent text-white shadow-card transition-transform hover:bg-accent-ink active:scale-95"
        >
          <span class="text-center font-mono text-[0.7rem] font-medium leading-tight">
            {curComplete ? (
              <>
                ↺<br />phiên
                <br />mới
              </>
            ) : (
              <>
                👶<br />con vừa
                <br />đạp!
              </>
            )}
          </span>
        </button>

        <div class="min-w-0 flex-1">
          <p class="font-serif text-3xl font-semibold leading-none text-ink">
            <span class="tabular-nums">{count}</span>
            <span class="text-muted">/{KICK_GOAL}</span>
            <span class="ml-1.5 font-mono text-sm text-muted">cú đạp</span>
          </p>
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hair/[0.08]">
            <div class="h-full rounded-full bg-accent transition-[width] duration-200 ease-out" style={{ width: `${pct}%` }} />
          </div>

          {curActive ? (
            <div class="mt-2 flex items-center justify-between font-mono text-[0.7rem] text-muted">
              <span>⏱ {fmtDuration(elapsed)}</span>
              <button type="button" onClick={endSession} class="transition-colors hover:text-tagfix-ink">
                kết thúc
              </button>
            </div>
          ) : curComplete ? (
            <p class="mt-2 font-mono text-[0.7rem] text-accent-ink">
              🎉 đủ {KICK_GOAL} cú trong {fmtDuration(elapsed)} — bé khoẻ!
            </p>
          ) : (
            <p class="mt-2 font-mono text-[0.7rem] text-muted">chạm nút để bắt đầu một phiên đếm</p>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div class="mt-4 border-t border-hair/[0.06] pt-3">
          <p class="font-mono text-[0.66rem] text-muted/70">phiên gần đây</p>
          <ul class="mt-1.5 space-y-1">
            {history.slice(0, 4).map((s) => (
              <li key={s.id} class="flex items-center justify-between font-mono text-[0.7rem]">
                <span class="text-ink">{fmtClock(s.startedAt)}</span>
                <span class="text-muted">
                  {s.kicks.length} cú · {fmtDuration((s.endedAt ?? s.startedAt) - s.startedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p class="mt-3 font-mono text-[0.6rem] leading-relaxed text-muted/60">
        * gợi ý theo dõi, không thay tư vấn y tế — nên đếm cử động mỗi ngày từ tuần 28. Nếu bé ít cử động bất thường, hãy liên hệ bác sĩ.
      </p>
    </section>
  );
}
