import { useState, useEffect, useRef } from 'preact/hooks';
import { loadMom, saveMom } from '../../lib/persist';
import { bmiOf, gainRange, recommendedBand, type MomData } from '../../lib/momweight';

const W = 320;
const H = 184;
const PAD_L = 30;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 26;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const MAX_WEEK = 40;

export default function MomWeight({ week }: { week: number }) {
  const ref = useRef<MomData>({ entries: [] });
  const [data, setData] = useState<MomData>({ entries: [] });
  const [editing, setEditing] = useState(false);
  const [preW, setPreW] = useState('');
  const [hCm, setHCm] = useState('');
  const [wForm, setWForm] = useState('');
  const [wkForm, setWkForm] = useState(String(Math.max(4, Math.min(MAX_WEEK, week))));

  useEffect(() => {
    const d = loadMom();
    ref.current = d;
    setData(d);
    setPreW(d.prePregWeightKg ? String(d.prePregWeightKg) : '');
    setHCm(d.heightCm ? String(d.heightCm) : '');
  }, []);

  const commit = (next: MomData) => {
    ref.current = next;
    setData(next);
    saveMom(next);
  };
  const saveProfile = () => {
    const prePregWeightKg = parseFloat(preW) || undefined;
    const heightCm = parseFloat(hCm) || undefined;
    if (!prePregWeightKg || !heightCm) return;
    commit({ ...ref.current, prePregWeightKg, heightCm });
    setEditing(false);
  };
  const addEntry = () => {
    const wk = Math.max(0, Math.min(MAX_WEEK, parseInt(wkForm, 10) || 0));
    const weightKg = parseFloat(wForm);
    if (!weightKg) return;
    const next = {
      ...ref.current,
      entries: [{ week: wk, weightKg, at: Date.now() }, ...ref.current.entries.filter((e) => e.week !== wk)].slice(0, 60),
    };
    commit(next);
    setWForm('');
  };

  const ready = data.prePregWeightKg != null && data.heightCm != null;

  // ---- setup form ----
  if (!ready || editing) {
    return (
      <section aria-label="Cân nặng của mẹ" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
        <h2 class="font-mono text-sm font-medium text-ink">
          🤰 cân nặng <span class="text-accent-ink">của mẹ</span>
        </h2>
        <p class="mt-0.5 font-mono text-[0.66rem] text-muted">nhập cân nặng trước khi mang thai &amp; chiều cao để tính mức tăng khuyến nghị</p>
        <div class="mt-3 flex flex-wrap items-end gap-2 font-mono text-xs">
          <label class="flex flex-col gap-1 text-muted">
            cân trước thai (kg)
            <input type="number" step="0.1" inputMode="decimal" placeholder="52" value={preW} onInput={(e) => setPreW((e.target as HTMLInputElement).value)} class="w-20 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
          </label>
          <label class="flex flex-col gap-1 text-muted">
            chiều cao (cm)
            <input type="number" step="0.5" inputMode="decimal" placeholder="160" value={hCm} onInput={(e) => setHCm((e.target as HTMLInputElement).value)} class="w-20 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
          </label>
          <button type="button" onClick={saveProfile} class="rounded-lg bg-accent px-3 py-1.5 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink">
            lưu
          </button>
          {ready && (
            <button type="button" onClick={() => setEditing(false)} class="font-mono text-xs text-muted hover:text-ink">
              huỷ
            </button>
          )}
        </div>
        <p class="mt-3 font-mono text-[0.6rem] leading-relaxed text-muted/60">🔒 chỉ lưu trên máy bạn · số liệu tham khảo, không thay tư vấn y tế.</p>
      </section>
    );
  }

  const bmi = bmiOf(data.prePregWeightKg!, data.heightCm!);
  const range = gainRange(bmi);
  const entries = [...data.entries].sort((a, b) => a.week - b.week);
  const gains = entries.map((e) => ({ week: e.week, gain: e.weightKg - data.prePregWeightKg! }));
  const latest = gains.length ? gains[gains.length - 1] : null;

  const maxGain = Math.ceil((Math.max(range.max + 2, ...gains.map((g) => g.gain), 6) * 1.1) / 2) * 2;
  const x = (w: number) => PAD_L + (Math.max(0, Math.min(MAX_WEEK, w)) / MAX_WEEK) * PLOT_W;
  const y = (g: number) => PAD_T + PLOT_H - (Math.max(0, g) / maxGain) * PLOT_H;

  // recommended band polygon (upper L→R, lower R→L)
  const weeks: number[] = [];
  for (let w = 0; w <= MAX_WEEK; w += 2) weeks.push(w);
  const upper = weeks.map((w) => `${x(w).toFixed(1)},${y(recommendedBand(w, range).hi).toFixed(1)}`);
  const lower = weeks
    .slice()
    .reverse()
    .map((w) => `${x(w).toFixed(1)},${y(recommendedBand(w, range).lo).toFixed(1)}`);
  const bandPts = [...upper, ...lower].join(' ');
  const userLine = gains.map((g) => `${x(g.week).toFixed(1)},${y(g.gain).toFixed(1)}`).join(' ');

  const yTicks: number[] = [];
  for (let g = 0; g <= maxGain; g += 4) yTicks.push(g);

  const band = latest ? recommendedBand(latest.week, range) : null;
  const status =
    latest && band
      ? latest.gain < band.lo - 0.5
        ? 'thấp hơn khuyến nghị'
        : latest.gain > band.hi + 0.5
          ? 'cao hơn khuyến nghị'
          : 'trong khoảng tốt ✓'
      : null;

  return (
    <section aria-label="Cân nặng của mẹ" class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between gap-3">
        <h2 class="font-mono text-sm font-medium text-ink">
          🤰 cân nặng <span class="text-accent-ink">của mẹ</span>
        </h2>
        <button type="button" onClick={() => setEditing(true)} class="font-mono text-[0.62rem] text-muted/70 transition-colors hover:text-accent-ink">
          ✏️ chỉnh
        </button>
      </div>
      <p class="mt-0.5 font-mono text-[0.66rem] text-muted">
        BMI {bmi.toFixed(1)} ({range.label}) · khuyến nghị tăng tổng <span class="text-accent-ink">{range.min}–{range.max} kg</span>
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} class="mt-3 w-full" role="img" aria-label="Biểu đồ tăng cân của mẹ theo tuần thai">
        {yTicks.map((g) => (
          <g key={`y${g}`}>
            <line x1={PAD_L} y1={y(g)} x2={W - PAD_R} y2={y(g)} style={{ stroke: 'rgb(var(--c-hair) / 0.10)' }} stroke-width="1" />
            <text x={PAD_L - 5} y={y(g) + 3} text-anchor="end" font-size="8" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
              {g}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40].map((w) => (
          <text key={`x${w}`} x={x(w)} y={H - 8} text-anchor="middle" font-size="8" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
            {w}
          </text>
        ))}
        <text x={PAD_L - 5} y={PAD_T - 2} text-anchor="end" font-size="7" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
          kg
        </text>
        <text x={W - PAD_R} y={H - 8} text-anchor="end" font-size="7" style={{ fill: 'rgb(var(--c-muted))' }} class="font-mono">
          tuần
        </text>
        {/* recommended band */}
        <polygon points={bandPts} style={{ fill: 'rgb(var(--c-accent) / 0.12)' }} />
        {/* user line + points */}
        {gains.length > 1 && (
          <polyline points={userLine} fill="none" style={{ stroke: 'rgb(var(--c-accent))' }} stroke-width="2" stroke-linejoin="round" />
        )}
        {gains.map((g, i) => (
          <circle key={i} cx={x(g.week)} cy={y(g.gain)} r="3.5" style={{ fill: 'rgb(var(--c-accent))' }} />
        ))}
      </svg>
      <div class="-mt-1 flex justify-center gap-4 font-mono text-[0.6rem] text-muted">
        <span class="inline-flex items-center gap-1"><span class="inline-block h-0.5 w-4 bg-accent" /> mẹ</span>
        <span class="inline-flex items-center gap-1"><span class="inline-block h-2 w-4 rounded-sm bg-accent/20" /> khoảng khuyến nghị</span>
      </div>

      {latest && (
        <p class="mt-2 text-center font-mono text-xs text-ink">
          tuần {latest.week}: đã tăng <span class="text-accent-ink">{latest.gain >= 0 ? '+' : ''}{latest.gain.toFixed(1)} kg</span>
          {status && <span class="text-muted"> · {status}</span>}
        </p>
      )}

      <div class="mt-3 flex flex-wrap items-end gap-2 border-t border-hair/[0.06] pt-3 font-mono text-xs">
        <label class="flex flex-col gap-1 text-muted">
          tuần
          <input type="number" min={0} max={MAX_WEEK} value={wkForm} onInput={(e) => setWkForm((e.target as HTMLInputElement).value)} class="w-14 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
        </label>
        <label class="flex flex-col gap-1 text-muted">
          cân nặng (kg)
          <input type="number" step="0.1" inputMode="decimal" placeholder="58.5" value={wForm} onInput={(e) => setWForm((e.target as HTMLInputElement).value)} class="w-24 rounded-lg border border-hair/15 bg-surface px-2 py-1 text-ink focus:border-accent/40 focus:outline-none" />
        </label>
        <button type="button" onClick={addEntry} class="rounded-lg bg-accent px-3 py-1.5 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink">
          ghi
        </button>
      </div>

      <p class="mt-3 font-mono text-[0.6rem] leading-relaxed text-muted/60">* khoảng khuyến nghị theo BMI trước thai — tham khảo, không thay tư vấn của bác sĩ sản khoa.</p>
    </section>
  );
}
