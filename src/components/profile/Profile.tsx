import Avatar from '../app/Avatar';
import CommitTag from '../app/CommitTag';
import HeatGrid from './HeatGrid';
import { getStage } from '../../lib/stages';
import type { CommitType } from '../../lib/types';
import type { Ach } from '../../lib/achievements';

export interface ProfileCommit {
  type: CommitType;
  message: string;
  ago: string;
  reactions: number;
}

interface Props {
  handle: string;
  name: string;
  bio: string;
  joinedLabel: string;
  stageValue: number;
  commits: ProfileCommit[];
  streak: number;
  commitCount: number;
  closedIssues?: number;
  heat: number[];
  achievements?: Ach[];
  isMe?: boolean;
  onEdit?: () => void;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div class="rounded-lg border border-hair/[0.08] bg-card px-3 py-2 text-center">
      <div class="font-serif text-xl font-medium text-ink">{value}</div>
      <div class="font-mono text-[0.62rem] text-muted">{label}</div>
    </div>
  );
}

export default function Profile(props: Props) {
  const st = getStage(props.stageValue);

  return (
    <div class="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10">
      {/* ---- sidebar ---- */}
      <aside class="md:sticky md:top-20 md:self-start">
        <Avatar handle={props.handle} size={132} />
        <h1 class="mt-4 font-serif text-2xl font-semibold leading-tight text-ink">{props.name}</h1>
        <p class="font-mono text-sm text-muted">@{props.handle}</p>
        {props.bio && <p class="mt-3 font-serif text-[1.02rem] leading-snug text-ink">{props.bio}</p>}
        <p class="mt-3 font-mono text-xs text-muted">🗓 tham gia {props.joinedLabel}</p>

        {props.isMe ? (
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={props.onEdit}
              class="rounded-lg border border-hair/15 px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:bg-hair/[0.04]"
            >
              ✎ chỉnh sửa hồ sơ
            </button>
            <a
              href="/"
              class="rounded-lg border border-hair/15 px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-hair/[0.04]"
            >
              ← feed
            </a>
          </div>
        ) : (
          <a
            href="/"
            class="mt-4 inline-flex rounded-lg border border-hair/15 px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-hair/[0.04]"
          >
            ← cộng đồng
          </a>
        )}

        {/* build status */}
        <a
          href={st.week ? `/thai-ky/tuan-${st.week}` : `/be/thang-${st.month}`}
          class="mt-5 block rounded-xl bg-[var(--term)] p-3.5 transition-opacity hover:opacity-90"
        >
          <div class="flex items-center justify-between font-mono text-[0.7rem]">
            <span class="text-accent">{st.version}</span>
            <span class="text-white/55">{st.label}</span>
          </div>
          <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-accent" style={{ width: `${st.pct}%` }} />
          </div>
          <p class="mt-1.5 font-mono text-[0.62rem] text-white/45">
            {st.phase === 'womb' ? 'đang build v1.0.0 🚀' : 'đã release · đang nuôi 🍼'}
          </p>
        </a>
      </aside>

      {/* ---- main ---- */}
      <main class="min-w-0">
        <div class="grid grid-cols-3 gap-2.5">
          <Stat label="commits" value={props.commitCount} />
          <Stat label="streak 🔥" value={props.streak} />
          <Stat
            label={props.isMe ? 'issues closed' : 'tuần/tháng'}
            value={props.isMe ? (props.closedIssues ?? 0) : st.label.replace(/[^0-9]/g, '') || '0'}
          />
        </div>

        {props.achievements && props.achievements.length > 0 && (
          <section class="mt-6 rounded-xl border border-hair/10 bg-card p-4 shadow-card">
            <h2 class="font-mono text-xs font-medium text-ink">
              🏆 huy hiệu <span class="text-muted">· {props.achievements.length}</span>
            </h2>
            <ul class="mt-3 flex flex-wrap gap-2">
              {props.achievements.map((a) => (
                <li
                  key={a.id}
                  title={a.desc}
                  class="inline-flex items-center gap-1.5 rounded-full border border-hair/10 bg-hair/[0.02] px-2.5 py-1"
                >
                  <span class="text-base" aria-hidden="true">
                    {a.emoji}
                  </span>
                  <span class="font-mono text-xs text-ink">{a.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section class="mt-6 rounded-xl border border-hair/10 bg-card p-4 shadow-card">
          <h2 class="font-mono text-xs font-medium text-ink">đóng góp gần đây</h2>
          <div class="mt-3">
            <HeatGrid levels={props.heat} todayIndex={props.isMe ? props.heat.length - 1 : undefined} />
          </div>
        </section>

        <section class="mt-6">
          <h2 class="mb-3 font-mono text-sm font-medium text-ink">
            hoạt động <span class="text-muted">· {props.commits.length} commit gần đây</span>
          </h2>
          {props.commits.length > 0 ? (
            <ul class="overflow-hidden rounded-xl border border-hair/10 bg-card shadow-card divide-y divide-hair/[0.06]">
              {props.commits.map((c, i) => (
                <li key={i} class="flex items-start gap-3 px-4 py-3">
                  <span class="pt-0.5">
                    <CommitTag type={c.type} />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="font-serif text-[1.02rem] leading-snug text-ink">{c.message}</span>
                    <span class="ml-2 whitespace-nowrap font-mono text-[0.7rem] text-muted/70">
                      {c.ago}
                      {c.reactions > 0 && <> · ♥ {c.reactions}</>}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p class="rounded-xl border border-hair/10 bg-card px-5 py-8 text-center font-mono text-sm text-muted">
              chưa có commit nào — ship cột mốc đầu tiên đi! 🚀
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
