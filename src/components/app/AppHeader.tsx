import { presence, streak, you, myCommitCount } from '../../lib/store';
import Avatar from './Avatar';
import ActivityTicker from './ActivityTicker';
import ThemeToggle from './ThemeToggle';
import NotifBell from './NotifBell';

export default function AppHeader() {
  const handle = you.value?.handle ?? 'you';

  return (
    <header class="sticky top-0 z-20 border-b border-hair/[0.08] bg-surface/85 backdrop-blur-md">
      <div class="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <a href="/" class="font-mono text-base font-bold tracking-tight text-ink">
            bo<span class="text-accent-ink">dev</span>.vn
            <span class="ml-1 font-normal text-muted">/ ship.log</span>
          </a>

          <a
            href="/thai-ky"
            class="font-mono text-xs lowercase text-muted transition-colors hover:text-accent-ink"
          >
            thai kỳ
          </a>
          <a
            href="/cong-dong"
            class="font-mono text-xs lowercase text-muted transition-colors hover:text-accent-ink"
          >
            khám phá
          </a>

          <div class="ml-auto flex items-center gap-2 font-mono text-xs sm:gap-3">
            <button
              type="button"
              onClick={() => dispatchEvent(new Event('open-cmdk'))}
              aria-label="Tìm kiếm (⌘K)"
              class="inline-flex items-center gap-1.5 rounded-full border border-hair/10 px-2.5 py-1 text-muted transition-colors hover:border-hair/20 hover:text-ink"
            >
              <span aria-hidden="true">🔍</span>
              <span class="hidden sm:inline">⌘K</span>
            </button>
            <ThemeToggle />
            <NotifBell />
            <span class="hidden items-center gap-1.5 text-muted sm:inline-flex">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span class="tabular-nums">{presence.value}</span> online
            </span>

            <span class="inline-flex items-center gap-1 rounded-full bg-hair/[0.04] px-2 py-1 text-muted">
              🔥 <span class="tabular-nums text-accent-ink">{streak.value}</span>
            </span>

            <a
              href="/me"
              title="Hồ sơ của bạn"
              class="inline-flex items-center gap-1.5 rounded-full bg-hair/[0.04] py-1 pl-1 pr-2.5 transition-colors hover:bg-hair/[0.07]"
            >
              <Avatar handle={handle} size={20} />
              <span class="hidden max-w-[9rem] truncate text-ink sm:inline">@{handle}</span>
            </a>
          </div>
        </div>

        <div class="mt-2">
          <ActivityTicker />
        </div>
      </div>
    </header>
  );
}
