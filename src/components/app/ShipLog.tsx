import { useEffect } from 'preact/hooks';
import {
  hydrate,
  now,
  commits,
  spawnIncoming,
  bumpRandomReaction,
  nudgePresence,
  toggleReaction,
  setBabyWeek,
  notifyAboutYou,
} from '../../lib/store';
import { burstConfetti } from '../../lib/confetti';
import ParticleField from './ParticleField';
import AppHeader from './AppHeader';
import Composer from './Composer';
import DailyNudge from './DailyNudge';
import Feed from './Feed';
import RepoCard from './RepoCard';
import WeeklyRecap from './WeeklyRecap';
import Heatmap from './Heatmap';
import CommunityBuilds from './CommunityBuilds';
import SameStage from './SameStage';
import CommitDrawer from './CommitDrawer';
import Onboarding from './Onboarding';
import AchievementWatcher from './AchievementWatcher';
import BabyTool from '../tool/BabyTool';

export default function ShipLog() {
  useEffect(() => {
    hydrate();

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: number[] = [];
    const every = (ms: number, fn: () => void) => {
      timers.push(window.setInterval(() => !document.hidden && fn(), ms));
    };

    every(20_000, () => (now.value = Date.now()));
    every(18_000, () => notifyAboutYou());
    if (!reduced) {
      every(12_000, () => Math.random() < 0.82 && spawnIncoming());
      every(5_200, () => bumpRandomReaction());
      every(6_500, () => nudgePresence());
    }

    // ---- command-palette action bridge ----
    const runAction = (a: { action: string; week?: number }) => {
      if (a.action === 'ship') {
        const el = document.getElementById('composer-input') as HTMLInputElement | null;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => el?.focus(), 360);
      } else if (a.action === 'react') {
        const top = commits.value[0];
        if (top) {
          toggleReaction(top.id, 'love');
          const feed = document.getElementById('feed');
          feed?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const r = feed?.getBoundingClientRect();
          burstConfetti(r ? { x: r.left + r.width / 2, y: r.top + 80 } : undefined);
        }
      } else if (a.action === 'setweek' && typeof a.week === 'number') {
        setBabyWeek(a.week);
        document.getElementById('baby-tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    const onAction = (e: Event) => runAction((e as CustomEvent).detail);
    addEventListener('cmdk-action', onAction);
    // consume an intent carried over from another page
    try {
      const raw = sessionStorage.getItem('cmdk-intent');
      if (raw) {
        sessionStorage.removeItem('cmdk-intent');
        window.setTimeout(() => runAction(JSON.parse(raw)), 480);
      }
    } catch {
      /* ignore */
    }

    return () => {
      timers.forEach(clearInterval);
      removeEventListener('cmdk-action', onAction);
    };
  }, []);

  return (
    <div class="relative min-h-screen">
      <ParticleField />
      <AppHeader />

      <main class="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {/* ---- HERO: pregnancy 3D tracker ---- */}
        <section id="baby-tool" class="scroll-mt-20 border-b border-hair/[0.08] py-8 sm:py-12">
          <BabyTool variant="home" />
        </section>

        {/* ---- community feed ---- */}
        <section id="feed" class="scroll-mt-20 pt-9">
          <div class="mb-5 flex items-baseline justify-between">
            <h2 class="font-mono text-sm font-medium text-ink">
              cộng đồng <span class="text-accent-ink">ship.log</span>
            </h2>
            <span class="font-mono text-xs text-muted">commit cuộc đời</span>
          </div>

          <DailyNudge />
          <Composer />

          <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
            <Feed />
            <aside class="space-y-5 lg:sticky lg:top-[5.75rem] lg:self-start">
              <RepoCard />
              <WeeklyRecap />
              <SameStage />
              <CommunityBuilds />
              <Heatmap />
              <p class="px-1 font-mono text-[0.7rem] leading-relaxed text-muted/80">
                commit của bạn được lưu riêng tư ngay trên máy bạn. ship mỗi ngày để giữ streak và
                cùng cộng đồng bố mẹ dev lớn lên 🌱
              </p>
            </aside>
          </div>
        </section>
      </main>

      <footer class="border-t border-hair/[0.08]">
        <div class="mx-auto flex max-w-5xl flex-col gap-1.5 px-4 py-7 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>bodev.vn/ship.log — built with ☕ &amp; sleep deprivation</p>
          <p>© 2025 · local-first · no login</p>
        </div>
      </footer>

      <CommitDrawer />
      <Onboarding />
      <AchievementWatcher />
    </div>
  );
}
