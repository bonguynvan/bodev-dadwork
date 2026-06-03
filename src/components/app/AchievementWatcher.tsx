import { useState, useEffect, useRef } from 'preact/hooks';
import { myAchState, hydrated, needsOnboarding, pushAchievementNotif } from '../../lib/store';
import { unlockedIds, ACH_BY_ID } from '../../lib/achievements';
import type { Ach } from '../../lib/achievements';
import { loadSeenAch, saveSeenAch } from '../../lib/persist';
import { burstConfetti } from '../../lib/confetti';

export default function AchievementWatcher() {
  const ready = hydrated.value && !needsOnboarding.value;
  const ids = ready ? unlockedIds(myAchState()) : [];
  const key = ids.join(',');
  const [toasts, setToasts] = useState<Ach[]>([]);
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (seen.current === null) {
      // first run: mark everything already unlocked as seen (no toast storm)
      seen.current = new Set([...loadSeenAch(), ...ids]);
      saveSeenAch([...seen.current]);
      return;
    }
    const fresh = ids.filter((id) => !seen.current!.has(id));
    if (!fresh.length) return;
    fresh.forEach((id) => seen.current!.add(id));
    saveSeenAch([...seen.current!]);
    const freshAch = fresh.map((id) => ACH_BY_ID[id]);
    freshAch.forEach((a) => pushAchievementNotif(a.name, a.emoji));
    setToasts((t) => [...t, ...freshAch]);
    burstConfetti();
    const n = fresh.length;
    window.setTimeout(() => setToasts((t) => t.slice(n)), 5200);
  }, [ready, key]);

  if (toasts.length === 0) return null;

  return (
    <div class="fixed bottom-4 right-4 z-50 flex max-w-[92vw] flex-col gap-2">
      {toasts.map((a, i) => (
        <div
          key={a.id + i}
          class="rise flex items-center gap-3 rounded-xl border border-accent/30 bg-card px-4 py-3 shadow-card"
        >
          <span class="text-2xl" aria-hidden="true">
            {a.emoji}
          </span>
          <div class="min-w-0">
            <p class="font-mono text-[0.68rem] text-accent-ink">🏆 mở khoá huy hiệu</p>
            <p class="font-serif text-[1.05rem] font-medium leading-tight text-ink">{a.name}</p>
            <p class="font-mono text-[0.68rem] text-muted">{a.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
