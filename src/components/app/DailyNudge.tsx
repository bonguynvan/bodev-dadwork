import { streak, shippedToday, you, now, hydrated } from '../../lib/store';
import { epochDay } from '../../lib/time';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function DailyNudge() {
  // avoid an SSR/hydration flash — only render once the store is live
  if (!hydrated.value) return null;

  const s = streak.value;
  const done = shippedToday.value;
  const today = epochDay(now.value);
  const shipSet = new Set(you.value?.shipDays ?? []);
  const days = Array.from({ length: 7 }, (_, i) => today - 6 + i); // oldest → today

  const focusComposer = () => {
    const el = document.getElementById('composer-input');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => el?.focus(), 350);
  };

  const tone = done ? 'done' : s > 0 ? 'risk' : 'none';
  const toneClass = {
    done: 'border-accent/30 bg-accent/[0.06]',
    risk: 'border-tagtest-ink/30 bg-tagtest-bg/60',
    none: 'border-hair/10 bg-card',
  }[tone];

  const message =
    tone === 'done' ? (
      <>
        🔥 <b class="font-semibold text-accent-ink">{s} ngày</b> · đã ship hôm nay ✓ — hẹn gặp lại mai!
      </>
    ) : tone === 'risk' ? (
      <>
        🔥 Streak <b class="font-semibold text-tagtest-ink">{s} ngày</b> đang treo — ship hôm nay kẻo mất!
      </>
    ) : (
      <>🌱 Ship cột mốc đầu tiên để bắt đầu streak của bạn</>
    );

  return (
    <div class={`mb-3 flex flex-col gap-2.5 rounded-xl border px-3.5 py-2.5 sm:flex-row sm:items-center ${toneClass}`}>
      <p class="font-mono text-xs leading-relaxed text-ink">{message}</p>

      <div class="flex items-center gap-3 sm:ml-auto">
        <div class="flex items-center gap-1.5" role="img" aria-label={`đã ship ${shipSet.size ? '' : '0 '}ngày trong 7 ngày qua`}>
          {days.map((d) => {
            const shipped = shipSet.has(d);
            const isToday = d === today;
            return (
              <span
                key={d}
                title={`${DAY_LABELS[((d % 7) + 7 + 4) % 7]}${isToday ? ' · hôm nay' : ''}${shipped ? ' · đã ship' : ''}`}
                class={`h-2.5 w-2.5 rounded-full ${shipped ? 'bg-accent' : 'bg-hair/15'} ${
                  isToday ? 'ring-2 ring-accent/50 ring-offset-1 ring-offset-surface' : ''
                }`}
              />
            );
          })}
        </div>
        {!done && (
          <button
            type="button"
            onClick={focusComposer}
            class="shrink-0 rounded-lg bg-accent px-3 py-1 font-mono text-xs font-medium text-white transition-colors hover:bg-accent-ink"
          >
            ship ngay →
          </button>
        )}
      </div>
    </div>
  );
}
