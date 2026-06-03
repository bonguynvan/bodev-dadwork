import Avatar from './Avatar';
import { babyWeek, you } from '../../lib/store';
import { getStage } from '../../lib/stages';

interface Build {
  handle: string;
  week: number;
}

// deterministic community "builds in progress"
const COMMUNITY: Build[] = [
  { handle: 'long.rs', week: 39 },
  { handle: 'tuan.js', week: 36 },
  { handle: 'mai.pm', week: 33 },
  { handle: 'minh.dev', week: 31 },
  { handle: 'quynh.qa', week: 27 },
  { handle: 'nam.be', week: 24 },
  { handle: 'thao.mobile', week: 22 },
  { handle: 'dat.fs', week: 19 },
  { handle: 'khoa.ml', week: 15 },
  { handle: 'lan.codes', week: 12 },
];

function Row({ handle, week, mine }: { handle: string; week: number; mine?: boolean }) {
  const st = getStage(week);
  const tag = st.phase === 'womb' ? `w${st.week}` : `m${st.month}`;
  return (
    <li>
      <a
        href={mine ? '/me' : `/u/${handle}`}
        class={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-hair/[0.04] ${mine ? 'bg-accent/[0.06]' : ''}`}
      >
        <Avatar handle={handle} size={22} />
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-2">
          <span class="truncate font-mono text-xs text-ink">
            @{handle}
            {mine && <span class="ml-1 text-accent-ink">(bạn)</span>}
          </span>
          <span class="shrink-0 font-mono text-[0.7rem] tabular-nums text-muted">{tag}</span>
        </div>
        <div class="mt-1 flex items-center gap-2">
          <div class="h-1 flex-1 overflow-hidden rounded-full bg-hair/[0.07]">
            <div class="h-full rounded-full bg-accent/70" style={{ width: `${st.pct}%` }} />
          </div>
          <span class="shrink-0 font-mono text-[0.62rem] text-muted/80" aria-hidden="true">
            {st.emoji}
          </span>
        </div>
      </div>
      </a>
    </li>
  );
}

export default function CommunityBuilds() {
  const myWeek = babyWeek.value;
  const myHandle = you.value?.handle ?? 'you';

  return (
    <div class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between">
        <h3 class="font-mono text-xs font-medium text-ink">builds đang chạy</h3>
        <span class="font-mono text-[0.7rem] text-muted">cộng đồng</span>
      </div>
      <ul class="mt-2 space-y-0.5">
        <Row handle={myHandle} week={myWeek} mine />
        {COMMUNITY.map((b) => (
          <Row key={b.handle} handle={b.handle} week={b.week} />
        ))}
      </ul>
    </div>
  );
}
