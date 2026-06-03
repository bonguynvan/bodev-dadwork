import { useState } from 'preact/hooks';
import { you, setBabyName } from '../../lib/store';
import { suggestNames } from '../../lib/names';

export default function BabyNamer() {
  const name = you.value?.babyName ?? '';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [seed, setSeed] = useState(1);

  const ideas = suggestNames(5, seed);
  const start = () => {
    setDraft(name);
    setOpen(true);
  };
  const save = () => {
    setBabyName(draft);
    setOpen(false);
  };
  const adopt = (n: string) => {
    setBabyName(n);
    setOpen(false);
  };

  return (
    <div class="mt-1.5 text-center">
      {name ? (
        <button
          type="button"
          onClick={start}
          title="đổi tên bé"
          class="group inline-flex items-center gap-1.5 font-serif text-lg font-semibold leading-none text-ink"
        >
          Bé {name}
          <span class="font-mono text-[0.7rem] text-muted opacity-0 transition-opacity group-hover:opacity-100">✏️</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          class="inline-flex items-center gap-1 rounded-full border border-hair/15 px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent-ink"
        >
          ✏️ đặt tên ở nhà cho bé
        </button>
      )}

      {open && (
        <div class="mx-auto mt-2 max-w-xs rounded-xl border border-hair/10 bg-card p-3 text-left shadow-card">
          <p class="font-mono text-[0.7rem] text-muted">đặt tên ở nhà / codename cho bé 🍼</p>
          <div class="mt-1.5 flex gap-1.5">
            <input
              value={draft}
              maxLength={24}
              autoFocus
              placeholder="vd: Bún, Bắp, Pixel…"
              aria-label="Tên ở nhà của bé"
              onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draft.trim()) save();
                if (e.key === 'Escape') setOpen(false);
              }}
              class="min-w-0 flex-1 rounded-lg border border-hair/15 bg-surface px-2.5 py-1.5 font-serif text-sm text-ink focus:border-accent/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              class="shrink-0 rounded-lg bg-accent px-3 py-1.5 font-mono text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              lưu
            </button>
          </div>

          <div class="mt-2.5 flex items-center justify-between">
            <span class="font-mono text-[0.66rem] text-muted/70">💡 cộng đồng gợi ý</span>
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              class="font-mono text-[0.66rem] text-accent-ink transition-colors hover:text-accent"
            >
              🎲 đổi gợi ý
            </button>
          </div>
          <div class="mt-1.5 flex flex-wrap gap-1.5">
            {ideas.map((i) => (
              <button
                key={i.name}
                type="button"
                data-name={i.name}
                aria-label={`chọn tên ${i.name}`}
                onClick={() => adopt(i.name)}
                class="rounded-full border border-hair/[0.12] px-2 py-1 font-mono text-xs text-ink transition-colors hover:border-accent/40 hover:bg-accent/[0.06]"
              >
                {i.emoji} {i.name}
              </button>
            ))}
          </div>

          <div class="mt-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setOpen(false)}
              class="font-mono text-[0.66rem] text-muted transition-colors hover:text-ink"
            >
              đóng
            </button>
            {name && (
              <button
                type="button"
                onClick={() => {
                  setBabyName('');
                  setOpen(false);
                }}
                class="font-mono text-[0.66rem] text-muted transition-colors hover:text-tagfix-ink"
              >
                gỡ tên
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
