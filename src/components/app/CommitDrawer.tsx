import { useState, useEffect } from 'preact/hooks';
import {
  openCommitId,
  closeCommit,
  commits,
  commentsFor,
  addComment,
  now,
  you,
} from '../../lib/store';
import CommitTag from './CommitTag';
import Avatar from './Avatar';
import Reactions from './Reactions';
import { timeAgo } from '../../lib/time';

export default function CommitDrawer() {
  const id = openCommitId.value;
  const [text, setText] = useState('');

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCommit();
    addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [id]);

  if (!id) return null;
  const commit = commits.value.find((c) => c.id === id);
  if (!commit) return null;

  const comments = commentsFor(id);
  const myHandle = you.value?.handle;
  const profileHref = (h: string) => (h === myHandle ? '/me' : `/u/${h}`);

  const send = (e: Event) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(id, text);
    setText('');
  };

  return (
    <div class="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-scrim/55 backdrop-blur-[2px]" onClick={closeCommit} />

      <aside class="drawer-in relative z-10 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl">
        {/* header */}
        <div class="flex items-center justify-between border-b border-hair/10 px-4 py-3">
          <span class="font-mono text-xs text-muted">commit · #{commit.id.slice(0, 7)}</span>
          <button
            type="button"
            onClick={closeCommit}
            aria-label="đóng"
            class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-hair/[0.05] hover:text-ink"
          >
            ✕
          </button>
        </div>

        {/* scrollable body */}
        <div class="min-h-0 flex-1 overflow-y-auto">
          {/* commit detail */}
          <div class="border-b border-hair/[0.08] px-4 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <CommitTag type={commit.type} />
              <a href={profileHref(commit.author.handle)} class="inline-flex items-center gap-1.5 hover:text-accent-ink">
                <Avatar handle={commit.author.handle} size={20} />
                <span class="font-mono text-xs text-muted hover:text-accent-ink">@{commit.author.handle}</span>
              </a>
              <span class="ml-auto font-mono text-[0.7rem] text-muted/70">{timeAgo(commit.at, now.value)}</span>
            </div>
            <p class="mt-3 font-serif text-lg leading-snug text-ink">{commit.message}</p>
            <div class="mt-3">
              <Reactions commit={commit} />
            </div>
          </div>

          {/* comments */}
          <div class="px-4 py-3">
            <h3 class="font-mono text-xs font-medium text-ink">
              {comments.length} bình luận
            </h3>
            {comments.length === 0 ? (
              <p class="mt-4 font-mono text-xs text-muted">
                chưa có bình luận — viết lời động viên cho bố nhé 💬
              </p>
            ) : (
              <ul class="mt-3 space-y-4">
                {comments.map((c) => (
                  <li key={c.id} class="flex gap-2.5">
                    <a href={profileHref(c.author.handle)} class="shrink-0">
                      <Avatar handle={c.author.handle} size={26} />
                    </a>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-baseline gap-2">
                        <a href={profileHref(c.author.handle)} class="truncate font-mono text-xs text-ink hover:text-accent-ink">
                          @{c.author.handle}
                        </a>
                        <span class="font-mono text-[0.65rem] text-muted/70">
                          {c.ago ?? timeAgo(c.at, now.value)}
                        </span>
                        {c.mine && (
                          <span class="rounded bg-accent/10 px-1 font-mono text-[0.6rem] text-accent-ink">bạn</span>
                        )}
                      </div>
                      <p class="mt-0.5 font-serif text-[0.98rem] leading-snug text-ink">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* composer */}
        <form onSubmit={send} class="flex items-center gap-2 border-t border-hair/10 bg-card px-3 py-3">
          <input
            value={text}
            maxLength={280}
            onInput={(e) => setText((e.target as HTMLInputElement).value)}
            placeholder="viết bình luận…"
            aria-label="Bình luận"
            class="min-w-0 flex-1 rounded-lg border border-hair/10 bg-surface px-3 py-2 font-serif text-sm text-ink focus:border-accent/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            class="shrink-0 rounded-lg bg-accent px-3.5 py-2 font-mono text-sm font-medium text-white transition-all hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-35"
          >
            gửi
          </button>
        </form>
      </aside>
    </div>
  );
}
