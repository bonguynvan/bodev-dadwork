import { babyDiary, babyWeek, setBabyWeek, removeDiaryPhoto, setDiaryCaption } from '../../lib/store';
import { getStage } from '../../lib/stages';

export default function BabyDiary() {
  const entries = Object.entries(babyDiary.value)
    .map(([k, v]) => ({ stage: Number(k), ...v }))
    .sort((a, b) => a.stage - b.stage);

  if (entries.length === 0) return null;

  const current = babyWeek.value;
  const jump = (stage: number) => {
    setBabyWeek(stage);
    document.getElementById('baby-tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section aria-label="Nhật ký ảnh của bé" class="mt-8">
      <div class="mb-3 flex items-baseline justify-between">
        <h2 class="font-mono text-sm font-medium text-ink">
          📸 nhật ký ảnh <span class="text-accent-ink">của bé</span>
        </h2>
        <span class="font-mono text-xs text-muted">
          {entries.length} mốc · hành trình lớn lên
        </span>
      </div>

      <ol class="term-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {entries.map((e) => {
          const st = getStage(e.stage);
          const active = e.stage === current;
          return (
            <li key={e.stage} class="w-[128px] shrink-0">
              <figure
                class={`overflow-hidden rounded-xl border bg-card shadow-card transition-colors ${
                  active ? 'border-accent/50' : 'border-hair/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => jump(e.stage)}
                  title={`Xem ${st.label}`}
                  class="group relative block w-full"
                >
                  <img
                    src={e.url}
                    alt={`bé ${st.label}`}
                    loading="lazy"
                    decoding="async"
                    class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span class="absolute left-1.5 top-1.5 rounded bg-scrim/55 px-1.5 py-0.5 font-mono text-[0.6rem] text-white backdrop-blur-sm">
                    {st.label}
                  </span>
                  <button
                    type="button"
                    aria-label="gỡ ảnh"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      removeDiaryPhoto(e.stage);
                    }}
                    class="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-scrim/55 font-mono text-[0.7rem] text-white opacity-0 transition-opacity hover:bg-scrim/80 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </button>
                <figcaption class="px-2 py-1.5">
                  <span class="block font-mono text-[0.6rem] text-accent-ink">{st.version}</span>
                  <input
                    defaultValue={e.caption ?? ''}
                    maxLength={80}
                    placeholder="ghi chú…"
                    aria-label={`ghi chú ${st.label}`}
                    onBlur={(ev) => setDiaryCaption(e.stage, (ev.target as HTMLInputElement).value)}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter') (ev.target as HTMLInputElement).blur();
                    }}
                    class="mt-0.5 w-full bg-transparent font-serif text-[0.82rem] leading-snug text-ink placeholder:text-muted/50 focus:outline-none"
                  />
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
