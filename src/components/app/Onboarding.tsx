import { useState } from 'preact/hooks';
import {
  needsOnboarding,
  finishOnboarding,
  babyWeek,
  setBabyWeek,
  you,
  setHandle,
  setBio,
  setAvatar,
  setBabyName,
  babyDiary,
  setDiaryPhoto,
  removeDiaryPhoto,
} from '../../lib/store';
import { getStage, STAGE_MIN, STAGE_MAX } from '../../lib/stages';
import { makeHandle } from '../../lib/handles';
import { compressImage } from '../../lib/image';
import { suggestNames } from '../../lib/names';
import BabyCartoon from '../tool/BabyCartoon';
import Avatar from './Avatar';

const STEPS = 4;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [handleDraft, setHandleDraft] = useState('');
  const [bioDraft, setBioDraft] = useState('');
  const [seed, setSeed] = useState(1);
  const [nameDraft, setNameDraft] = useState('');
  const [nameSeed, setNameSeed] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!needsOnboarding.value) return null;

  const wk = babyWeek.value;
  const st = getStage(wk);
  const womb = st.phase === 'womb';
  const babyPhotoUrl = babyDiary.value[wk]?.url ?? null;
  const displayHandle = handleDraft || you.value?.handle || 'anon.dev';
  const ideas = suggestNames(6, nameSeed);

  const reroll = () => {
    const n = seed * 2654435761 + 40503;
    setSeed(n & 0xffff);
    setHandleDraft(makeHandle((Date.now() ^ (n * 7)) >>> 0));
  };

  const pickInto = async (e: Event, max: number, apply: (url: string) => void) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setErr('');
    setBusy(true);
    try {
      apply(await compressImage(file, max));
    } catch (er) {
      setErr(er instanceof Error ? er.message : 'Không tải được ảnh');
    } finally {
      setBusy(false);
      input.value = '';
    }
  };
  const pickBaby = (e: Event) => pickInto(e, 640, (url) => setDiaryPhoto(wk, url));
  const pickAvatar = (e: Event) => pickInto(e, 256, (url) => setAvatar(url));

  const adoptName = (n: string) => {
    setNameDraft(n);
    setBabyName(n);
  };
  const finish = () => {
    if (handleDraft.trim()) setHandle(handleDraft);
    if (bioDraft.trim()) setBio(bioDraft);
    if (nameDraft.trim()) setBabyName(nameDraft);
    finishOnboarding();
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-scrim/50 backdrop-blur-sm" />
      <div class="rise relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-hair/10 bg-surface shadow-2xl">
        {/* progress dots */}
        <div class="flex items-center justify-between px-5 pt-4">
          <span class="font-mono text-xs text-muted">
            bo<span class="text-accent-ink">dev</span>.vn / ship.log
          </span>
          <div class="flex gap-1.5">
            {Array.from({ length: STEPS }, (_, i) => (
              <span key={i} class={`h-1.5 w-1.5 rounded-full ${i <= step ? 'bg-accent' : 'bg-hair/15'}`} />
            ))}
          </div>
        </div>

        {/* ---- step 0: welcome ---- */}
        {step === 0 && (
          <div class="px-6 py-7 text-center">
            <div class="mx-auto h-40 w-40">
              <BabyCartoon stage={wk} mood="excited" phase={st.phase} size={160} />
            </div>
            <h2 class="mt-3 font-serif text-2xl font-semibold leading-tight text-ink">Chào bố/mẹ dev! 👋</h2>
            <p class="mx-auto mt-2 max-w-xs font-serif text-[1.02rem] leading-relaxed text-muted">
              Một cuốn nhật ký kiểu <span class="font-mono text-accent-ink">git</span> cho hành trình làm bố mẹ —
              theo dõi bé lớn lên, commit từng cột mốc, cùng cả cộng đồng.
            </p>
            <div class="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                class="rounded-lg bg-accent px-4 py-2.5 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink"
              >
                Bắt đầu →
              </button>
              <button
                type="button"
                onClick={finishOnboarding}
                class="font-mono text-xs text-muted transition-colors hover:text-ink"
              >
                bỏ qua
              </button>
            </div>
          </div>
        )}

        {/* ---- step 1: baby stage + photo ---- */}
        {step === 1 && (
          <div class="px-6 py-6">
            <h2 class="font-serif text-xl font-semibold text-ink">Bé đang ở đâu rồi?</h2>
            <p class="mt-1 font-mono text-xs text-muted">kéo thanh trượt — thai kỳ → 2 tuổi</p>

            <div class="mx-auto mt-3 h-36 w-36">
              {babyPhotoUrl ? (
                <img
                  src={babyPhotoUrl}
                  alt="ảnh bé"
                  class="h-full w-full rounded-2xl border border-hair/10 object-cover shadow-card"
                />
              ) : (
                <BabyCartoon stage={wk} mood={st.mood} phase={st.phase} size={144} />
              )}
            </div>

            <div class="mt-2 text-center">
              {babyPhotoUrl ? (
                <div class="flex items-center justify-center gap-2 font-mono text-[0.68rem]">
                  <label class="cursor-pointer text-accent-ink hover:underline">
                    đổi ảnh
                    <input type="file" accept="image/*" class="hidden" onChange={pickBaby} disabled={busy} />
                  </label>
                  <span class="text-hair/20" aria-hidden="true">·</span>
                  <button type="button" onClick={() => removeDiaryPhoto(wk)} class="text-muted hover:text-tagfix-ink">
                    gỡ
                  </button>
                </div>
              ) : (
                <label class="inline-flex cursor-pointer items-center gap-1 rounded-full border border-hair/15 px-3 py-1 font-mono text-[0.68rem] text-muted transition-colors hover:border-accent/40 hover:text-accent-ink">
                  {busy ? 'đang xử lý…' : womb ? '📷 ảnh siêu âm (tuỳ chọn)' : '📷 ảnh bé (tuỳ chọn)'}
                  <input type="file" accept="image/*" class="hidden" onChange={pickBaby} disabled={busy} />
                </label>
              )}
            </div>

            <div class="mt-2 text-center">
              <p class="font-mono text-sm">
                <span class="rounded bg-accent/10 px-1.5 py-0.5 text-accent-ink">{st.version}</span>{' '}
                <span class="text-ink">{st.label}</span>
              </p>
              <p class="mt-1 font-serif text-[1.02rem] text-ink">
                ≈ {st.compare} {st.emoji}
              </p>
            </div>

            <input
              type="range"
              min={STAGE_MIN}
              max={STAGE_MAX}
              value={wk}
              aria-label="Chọn giai đoạn"
              onInput={(e) => setBabyWeek(Number((e.target as HTMLInputElement).value))}
              class="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-hair/10 accent-accent"
            />
            <div class="mt-1 flex justify-between font-mono text-[0.62rem] text-muted/70">
              <span>tuần 4</span>
              <span class="text-accent-ink">● sinh</span>
              <span>2 tuổi</span>
            </div>
            {err && <p class="mt-2 text-center font-mono text-[0.62rem] text-tagfix-ink">{err}</p>}

            <div class="mt-6 flex items-center justify-between">
              <button type="button" onClick={() => setStep(0)} class="font-mono text-xs text-muted hover:text-ink">
                ← quay lại
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                class="rounded-lg bg-accent px-4 py-2 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}

        {/* ---- step 2: name the baby ---- */}
        {step === 2 && (
          <div class="px-6 py-6">
            <h2 class="font-serif text-xl font-semibold text-ink">Đặt tên ở nhà cho bé 🍼</h2>
            <p class="mt-1 font-mono text-xs text-muted">tên thân mật / codename cho bản build v1.0.0</p>

            <p class="mt-3 text-center font-serif text-lg font-semibold text-ink">
              {nameDraft.trim() ? `Bé ${nameDraft.trim()}` : <span class="text-muted/60">Bé …</span>}
            </p>

            <input
              value={nameDraft}
              maxLength={24}
              placeholder="vd: Bún, Bắp, Pixel…"
              aria-label="Tên ở nhà của bé"
              onInput={(e) => setNameDraft((e.target as HTMLInputElement).value)}
              class="mt-2 w-full rounded-lg border border-hair/15 bg-card px-3 py-2 text-center font-serif text-base text-ink focus:border-accent/40 focus:outline-none"
            />

            <div class="mt-3 flex items-center justify-between">
              <span class="font-mono text-[0.66rem] text-muted/70">💡 cộng đồng gợi ý</span>
              <button
                type="button"
                onClick={() => setNameSeed((s) => s + 1)}
                class="font-mono text-[0.66rem] text-accent-ink transition-colors hover:text-accent"
              >
                🎲 đổi gợi ý
              </button>
            </div>
            <div class="mt-1.5 flex flex-wrap justify-center gap-1.5">
              {ideas.map((i) => (
                <button
                  key={i.name}
                  type="button"
                  data-name={i.name}
                  onClick={() => adoptName(i.name)}
                  class={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors ${
                    nameDraft.trim() === i.name
                      ? 'border-accent/50 bg-accent/10 text-accent-ink'
                      : 'border-hair/[0.12] text-ink hover:border-accent/40 hover:bg-accent/[0.06]'
                  }`}
                >
                  {i.emoji} {i.name}
                </button>
              ))}
            </div>

            <div class="mt-6 flex items-center justify-between">
              <button type="button" onClick={() => setStep(1)} class="font-mono text-xs text-muted hover:text-ink">
                ← quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  if (nameDraft.trim()) setBabyName(nameDraft);
                  setStep(3);
                }}
                class="rounded-lg bg-accent px-4 py-2 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}

        {/* ---- step 3: identity ---- */}
        {step === 3 && (
          <div class="px-6 py-6">
            <h2 class="font-serif text-xl font-semibold text-ink">Bạn muốn được gọi là?</h2>
            <p class="mt-1 font-mono text-xs text-muted">commit cuộc đời cần một cái tên 😉</p>

            <div class="mt-4 flex items-center gap-3">
              <Avatar handle={displayHandle} size={56} src={you.value?.avatar} />
              <div class="flex flex-wrap gap-2">
                <label class="cursor-pointer rounded-lg border border-hair/15 px-2.5 py-1.5 font-mono text-xs text-ink transition-colors hover:bg-hair/[0.04]">
                  {busy ? 'đang xử lý…' : '📷 tải ảnh'}
                  <input type="file" accept="image/*" class="hidden" onChange={pickAvatar} disabled={busy} />
                </label>
                {you.value?.avatar ? (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    class="rounded-lg border border-hair/15 px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-hair/[0.04]"
                  >
                    gỡ ảnh
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={reroll}
                    class="rounded-lg border border-hair/15 px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-hair/[0.04]"
                  >
                    🎲 đổi avatar
                  </button>
                )}
              </div>
            </div>
            <p class="mt-1 font-mono text-[0.62rem] text-muted/70">🔒 ảnh chỉ lưu trên máy bạn</p>
            {err && <p class="mt-0.5 font-mono text-[0.62rem] text-tagfix-ink">{err}</p>}

            <label class="mt-4 block font-mono text-xs text-muted">
              handle
              <div class="mt-1 flex items-center gap-1.5 rounded-lg border border-hair/15 bg-card px-2.5 py-1.5">
                <span class="font-mono text-sm text-muted">@</span>
                <input
                  value={displayHandle}
                  maxLength={24}
                  onInput={(e) => setHandleDraft((e.target as HTMLInputElement).value)}
                  class="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink focus:outline-none"
                />
              </div>
            </label>

            <label class="mt-3 block font-mono text-xs text-muted">
              bio <span class="text-muted/60">(tuỳ chọn)</span>
              <textarea
                value={bioDraft}
                maxLength={160}
                rows={2}
                onInput={(e) => setBioDraft((e.target as HTMLTextAreaElement).value)}
                placeholder="vd: Backend dev, lần đầu làm bố…"
                class="mt-1 w-full rounded-lg border border-hair/15 bg-card px-2.5 py-2 font-serif text-sm text-ink focus:outline-none"
              />
            </label>

            <div class="mt-6 flex items-center justify-between">
              <button type="button" onClick={() => setStep(2)} class="font-mono text-xs text-muted hover:text-ink">
                ← quay lại
              </button>
              <button
                type="button"
                onClick={finish}
                class="rounded-lg bg-accent px-4 py-2 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink"
              >
                Vào ship.log 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
