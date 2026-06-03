import { useState, useEffect } from 'preact/hooks';
import { commits, presence, totalCommits } from '../../lib/store';

const VERBS = ['vừa ship', 'vừa push', 'vừa merge'];

function truncate(s: string, n = 46): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export default function ActivityTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setI((x) => x + 1);
    }, 3600);
    return () => clearInterval(id);
  }, []);

  const list = commits.value;
  const top = list[i % Math.max(1, Math.min(list.length, 8))];
  const verb = VERBS[i % VERBS.length];

  const messages = [
    top ? `@${top.author.handle} ${verb} ${top.type}: ${truncate(top.message)}` : '',
    `● ${presence.value} người đang online`,
    `🔥 ${totalCommits.value} commit trong repo cộng đồng`,
    top ? `@${top.author.handle} vừa thả 🚀 cho một commit` : '',
  ].filter(Boolean);

  const message = messages[i % messages.length];

  return (
    <div class="flex items-center gap-2 overflow-hidden font-mono text-xs text-muted">
      <span class="shrink-0 text-accent-ink caret-blink" aria-hidden="true">
        ›
      </span>
      <span key={i} class="rise truncate" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
