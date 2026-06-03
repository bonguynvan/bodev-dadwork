import { babyWeek } from '../../lib/store';
import { getStage, clampStage } from '../../lib/stages';
import { PROFILES } from '../../lib/profiles';
import Avatar from './Avatar';

export default function SameStage() {
  const mine = babyWeek.value;
  const nearest = PROFILES.map((p) => ({
    p,
    dist: Math.abs(clampStage(mine) - clampStage(p.week)),
  }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  return (
    <div class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between">
        <h3 class="font-mono text-xs font-medium text-ink">cùng giai đoạn 🎯</h3>
        <a href="/cong-dong" class="font-mono text-[0.7rem] text-muted transition-colors hover:text-accent-ink">
          tất cả →
        </a>
      </div>
      <ul class="mt-2 space-y-0.5">
        {nearest.map(({ p, dist }) => {
          const st = getStage(p.week);
          return (
            <li key={p.handle}>
              <a
                href={`/u/${p.handle}`}
                class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-hair/[0.04]"
              >
                <Avatar handle={p.handle} size={26} />
                <div class="min-w-0 flex-1">
                  <p class="truncate font-mono text-xs text-ink">@{p.handle}</p>
                  <p class="font-mono text-[0.65rem] text-muted">
                    {st.label} · {dist === 0 ? 'cùng giai đoạn' : `cách ~${dist}`}
                  </p>
                </div>
                <span class="shrink-0 font-mono text-[0.62rem] text-muted/60">→</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
