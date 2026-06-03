import { useState, useEffect } from 'preact/hooks';
import { babyWeek, hydrate } from '../../lib/store';
import { getStage, clampStage } from '../../lib/stages';
import { PROFILES } from '../../lib/profiles';
import Avatar from '../app/Avatar';

const NEAR = 5;

function proximity(mine: number, theirs: number): { dist: number; label: string; same: boolean } {
  const dist = Math.abs(clampStage(mine) - clampStage(theirs));
  if (dist === 0) return { dist, label: 'cùng giai đoạn 🎯', same: true };
  const bothWomb = mine <= 40 && theirs <= 40;
  const bothBorn = mine > 40 && theirs > 40;
  const unit = bothWomb ? 'tuần' : bothBorn ? 'tháng' : '';
  return { dist, label: unit ? `cách ~${dist} ${unit}` : 'khác giai đoạn', same: false };
}

export default function Discover() {
  const [filter, setFilter] = useState<'near' | 'all'>('near');
  useEffect(() => hydrate(), []);
  const mine = babyWeek.value;
  const myStage = getStage(mine);

  const ranked = PROFILES.map((p) => ({ p, ...proximity(mine, p.week) })).sort(
    (a, b) => a.dist - b.dist,
  );
  const near = ranked.filter((r) => r.dist <= NEAR);
  const list =
    filter === 'near'
      ? near.length
        ? near
        : ranked.slice(0, 4)
      : [...ranked].sort((a, b) => a.p.week - b.p.week);

  return (
    <div>
      <header class="max-w-2xl">
        <p class="font-mono text-xs text-muted">
          <span class="text-accent-ink">//</span> khám phá cộng đồng
        </p>
        <h1 class="mt-2 font-serif text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          Ai đang ở cùng giai đoạn với bạn?
        </h1>
        <p class="mt-3 font-serif text-lg leading-relaxed text-muted">
          Bạn đang ở <span class="text-ink">{myStage.label}</span> ({myStage.version}).{' '}
          <span class="text-accent-ink">{near.length}</span> bố/mẹ khác đang ở gần giai đoạn này — đi
          chung một chặng cho đỡ cô đơn.
        </p>
      </header>

      <div class="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('near')}
          class={`rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
            filter === 'near' ? 'bg-ink text-surface' : 'text-muted hover:bg-hair/[0.04] hover:text-ink'
          }`}
        >
          cùng giai đoạn · {near.length}
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          class={`rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
            filter === 'all' ? 'bg-ink text-surface' : 'text-muted hover:bg-hair/[0.04] hover:text-ink'
          }`}
        >
          tất cả · {PROFILES.length}
        </button>
      </div>

      <ul class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(({ p, label, same, dist }) => {
          const st = getStage(p.week);
          const isNear = dist <= NEAR;
          return (
            <li key={p.handle}>
              <a
                href={`/u/${p.handle}`}
                class={`group flex h-full flex-col rounded-xl border bg-card p-4 shadow-card transition-colors ${
                  isNear ? 'border-accent/40' : 'border-hair/10 hover:border-accent/30'
                }`}
              >
                <div class="flex items-center gap-2.5">
                  <Avatar handle={p.handle} size={38} />
                  <div class="min-w-0">
                    <p class="truncate font-serif text-[1.05rem] font-medium leading-tight text-ink">
                      {p.name}
                    </p>
                    <p class="truncate font-mono text-xs text-muted">@{p.handle}</p>
                  </div>
                </div>

                <div class="mt-3 flex items-center justify-between font-mono text-[0.7rem]">
                  <span class="text-muted">
                    <span class="text-accent-ink">{st.version}</span> · {st.label}
                  </span>
                  <span class={same ? 'text-accent-ink' : 'text-muted/70'}>{label}</span>
                </div>
                <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-hair/[0.06]">
                  <div class="h-full rounded-full bg-accent/70" style={{ width: `${st.pct}%` }} />
                </div>

                <p class="mt-3 line-clamp-2 font-serif text-sm leading-snug text-muted">{p.bio}</p>
                <span class="mt-3 font-mono text-[0.7rem] text-muted/60 transition-colors group-hover:text-accent-ink">
                  xem hồ sơ →
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
