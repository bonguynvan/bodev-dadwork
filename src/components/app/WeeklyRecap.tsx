import { useState } from 'preact/hooks';
import { commits, you, streak, babyDiary, babyWeek, now, hydrated } from '../../lib/store';
import { getStage } from '../../lib/stages';
import { epochDay } from '../../lib/time';
import { renderRecapCard, shareImage } from '../../lib/shareCard';

const WEEK_MS = 7 * 86_400_000;

export default function WeeklyRecap() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (!hydrated.value) return null;

  const nowMs = now.value;
  const weekAgo = nowMs - WEEK_MS;
  const today = epochDay(nowMs);

  const mineThisWeek = commits.value.filter((c) => c.mine && c.at >= weekAgo);
  const commitCount = mineThisWeek.length;
  const reactions = mineThisWeek.reduce(
    (s, c) => s + c.reactions.ship + c.reactions.love + c.reactions.lgtm,
    0,
  );
  const photos = Object.values(babyDiary.value).filter((e) => e.at >= weekAgo).length;
  const activeDays = (you.value?.shipDays ?? []).filter((d) => d > today - 7 && d <= today).length;

  const st = getStage(babyWeek.value);
  const namePart = you.value?.babyName ? `Bé ${you.value.babyName} · ` : '';
  const babyLine = `${namePart}${st.label} · ${st.version}`;

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    setMsg('');
    try {
      const blob = await renderRecapCard({
        commits: commitCount,
        activeDays,
        reactions,
        photos,
        babyLine,
        streak: streak.value,
      });
      const res = await shareImage(blob, 'bodev-tuan-nay.png', 'Tuần này của mình trên ship.log 🚀 bodev.vn');
      setMsg(res === 'shared' ? 'đã chia sẻ ✓' : 'đã lưu ảnh 📥');
    } catch {
      setMsg('không tạo được ảnh');
    } finally {
      setBusy(false);
      window.setTimeout(() => setMsg(''), 4000);
    }
  };

  const Stat = ({ n, label }: { n: string | number; label: string }) => (
    <div class="rounded-lg bg-accent/[0.06] px-2.5 py-2">
      <p class="font-serif text-2xl font-semibold leading-none text-accent-ink tabular-nums">{n}</p>
      <p class="mt-1 font-mono text-[0.62rem] leading-tight text-muted">{label}</p>
    </div>
  );

  return (
    <div class="rounded-xl border border-hair/10 bg-card p-4 shadow-card">
      <div class="flex items-baseline justify-between">
        <h3 class="font-mono text-xs font-medium text-ink">📅 tuần này</h3>
        <span class="font-mono text-[0.62rem] text-muted/70">7 ngày qua</span>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <Stat n={commitCount} label="commit" />
        <Stat n={`${activeDays}/7`} label="ngày active 🔥" />
        <Stat n={reactions} label="reaction ❤️" />
        <Stat n={photos} label="ảnh mới 📸" />
      </div>

      <p class="mt-3 truncate font-mono text-[0.7rem] text-muted">🍼 {babyLine}</p>

      <button
        type="button"
        onClick={onShare}
        disabled={busy}
        class="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent/40 px-3 py-1.5 font-mono text-xs text-accent-ink transition-colors hover:bg-accent/[0.07] disabled:opacity-50"
      >
        {busy ? 'đang tạo…' : '📤 chia sẻ tuần'}
      </button>
      {msg && <p class="mt-1.5 text-center font-mono text-[0.66rem] text-accent-ink">{msg}</p>}
    </div>
  );
}
