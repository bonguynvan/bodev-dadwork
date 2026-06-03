import { useState, useEffect, useRef } from 'preact/hooks';
import {
  notifications,
  unreadNotifs,
  markAllNotifsRead,
  markNotifRead,
  openCommit,
  now,
} from '../../lib/store';
import type { Notif } from '../../lib/notifications';
import { timeAgo } from '../../lib/time';
import Avatar from './Avatar';

export default function NotifBell() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const list = notifications.value;
  const unread = unreadNotifs.value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('mousedown', onDoc);
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('mousedown', onDoc);
      removeEventListener('keydown', onKey);
    };
  }, [open]);

  const act = (n: Notif) => {
    markNotifRead(n.id);
    if (n.commitId) {
      setOpen(false);
      openCommit(n.commitId);
    } else if (n.href) {
      setOpen(false);
      location.href = n.href;
    }
  };

  return (
    <div ref={wrapRef} class="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Thông báo${unread ? ` (${unread} mới)` : ''}`}
        aria-expanded={open}
        class="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-hair/10 text-muted transition-colors hover:border-hair/20 hover:text-ink"
      >
        <span aria-hidden="true">🔔</span>
        {unread > 0 && (
          <span class="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent px-1 font-mono text-[0.6rem] font-medium text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          class="absolute right-0 z-50 mt-2 w-[min(20rem,86vw)] overflow-hidden rounded-xl border border-hair/15 shadow-2xl ring-1 ring-hair/5"
          style={{ backgroundColor: 'rgb(var(--c-card))' }}
        >
          <div class="flex items-center justify-between border-b border-hair/[0.08] px-3.5 py-2.5">
            <span class="font-mono text-xs font-medium text-ink">thông báo</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllNotifsRead}
                class="font-mono text-[0.68rem] text-accent-ink transition-colors hover:text-accent"
              >
                đánh dấu đã đọc
              </button>
            )}
          </div>

          {list.length === 0 ? (
            <p class="px-4 py-9 text-center font-mono text-xs text-muted">chưa có thông báo nào 🌙</p>
          ) : (
            <ul class="max-h-[60vh] divide-y divide-hair/[0.06] overflow-y-auto">
              {list.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => act(n)}
                    class={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-hair/[0.03] ${
                      n.read ? '' : 'bg-accent/[0.05]'
                    }`}
                  >
                    {n.actor ? (
                      <span class="relative shrink-0">
                        <Avatar handle={n.actor.handle} size={30} />
                        <span class="absolute -bottom-1 -right-1 text-[0.8rem] leading-none" aria-hidden="true">
                          {n.emoji}
                        </span>
                      </span>
                    ) : (
                      <span
                        class="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-hair/[0.05] text-base"
                        aria-hidden="true"
                      >
                        {n.emoji}
                      </span>
                    )}
                    <span class="min-w-0 flex-1">
                      <span class="block font-serif text-[0.95rem] leading-snug text-ink">{n.text}</span>
                      <span class="mt-0.5 block font-mono text-[0.62rem] text-muted">{timeAgo(n.at, now.value)}</span>
                    </span>
                    {!n.read && <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
