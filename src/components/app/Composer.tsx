import { useState, useEffect, useRef } from 'preact/hooks';
import { COMMIT_TYPES, type CommitType } from '../../lib/types';
import { TAG_COLOR } from '../../lib/tags';
import { ship, you } from '../../lib/store';
import { burstConfetti } from '../../lib/confetti';

const MAX = 140;
const HINT = 'ship một cột mốc hôm nay…';
const SAMPLES = [
  'con biết lẫy rồi 🎉',
  'fix bug lúc con ngủ trưa',
  'ship v1.0 thành công 🚀',
  'đêm nay con ngủ xuyên đêm',
  'con gọi "ba" lần đầu',
];

export default function Composer() {
  const [type, setType] = useState<CommitType>('feat');
  const [msg, setMsg] = useState('');
  const [focused, setFocused] = useState(false);
  const [ph, setPh] = useState(HINT);
  const [flash, setFlash] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // typewriter placeholder while idle
  useEffect(() => {
    const reduced =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (focused || msg || reduced) {
      setPh(HINT);
      return;
    }
    let alive = true;
    let si = 0,
      ci = 0,
      dir = 1;
    let to = 0;
    const step = () => {
      if (!alive) return;
      const s = SAMPLES[si];
      ci += dir;
      setPh(s.slice(0, ci) + '▋');
      let delay = 65;
      if (dir === 1 && ci >= s.length) {
        dir = -1;
        delay = 1500;
      } else if (dir === -1 && ci <= 0) {
        dir = 1;
        si = (si + 1) % SAMPLES.length;
        delay = 320;
      }
      to = window.setTimeout(step, delay);
    };
    to = window.setTimeout(step, 600);
    return () => {
      alive = false;
      clearTimeout(to);
    };
  }, [focused, msg]);

  const submit = (e: Event) => {
    e.preventDefault();
    const created = ship(type, msg);
    if (!created) return;
    setMsg('');
    const r = btnRef.current?.getBoundingClientRect();
    burstConfetti(r ? { x: r.left + r.width / 2, y: r.top } : undefined);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1100);
  };

  const handle = you.value?.handle ?? 'you';
  const remaining = MAX - msg.length;

  return (
    <form
      onSubmit={submit}
      class="term-scroll overflow-hidden rounded-xl border border-white/10 bg-[var(--term)] p-3.5 shadow-card sm:p-4"
    >
      <div class="flex items-center gap-2 font-mono text-xs text-white/45">
        <span class="truncate">
          <span class="text-accent">{handle}</span>
          <span class="text-white/30">@bodev</span> ~/your-life
        </span>
        <span class="ml-auto inline-flex gap-1.5" aria-hidden="true">
          <span class="h-2 w-2 rounded-full bg-white/15" />
          <span class="h-2 w-2 rounded-full bg-white/15" />
          <span class="h-2 w-2 rounded-full bg-white/15" />
        </span>
      </div>

      <label class="mt-2.5 flex items-baseline gap-2 font-mono text-sm">
        <span class="shrink-0 text-accent">$</span>
        <span class="shrink-0 text-white/55">git commit -m</span>
        <span class="text-white/30">"</span>
        <input
          id="composer-input"
          value={msg}
          maxLength={MAX}
          onInput={(e) => setMsg((e.target as HTMLInputElement).value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={ph}
          aria-label="Nội dung commit"
          class="min-w-0 flex-1 bg-transparent text-white caret-accent placeholder:text-white/30 focus:outline-none"
        />
        <span class="text-white/30">"</span>
      </label>

      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.07] pt-3">
        <div class="term-scroll -mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
          {COMMIT_TYPES.map((t) => {
            const on = t === type;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={on}
                class={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors ${
                  on ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span class="h-2 w-2 rounded-full" style={{ backgroundColor: TAG_COLOR[t] }} />
                {t}
              </button>
            );
          })}
        </div>

        <div class="ml-auto flex items-center gap-3">
          <span
            class={`font-mono text-xs tabular-nums ${remaining <= 20 ? 'text-[#E0A800]' : 'text-white/35'}`}
          >
            {remaining}
          </span>
          <button
            ref={btnRef}
            type="submit"
            disabled={!msg.trim()}
            class="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 font-mono text-sm font-medium text-white transition-all hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-35"
          >
            {flash ? '✓ shipped' : 'ship'}
            <span aria-hidden="true" class="text-white/70">⏎</span>
          </button>
        </div>
      </div>
    </form>
  );
}
