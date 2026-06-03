import { useState, useEffect } from 'preact/hooks';
import Profile from './Profile';
import Avatar from '../app/Avatar';
import {
  hydrate,
  you,
  commits,
  streak,
  myCommitCount,
  babyWeek,
  now,
  setHandle,
  setBio,
  setAvatar,
  myAchState,
} from '../../lib/store';
import { epochDay, timeAgo } from '../../lib/time';
import { compressImage } from '../../lib/image';
import { HEAT_DAYS, joinedLabelFromDays } from '../../lib/profiles';
import { unlockedAch } from '../../lib/achievements';
import { loadDadDone } from '../../lib/persist';

function reactSum(r: { ship: number; love: number; lgtm: number }): number {
  return r.ship + r.love + r.lgtm;
}

export default function MyProfile() {
  const [mounted, setMounted] = useState(false);
  const [closed, setClosed] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draftHandle, setDraftHandle] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState('');

  useEffect(() => {
    hydrate();
    setClosed(loadDadDone().length);
    setMounted(true);
  }, []);

  const handle = you.value?.handle ?? 'anon.dev';
  const name = you.value?.name ?? 'Bạn';
  const bio = you.value?.bio ?? '';
  const nowMs = now.value;

  // contribution heatmap from real activity
  const today = epochDay(nowMs);
  const start = today - (HEAT_DAYS - 1);
  const counts = new Map<number, number>();
  for (const c of commits.value) {
    if (!c.mine) continue;
    counts.set(epochDay(c.at), (counts.get(epochDay(c.at)) ?? 0) + 1);
  }
  const shipped = new Set(you.value?.shipDays ?? []);
  const heat = Array.from({ length: HEAT_DAYS }, (_, i) => {
    const day = start + i;
    const ct = counts.get(day) ?? (shipped.has(day) ? 1 : 0);
    return ct >= 3 ? 3 : ct;
  });

  const myCommits = commits.value
    .filter((c) => c.mine)
    .slice(0, 8)
    .map((c) => ({
      type: c.type,
      message: c.message,
      ago: timeAgo(c.at, nowMs),
      reactions: reactSum(c.reactions),
    }));

  const joinedAt = you.value?.joinedAt;
  let joinedLabel = '—';
  if (mounted && joinedAt) {
    const days = Math.floor((Date.now() - joinedAt) / 86_400_000);
    joinedLabel = days < 1 ? 'hôm nay' : joinedLabelFromDays(days);
  }

  const openEdit = () => {
    setDraftHandle(handle);
    setDraftBio(bio);
    setEditing(true);
  };
  const save = (e: Event) => {
    e.preventDefault();
    if (draftHandle.trim()) setHandle(draftHandle);
    setBio(draftBio);
    setEditing(false);
  };
  const pickAvatar = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setAvatarErr('');
    setAvatarBusy(true);
    try {
      const url = await compressImage(file, 256);
      setAvatar(url);
    } catch (err) {
      setAvatarErr(err instanceof Error ? err.message : 'Không tải được ảnh');
    } finally {
      setAvatarBusy(false);
      input.value = '';
    }
  };

  return (
    <>
      {editing && (
        <form onSubmit={save} class="mb-6 rounded-xl border border-hair/10 bg-card p-4 shadow-card">
          <h2 class="font-mono text-sm font-medium text-ink">chỉnh sửa hồ sơ</h2>

          <div class="mt-3 flex items-center gap-3">
            <Avatar handle={handle} size={56} />
            <div class="min-w-0">
              <div class="flex flex-wrap gap-2">
                <label class="cursor-pointer rounded-lg border border-hair/15 px-2.5 py-1.5 font-mono text-xs text-ink transition-colors hover:bg-hair/[0.04]">
                  {avatarBusy ? 'đang xử lý…' : you.value?.avatar ? '📷 đổi ảnh' : '📷 tải ảnh lên'}
                  <input type="file" accept="image/*" class="hidden" onChange={pickAvatar} disabled={avatarBusy} />
                </label>
                {you.value?.avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    class="rounded-lg border border-hair/15 px-2.5 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-hair/[0.04]"
                  >
                    gỡ ảnh
                  </button>
                )}
              </div>
              <p class="mt-1 font-mono text-[0.62rem] text-muted/70">🔒 ảnh chỉ lưu trên máy bạn, không tải lên đâu cả</p>
              {avatarErr && <p class="mt-0.5 font-mono text-[0.62rem] text-tagfix-ink">{avatarErr}</p>}
            </div>
          </div>

          <label class="mt-3 block font-mono text-xs text-muted">
            handle
            <div class="mt-1 flex items-center gap-1.5">
              <span class="font-mono text-sm text-muted">@</span>
              <input
                value={draftHandle}
                maxLength={24}
                onInput={(e) => setDraftHandle((e.target as HTMLInputElement).value)}
                class="w-full max-w-xs rounded border border-hair/15 bg-surface px-2 py-1 font-mono text-sm text-ink focus:outline-none"
              />
            </div>
          </label>
          <label class="mt-3 block font-mono text-xs text-muted">
            bio
            <textarea
              value={draftBio}
              maxLength={160}
              rows={2}
              onInput={(e) => setDraftBio((e.target as HTMLTextAreaElement).value)}
              placeholder="vd: Backend dev, lần đầu làm bố…"
              class="mt-1 w-full rounded border border-hair/15 bg-surface px-2 py-1.5 font-serif text-sm text-ink focus:outline-none"
            />
          </label>
          <div class="mt-3 flex gap-2">
            <button type="submit" class="rounded-lg bg-accent px-3.5 py-1.5 font-mono text-sm text-white transition-colors hover:bg-accent-ink">
              lưu
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              class="rounded-lg border border-hair/15 px-3.5 py-1.5 font-mono text-sm text-muted transition-colors hover:bg-hair/[0.04]"
            >
              huỷ
            </button>
          </div>
        </form>
      )}

      <Profile
        handle={handle}
        name={name}
        bio={bio || 'Chưa có bio — bấm “chỉnh sửa hồ sơ” để giới thiệu bản thân.'}
        joinedLabel={joinedLabel}
        stageValue={babyWeek.value}
        commits={myCommits}
        streak={streak.value}
        commitCount={myCommitCount.value}
        closedIssues={closed}
        heat={heat}
        achievements={unlockedAch(myAchState())}
        isMe
        onEdit={openEdit}
      />
    </>
  );
}
