import { useState, useEffect } from 'preact/hooks';
import BabyCartoon from './BabyCartoon';
import DadIssues from './DadIssues';
import { dueDateFromWeek } from '../../lib/pregnancy';
import { getStage, clampStage, STAGE_MIN, STAGE_MAX, DEFAULT_STAGE } from '../../lib/stages';
import {
  babyWeek,
  dueDate,
  setBabyWeek,
  setDueDateMs,
  babyDiary,
  setDiaryPhoto,
  removeDiaryPhoto,
  streak,
  you,
  hydrated,
  needsOnboarding,
} from '../../lib/store';
import { compressImage } from '../../lib/image';
import { renderShareCard, shareImage } from '../../lib/shareCard';
import BabyDiary from './BabyDiary';
import BabyCompare from './BabyCompare';
import BabyNamer from './BabyNamer';
import BabyTools from './BabyTools';

function fmtWeight(g: number): string {
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`;
}
function fmtDate(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}
function toInputDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  initialWeek?: number;
  variant?: 'home' | 'page';
}

export default function BabyTool({ initialWeek, variant = 'home' }: Props) {
  const connected = initialWeek == null;
  const [mounted, setMounted] = useState(false);
  const [localWeek, setLocalWeek] = useState(clampStage(initialWeek ?? DEFAULT_STAGE));
  const [showCartoon, setShowCartoon] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState('');
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [editStage, setEditStage] = useState(false);

  useEffect(() => setMounted(true), []);

  const pickBabyPhoto = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setPhotoErr('');
    setPhotoBusy(true);
    try {
      const url = await compressImage(file, 640);
      setDiaryPhoto(babyWeek.value, url);
      setShowCartoon(false);
    } catch (err) {
      setPhotoErr(err instanceof Error ? err.message : 'Không tải được ảnh');
    } finally {
      setPhotoBusy(false);
      input.value = '';
    }
  };
  const pill = (on: boolean): string =>
    `rounded-full px-2 py-0.5 transition-colors ${on ? 'bg-accent/15 text-accent-ink' : 'text-muted hover:text-ink'}`;

  const wk = connected ? babyWeek.value : localWeek;
  const change = (w: number) => (connected ? setBabyWeek(w) : setLocalWeek(clampStage(w)));

  const st = getStage(wk);
  const womb = st.phase === 'womb';
  const photo = connected ? (babyDiary.value[wk]?.url ?? null) : null;

  // when the stage changes, default back to showing that stage's photo (if any)
  useEffect(() => setShowCartoon(false), [wk]);

  // once the baby is registered (onboarding done), the stage is no longer a
  // free playground — lock the editor behind an explicit "chỉnh" affordance.
  const registered = connected && hydrated.value && !needsOnboarding.value;
  const showControls = !registered || editStage;

  const onShare = async () => {
    if (shareBusy) return;
    setShareBusy(true);
    setShareMsg('');
    try {
      const titleCap = st.label.charAt(0).toUpperCase() + st.label.slice(1);
      const sub = womb
        ? `còn ${st.weeksLeft} tuần → v1.0.0`
        : st.month && st.month > 0
          ? `${st.month} tháng tuổi`
          : 'sơ sinh 🎉';
      const blob = await renderShareCard({
        title: titleCap,
        name: connected ? you.value?.babyName : undefined,
        version: st.version,
        compare: st.compare,
        emoji: st.emoji,
        caption: photo ? babyDiary.value[wk]?.caption : undefined,
        sub,
        photoUrl: photo ?? undefined,
        streak: streak.value,
        pct: st.pct,
      });
      const res = await shareImage(
        blob,
        `bodev-${st.label.replace(/\s+/g, '-')}.png`,
        `Bé của mình đang ở ${titleCap} 🍼 — theo dõi tại bodev.vn`,
      );
      setShareMsg(res === 'shared' ? 'đã chia sẻ ✓' : 'đã lưu ảnh 📥 đăng lên nhé!');
    } catch {
      setShareMsg('không tạo được ảnh');
    } finally {
      setShareBusy(false);
      window.setTimeout(() => setShareMsg(''), 4000);
    }
  };

  const due =
    womb
      ? ((connected ? dueDate.value : null) ?? (mounted ? dueDateFromWeek(st.week!, Date.now()) : null))
      : null;
  const days = mounted && due ? Math.max(0, Math.ceil((due - Date.now()) / 86_400_000)) : null;

  return (
    <div>
      <section
        aria-label="Theo dõi bé theo tuần"
        class="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-10"
      >
        {/* ---- baby ---- */}
        <div class="relative mx-auto w-full max-w-[min(82vw,420px)]">
          <div class="aspect-square w-full">
            {photo && !showCartoon ? (
              <img
                src={photo}
                alt="ảnh bé của bạn"
                class="h-full w-full rounded-[2rem] border border-hair/10 object-cover shadow-card"
              />
            ) : (
              <BabyCartoon stage={wk} mood={st.mood} phase={st.phase} size={420} />
            )}
          </div>
          {connected && <BabyNamer />}
          <p class="mt-1 text-center font-mono text-[0.7rem] text-muted/70">
            {st.label} · {st.version}
          </p>

          {connected && (
            <div class="mt-2 flex flex-col items-center gap-1">
              {photo ? (
                <div class="flex flex-wrap items-center justify-center gap-2 font-mono text-[0.68rem]">
                  <button type="button" onClick={() => setShowCartoon(false)} class={pill(!showCartoon)}>
                    📷 ảnh thật
                  </button>
                  <button type="button" onClick={() => setShowCartoon(true)} class={pill(showCartoon)}>
                    ✏️ hí hoạ
                  </button>
                  <span class="text-hair/20" aria-hidden="true">·</span>
                  <label class="cursor-pointer text-muted transition-colors hover:text-accent-ink">
                    đổi
                    <input type="file" accept="image/*" class="hidden" onChange={pickBabyPhoto} disabled={photoBusy} />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      removeDiaryPhoto(babyWeek.value);
                      setShowCartoon(false);
                    }}
                    class="text-muted transition-colors hover:text-tagfix-ink"
                  >
                    gỡ
                  </button>
                </div>
              ) : (
                <label class="cursor-pointer rounded-full border border-hair/15 px-3 py-1 font-mono text-[0.68rem] text-muted transition-colors hover:border-accent/40 hover:text-accent-ink">
                  {photoBusy ? 'đang xử lý…' : '📷 thêm ảnh mốc này'}
                  <input type="file" accept="image/*" class="hidden" onChange={pickBabyPhoto} disabled={photoBusy} />
                </label>
              )}
              <p class="font-mono text-[0.6rem] text-muted/60">🔒 ảnh lưu trên máy bạn</p>
              {photoErr && <p class="font-mono text-[0.6rem] text-tagfix-ink">{photoErr}</p>}
            </div>
          )}
        </div>

        {/* ---- panel ---- */}
        <div class="min-w-0">
          {variant === 'home' && (
            <>
              <p class="font-mono text-xs text-muted">
                <span class="text-accent-ink">//</span> theo dõi bé · thai kỳ → 2 tuổi
              </p>
              <h1 class="mt-2 font-serif text-[2.2rem] font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl">
                Bé lớn lên từng ngày
              </h1>
            </>
          )}

          <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
            <span class="rounded bg-accent/10 px-1.5 py-0.5 text-accent-ink">{st.version}</span>
            <span class="text-ink">{st.label}{womb ? '/40' : ''}</span>
            <span class="text-hair/20">·</span>
            <span>{st.sub}</span>
            <span class="text-hair/20">·</span>
            <span class="tabular-nums">{st.pct}%</span>
          </div>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-hair/[0.06]">
            <div
              class="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${st.pct}%` }}
            />
          </div>

          <div class="mt-5">
            <p class="font-serif text-2xl font-medium text-ink md:text-[1.7rem]">
              ≈ {st.compare} <span aria-hidden="true">{st.emoji}</span>
            </p>
            <p class="mt-1 font-mono text-xs text-muted">
              dài <span class="text-ink">{st.lengthCm} cm</span> · nặng{' '}
              <span class="text-ink">{fmtWeight(st.weightG)}</span>
            </p>
          </div>

          <p class="mt-4 flex gap-2 font-serif text-[1.05rem] leading-snug text-ink">
            <span aria-hidden="true" class="text-accent-ink">▸</span>
            <span>{st.milestone}</span>
          </p>

          {/* controls — collapse to a locked summary once the baby is registered */}
          {showControls ? (
            <div class="mt-6 rounded-xl border border-hair/10 bg-card p-4 shadow-card">
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="lùi"
                  onClick={() => change(wk - 1)}
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hair/10 font-mono text-lg text-ink transition-colors hover:bg-hair/[0.04]"
                >
                  −
                </button>
                <input
                  type="range"
                  min={STAGE_MIN}
                  max={STAGE_MAX}
                  value={wk}
                  aria-label="Chọn giai đoạn"
                  onInput={(e) => change(Number((e.target as HTMLInputElement).value))}
                  class="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-hair/10 accent-accent"
                />
                <button
                  type="button"
                  aria-label="tiến"
                  onClick={() => change(wk + 1)}
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hair/10 font-mono text-lg text-ink transition-colors hover:bg-hair/[0.04]"
                >
                  +
                </button>
              </div>

              <div class="mt-2 flex items-center justify-between font-mono text-[0.65rem] text-muted/70">
                <span>thai kỳ</span>
                <span class="text-accent-ink">● sinh (tuần 40)</span>
                <span>2 tuổi</span>
              </div>

              {connected && womb && (
                <div class="mt-2 flex flex-wrap items-center gap-2 border-t border-hair/[0.06] pt-3 font-mono text-xs text-muted">
                  <label class="flex items-center gap-2">
                    ngày dự sinh:
                    <input
                      type="date"
                      value={mounted && dueDate.value ? toInputDate(dueDate.value) : ''}
                      onChange={(e) => {
                        const v = (e.target as HTMLInputElement).value;
                        if (v) setDueDateMs(Date.parse(v));
                      }}
                      class="rounded border border-hair/15 bg-surface px-2 py-1 text-ink focus:outline-none"
                    />
                  </label>
                </div>
              )}

              {registered && (
                <div class="mt-3 flex justify-end border-t border-hair/[0.06] pt-2.5">
                  <button
                    type="button"
                    onClick={() => setEditStage(false)}
                    class="font-mono text-[0.7rem] text-accent-ink transition-colors hover:text-accent"
                  >
                    ✓ xong
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div class="mt-6 flex items-center justify-between rounded-xl border border-hair/10 bg-card px-4 py-3 shadow-card">
              <span class="font-mono text-xs text-muted">
                <span class="text-accent-ink" aria-hidden="true">●</span>{' '}
                {womb ? `thai kỳ · tuần ${st.week}/40` : `sau sinh · ${st.label}`}
              </span>
              <button
                type="button"
                onClick={() => setEditStage(true)}
                class="font-mono text-xs text-muted transition-colors hover:text-accent-ink"
              >
                ✏️ chỉnh
              </button>
            </div>
          )}

          {/* status / ETA */}
          <div class="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm">
            {womb ? (
              <>
                <span class="text-ink">
                  ⏳ còn <span class="tabular-nums text-accent-ink">{st.weeksLeft}</span> tuần → v1.0.0 🚀
                </span>
                {mounted && due && (
                  <span class="text-muted">
                    dự kiến {fmtDate(due)}
                    {days != null && <> · còn {days} ngày</>}
                  </span>
                )}
              </>
            ) : (
              <span class="text-ink">
                🚀 đã sinh · <span class="text-accent-ink">{st.version}</span>
                {st.month! > 0 && <span class="text-muted"> · {st.month} tháng tuổi</span>}
              </span>
            )}
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            {variant === 'home' && womb && (
              <a
                href={`/thai-ky/tuan-${st.week}`}
                class="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 font-mono text-sm text-surface transition-opacity hover:opacity-90"
              >
                chi tiết tuần {st.week} <span aria-hidden="true">→</span>
              </a>
            )}
            {variant === 'page' && (
              <a
                href="/"
                class="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 font-mono text-sm text-surface transition-opacity hover:opacity-90"
              >
                theo dõi bé của bạn + cộng đồng <span aria-hidden="true">→</span>
              </a>
            )}
            <a
              href="/thai-ky"
              class="inline-flex items-center gap-1.5 rounded-lg border border-hair/15 px-4 py-2 font-mono text-sm text-ink transition-colors hover:bg-hair/[0.03]"
            >
              tất cả các tuần
            </a>
            <button
              type="button"
              onClick={onShare}
              disabled={shareBusy}
              class="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 px-4 py-2 font-mono text-sm text-accent-ink transition-colors hover:bg-accent/[0.07] disabled:opacity-50"
            >
              {shareBusy ? 'đang tạo…' : '📤 chia sẻ'}
            </button>
          </div>
          {shareMsg && <p class="mt-2 font-mono text-xs text-accent-ink">{shareMsg}</p>}

          <p class="mt-4 font-mono text-[0.7rem] leading-relaxed text-muted/70">
            * số liệu mang tính tham khảo, mỗi bé một khác — không thay thế tư vấn y tế.
          </p>
        </div>
      </section>

      {connected && <BabyTools womb={womb} month={st.month ?? 0} week={st.week ?? 0} version={st.version} />}

      {connected && <BabyDiary />}
      {connected && <BabyCompare />}

      <div class="mt-8 max-w-3xl">
        <DadIssues tasks={st.dad} tag={st.key} />
      </div>
    </div>
  );
}
