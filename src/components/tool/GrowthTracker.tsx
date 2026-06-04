import { useState, useEffect, useRef } from 'preact/hooks';
import { loadGrowth, saveGrowth } from '../../lib/persist';
import { GROWTH_MAX, type GrowthEntry } from '../../lib/growth';
import { MONTHS } from '../../lib/postpartum';

const W = 320;
const H = 184;
const PAD_L = 30;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const MAX_MONTH = 24;

const typicalKg = (m: number): number | undefined => {
  const row = MONTHS.find((x) => x.month === m);
  return row ? row.weightG / 1000 : undefined;
};

export default function GrowthTracker({ month }: { month: number }) {
  const ref = useRef<GrowthEntry[]>([]);
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [mForm, setMForm] = useState(String(Math.max(0, Math.min(MAX_MONTH, month))));
  const [wForm, setWForm] = useState('');
  const [hForm, setHForm] = useState('');

  useEffect(() => {
    const e = loadGrowth();
    ref.current = e;
    setEntries(e);
  }, []);

  const commit = (next: GrowthEntry[]) => {
    ref.current = next;
    setEntries(next);
    saveGrowth(next);
  };

  const add = () => {
    const mo = Math.max(0, Math.min(MAX_MONTH, parseInt(mForm, 10) || 0));
    const weightKg = parseFloat(wForm) || undefined;
    const heightCm = parseFloat(hForm) || undefined;
    if (!weightKg && !heightCm) return;
    const next = [
      { id: `g-${Date.now()}`, at: Date.now(), month: mo, weightKg, heightCm },
      ...ref.current.filter((e) => e.month !== mo),
    ].slice(0, GROWTH_MAX);
    commit(next);
    setWForm('');
    setHForm('');
  };
  const removeEntry = (id: string) => commit(ref.current.filter((e) => e.id !== id));

  // ---- chart geometry (weight vs age) ----
  const weightEntries = entries.filter((e) => e.weightKg != null).sort((a, b) => a.month - b.month);
  const rawMax = Math.max(8, ...MONTHS.map((m) => m.weightG / 1000), ...weightEntries.map((e) => e.weightKg!));
  const maxKg = Math.ceil((rawMax * 1.12) / 2) * 2;
  const x = (m: number) => PAD_L + (Math.max(0, Math.min(MAX_MONTH, m)) / MAX_MONTH) * PLOT_W;
  const y = (kg: number) => PAD_T + PLOT_H - (Math.max(0, kg) / maxKg) * PLOT_H;

  const typicalPts = MONTHS.map((m) => `${x(m.month).toFixed(1)},${y(m.weightG / 1000).toFixed(1)}`).join(' ');
  const userLine = weightEntries.map((e) => `${x(e.month).toFixed(1)},${y(e.weightKg!).toFixed(1)}`).join(' ');
  const yTicks: number[] = [];
  for (let kg = 0; kg <= maxKg; kg += 4) yTicks.push(kg);

  const sorted = [...entries].sort((a, b) => a.month - b.month);

  return (
    <section aria-label="Biểu đồ tăng trưởng của bé" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          📈 tăng trưởng <span class="text-accent-ink">của bé</span>
        </h2>
        <span class="font-mono text-[0.62rem] text-muted/70">cân nặng vs trung bình</span>
      </div>
      <p class="mt-0.5 font-mono text-[0.66rem] text-muted">ghi cân nặng &amp; chiều cao mỗi lần khám 📏</p>

      {/* chart */}
      <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label="Biểu đồ cân nặng theo tháng tuổi">
        {yTicks.map((kg) => (
          <g key={`y${kg}`}>
            <line x1={PAD_L} y1={y(kg)} x2={W - PAD_R} y2={y(kg)} style={{ stroke: 'rgb(var(--c-hair) / 0.10)' }} stroke-width="1" />
            <text x={PAD_L - 5} y={y(kg) + 3} text-anchor="end" font-size="8" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
              {kg}
            </text>
          </g>
        ))}
        {[0, 6, 12, 18, 24].map((mo) => (
          <text key={`x${mo}`} x={x(mo)} y={H - 8} text-anchor="middle" font-size="8" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
            {mo}
          </text>
        ))}
        <text x={PAD_L - 5} y={PAD_T - 2} text-anchor="end" font-size="7" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
          kg
        </text>
        <text x={W - PAD_R} y={H - 8} text-anchor="end" font-size="7" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
          tháng
        </text>

        {/* typical curve */}
        <polyline points={typicalPts} fill="none" style={{ stroke: 'rgb(var(--c-muted) / 0.45)' }} stroke-width="1.5" stroke-dasharray="3 3" />
        {/* user line + points */}
        {weightEntries.length > 1 && (
          <polyline points={userLine} fill="none" style={{ stroke: 'rgb(var(--c-accent))' }} stroke-width="2" stroke-linejoin="round" />
        )}
        {weightEntries.map((e) => (
          <circle key={e.id} cx={x(e.month)} cy={y(e.weightKg!)} r="3.5" style={{ fill: 'rgb(var(--c-accent))' }} />
        ))}
      </svg>
      <div class="-mt-1 flex justify-center gap-4 font-mono text-[0.6rem] text-muted">
        <span class="inline-flex items-center gap-1"><span class="inline-block h-0.5 w-4 bg-accent" /> bé</span>
        <span class="inline-flex items-center gap-1"><span class="inline-block h-0 w-4 border-t border-dashed border-muted/60" /> trung bình</span>
      </div>

      {/* add form */}
      <div class="mt-3 flex flex-wrap items-end gap-2 border-t border-hair/[0.06] pt-3 font-mono text-xs">
        <label class="flex flex-col gap-1 text-muted">
          tháng
          <input
            type="number"
            min={0}
            max={MAX_MONTH}
            value={mForm}
            onInput={(e) => setMForm((e.target as HTMLInputElement).value)}
            class="w-14 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none"
          />
        </label>
        <label class="flex flex-col gap-1 text-muted">
          cân nặng (kg)
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="vd 7.2"
            value={wForm}
            onInput={(e) => setWForm((e.target as HTMLInputElement).value)}
            class="w-20 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none"
          />
        </label>
        <label class="flex flex-col gap-1 text-muted">
          cao (cm)
          <input
            type="number"
            step="0.5"
            inputMode="decimal"
            placeholder="vd 68"
            value={hForm}
            onInput={(e) => setHForm((e.target as HTMLInputElement).value)}
            class="w-20 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={add}
          class="rounded-lg bg-accent px-3 py-1.5 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink"
        >
          ghi
        </button>
      </div>

      {/* entry list */}
      {sorted.length > 0 && (
        <ul class="mt-3 space-y-1">
          {sorted.map((e) => {
            const typ = e.weightKg != null ? typicalKg(e.month) : undefined;
            const diff = typ != null && e.weightKg != null ? e.weightKg - typ : null;
            const tag =
              diff == null ? '' : Math.abs(diff) < 0.4 ? 'đúng chuẩn' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg vs TB`;
            return (
              <li key={e.id} class="flex items-center justify-between gap-2 font-mono text-[0.7rem]">
                <span class="text-ink">
                  tháng {e.month}
                  {e.weightKg != null && <span> · {e.weightKg}kg</span>}
                  {e.heightCm != null && <span> · {e.heightCm}cm</span>}
                </span>
                <span class="flex items-center gap-2">
                  {tag && <span class={Math.abs(diff ?? 0) < 0.4 ? 'text-accent-ink' : 'text-muted'}>{tag}</span>}
                  <button type="button" onClick={() => removeEntry(e.id)} aria-label="xoá" class="text-muted/60 transition-colors hover:text-tagfix-ink">
                    ✕
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p class="mt-3 font-mono text-[0.6rem] leading-relaxed text-muted/60">
        * "trung bình" là giá trị tham khảo, không phải bách phân vị WHO. Mỗi bé một nhịp — hãy theo lịch khám của bác sĩ.
      </p>
    </section>
  );
}
