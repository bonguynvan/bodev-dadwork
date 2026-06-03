import { useState, useRef } from 'preact/hooks';
import { babyDiary } from '../../lib/store';
import { getStage } from '../../lib/stages';

/** Draggable before/after slider across two diary photos. */
export default function BabyCompare() {
  const stages = Object.keys(babyDiary.value).map(Number).sort((x, y) => x - y);
  const [aSel, setASel] = useState<number | null>(null);
  const [bSel, setBSel] = useState<number | null>(null);
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  if (stages.length < 2) return null;

  // keep selections valid if the diary changes underneath us
  const a = aSel != null && babyDiary.value[aSel] ? aSel : stages[0];
  const b = bSel != null && babyDiary.value[bSel] ? bSel : stages[stages.length - 1];
  const stA = getStage(a);
  const stB = getStage(b);

  const move = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  const delta =
    a < 41 && b < 41 ? `+${b - a} tuần` : a >= 41 && b >= 41 ? `+${b - a} tháng` : null;

  return (
    <section aria-label="So sánh ảnh bé" class="mt-8">
      <div class="mb-3 flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          ↔ so sánh <span class="text-accent-ink">bé lớn nhanh</span>
        </h2>
        {delta && (
          <span class="font-mono text-xs text-muted">
            {stA.label} → {stB.label} · {delta}
          </span>
        )}
      </div>

      <div class="mb-3 flex flex-wrap items-center gap-3 font-mono text-xs">
        <label class="flex items-center gap-1.5 text-muted">
          trước
          <select
            value={a}
            onChange={(e) => setASel(Number((e.target as HTMLSelectElement).value))}
            class="rounded-lg border border-hair/15 bg-card px-2 py-1 text-ink focus:border-accent/40 focus:outline-none"
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {getStage(s).label}
              </option>
            ))}
          </select>
        </label>
        <label class="flex items-center gap-1.5 text-muted">
          sau
          <select
            value={b}
            onChange={(e) => setBSel(Number((e.target as HTMLSelectElement).value))}
            class="rounded-lg border border-hair/15 bg-card px-2 py-1 text-ink focus:border-accent/40 focus:outline-none"
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {getStage(s).label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        ref={ref}
        class="relative mx-auto aspect-square w-full max-w-md touch-none select-none overflow-hidden rounded-2xl border border-hair/10 shadow-card"
        onPointerDown={(e) => {
          drag.current = true;
          move(e.clientX);
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {
            /* capture is best-effort */
          }
        }}
        onPointerMove={(e) => drag.current && move(e.clientX)}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
      >
        {/* after (bottom layer) */}
        <img src={babyDiary.value[b].url} alt={`bé ${stB.label}`} class="absolute inset-0 h-full w-full object-cover" />
        {/* before (top layer, clipped to the left portion) */}
        <div class="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={babyDiary.value[a].url} alt={`bé ${stA.label}`} class="h-full w-full object-cover" />
        </div>

        <span class="absolute bottom-2 left-2 rounded bg-scrim/55 px-1.5 py-0.5 font-mono text-[0.62rem] text-white backdrop-blur-sm">
          {stA.label}
        </span>
        <span class="absolute bottom-2 right-2 rounded bg-scrim/55 px-1.5 py-0.5 font-mono text-[0.62rem] text-white backdrop-blur-sm">
          {stB.label}
        </span>

        {/* divider + handle */}
        <div data-divider class="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/85" style={{ left: `${pos}%` }}>
          <span class="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/90 bg-scrim/50 font-mono text-sm text-white backdrop-blur-sm">
            ↔
          </span>
        </div>
      </div>
      <p class="mt-2 text-center font-mono text-[0.66rem] text-muted/70">kéo thanh giữa để so sánh ✋</p>
    </section>
  );
}
