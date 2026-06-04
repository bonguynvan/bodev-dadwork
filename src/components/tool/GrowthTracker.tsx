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

type MetricKey = 'weight' | 'height' | 'head';
interface Metric {
  key: MetricKey;
  field: 'weightKg' | 'heightCm' | 'headCm';
  label: string;
  unit: string;
  tick: number;
  base: number;
  typical: (m: number) => number | undefined;
}
const METRICS: Metric[] = [
  {
    key: 'weight',
    field: 'weightKg',
    label: 'cân nặng',
    unit: 'kg',
    tick: 4,
    base: 8,
    typical: (m) => {
      const r = MONTHS.find((x) => x.month === m);
      return r ? r.weightG / 1000 : undefined;
    },
  },
  {
    key: 'height',
    field: 'heightCm',
    label: 'chiều cao',
    unit: 'cm',
    tick: 20,
    base: 60,
    typical: (m) => MONTHS.find((x) => x.month === m)?.lengthCm,
  },
  { key: 'head', field: 'headCm', label: 'vòng đầu', unit: 'cm', tick: 10, base: 45, typical: () => undefined },
];

export default function GrowthTracker({ month }: { month: number }) {
  const ref = useRef<GrowthEntry[]>([]);
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [metricKey, setMetricKey] = useState<MetricKey>('weight');
  const [mForm, setMForm] = useState(String(Math.max(0, Math.min(MAX_MONTH, month))));
  const [wForm, setWForm] = useState('');
  const [hForm, setHForm] = useState('');
  const [headForm, setHeadForm] = useState('');

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
    const headCm = parseFloat(headForm) || undefined;
    if (!weightKg && !heightCm && !headCm) return;
    const prev = ref.current.find((e) => e.month === mo);
    const merged = {
      id: `g-${Date.now()}`,
      at: Date.now(),
      month: mo,
      weightKg: weightKg ?? prev?.weightKg,
      heightCm: heightCm ?? prev?.heightCm,
      headCm: headCm ?? prev?.headCm,
    };
    commit([merged, ...ref.current.filter((e) => e.month !== mo)].slice(0, GROWTH_MAX));
    setWForm('');
    setHForm('');
    setHeadForm('');
  };
  const removeEntry = (id: string) => commit(ref.current.filter((e) => e.id !== id));

  const metric = METRICS.find((m) => m.key === metricKey)!;
  const pts = entries
    .filter((e) => e[metric.field] != null)
    .sort((a, b) => a.month - b.month)
    .map((e) => ({ month: e.month, val: e[metric.field] as number }));

  const typicalVals = MONTHS.map((m) => metric.typical(m.month)).filter((v): v is number => v != null);
  const rawMax = Math.max(metric.base, ...typicalVals, ...pts.map((p) => p.val));
  const maxY = Math.ceil((rawMax * 1.12) / metric.tick) * metric.tick;
  const x = (m: number) => PAD_L + (Math.max(0, Math.min(MAX_MONTH, m)) / MAX_MONTH) * PLOT_W;
  const y = (v: number) => PAD_T + PLOT_H - (Math.max(0, v) / maxY) * PLOT_H;

  const typicalPts = MONTHS.map((m) => {
    const v = metric.typical(m.month);
    return v != null ? `${x(m.month).toFixed(1)},${y(v).toFixed(1)}` : null;
  })
    .filter(Boolean)
    .join(' ');
  const userLine = pts.map((p) => `${x(p.month).toFixed(1)},${y(p.val).toFixed(1)}`).join(' ');
  const yTicks: number[] = [];
  for (let v = 0; v <= maxY; v += metric.tick) yTicks.push(v);

  const sorted = [...entries].sort((a, b) => a.month - b.month);

  return (
    <section aria-label="Biểu đồ tăng trưởng của bé" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          📈 tăng trưởng <span class="text-accent-ink">của bé</span>
        </h2>
        <span class="font-mono text-[0.62rem] text-muted/70">{metric.label} vs trung bình</span>
      </div>

      <div class="mt-2 flex gap-1.5">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMetricKey(m.key)}
            class={`rounded-full px-2.5 py-1 font-mono text-[0.68rem] transition-colors ${
              metricKey === m.key ? 'bg-accent text-white' : 'border border-hair/15 text-muted hover:text-ink'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label={`Biểu đồ ${metric.label} theo tháng tuổi`}>
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={PAD_L} y1={y(v)} x2={W - PAD_R} y2={y(v)} style={{ stroke: 'rgb(var(--c-hair) / 0.10)' }} stroke-width="1" />
            <text x={PAD_L - 5} y={y(v) + 3} text-anchor="end" font-size="8" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
              {v}
            </text>
          </g>
        ))}
        {[0, 6, 12, 18, 24].map((mo) => (
          <text key={`x${mo}`} x={x(mo)} y={H - 8} text-anchor="middle" font-size="8" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
            {mo}
          </text>
        ))}
        <text x={PAD_L - 5} y={PAD_T - 2} text-anchor="end" font-size="7" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
          {metric.unit}
        </text>
        <text x={W - PAD_R} y={H - 8} text-anchor="end" font-size="7" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
          tháng
        </text>

        {typicalPts && (
          <polyline points={typicalPts} fill="none" style={{ stroke: 'rgb(var(--c-muted) / 0.45)' }} stroke-width="1.5" stroke-dasharray="3 3" />
        )}
        {pts.length > 1 && (
          <polyline points={userLine} fill="none" style={{ stroke: 'rgb(var(--c-accent))' }} stroke-width="2" stroke-linejoin="round" />
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={x(p.month)} cy={y(p.val)} r="3.5" style={{ fill: 'rgb(var(--c-accent))' }} />
        ))}
      </svg>
      <div class="-mt-1 flex justify-center gap-4 font-mono text-[0.6rem] text-muted">
        <span class="inline-flex items-center gap-1"><span class="inline-block h-0.5 w-4 bg-accent" /> bé</span>
        {typicalPts ? (
          <span class="inline-flex items-center gap-1"><span class="inline-block h-0 w-4 border-t border-dashed border-muted/60" /> trung bình</span>
        ) : (
          <span class="text-muted/60">chưa có đường trung bình cho {metric.label}</span>
        )}
      </div>

      <div class="mt-3 flex flex-wrap items-end gap-2 border-t border-hair/[0.06] pt-3 font-mono text-xs">
        <label class="flex flex-col gap-1 text-muted">
          tháng
          <input type="number" min={0} max={MAX_MONTH} value={mForm} onInput={(e) => setMForm((e.target as HTMLInputElement).value)} class="w-12 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
        </label>
        <label class="flex flex-col gap-1 text-muted">
          kg
          <input type="number" step="0.1" inputMode="decimal" placeholder="7.2" value={wForm} onInput={(e) => setWForm((e.target as HTMLInputElement).value)} class="w-16 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
        </label>
        <label class="flex flex-col gap-1 text-muted">
          cao cm
          <input type="number" step="0.5" inputMode="decimal" placeholder="68" value={hForm} onInput={(e) => setHForm((e.target as HTMLInputElement).value)} class="w-16 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
        </label>
        <label class="flex flex-col gap-1 text-muted">
          vòng đầu
          <input type="number" step="0.5" inputMode="decimal" placeholder="44" value={headForm} onInput={(e) => setHeadForm((e.target as HTMLInputElement).value)} class="w-16 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
        </label>
        <button type="button" onClick={add} class="rounded-lg bg-accent px-3 py-1.5 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink">
          ghi
        </button>
      </div>

      {sorted.length > 0 && (
        <ul class="mt-3 space-y-1">
          {sorted.map((e) => {
            const wTyp = MONTHS.find((x) => x.month === e.month);
            const diff = e.weightKg != null && wTyp ? e.weightKg - wTyp.weightG / 1000 : null;
            const tag = diff == null ? '' : Math.abs(diff) < 0.4 ? 'đúng chuẩn' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg`;
            return (
              <li key={e.id} class="flex items-center justify-between gap-2 font-mono text-[0.7rem]">
                <span class="text-ink">
                  tháng {e.month}
                  {e.weightKg != null && <span> · {e.weightKg}kg</span>}
                  {e.heightCm != null && <span> · {e.heightCm}cm</span>}
                  {e.headCm != null && <span> · đầu {e.headCm}cm</span>}
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
