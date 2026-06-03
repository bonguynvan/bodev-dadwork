import type { ComponentChildren } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { WEEKS } from '../../lib/pregnancy';
import { MONTHS } from '../../lib/postpartum';
import { PROFILES } from '../../lib/profiles';

type ActionId = 'ship' | 'react' | 'setweek' | 'theme';

interface Item {
  id: string;
  label: string;
  sub: string;
  kind: string;
  search: string;
  href?: string;
  action?: ActionId;
  icon?: string;
}

const deburr = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();

const WEEK_MIN = 4;
const WEEK_MAX = 40;
const RECENT_KEY = 'bodev:cmdk-recent';
const RECENT_MAX = 4;

const ACTIONS: Item[] = [
  {
    id: 'act-ship',
    label: 'Ship một commit',
    sub: 'ghi cột mốc hôm nay',
    kind: 'hành động',
    icon: '🚀',
    action: 'ship',
    search: deburr('ship commit dang bai cot moc moi viet post'),
  },
  {
    id: 'act-week',
    label: 'Đặt tuần thai của bạn',
    sub: `cập nhật tracker ${WEEK_MIN}–${WEEK_MAX}`,
    kind: 'hành động',
    icon: '📅',
    action: 'setweek',
    search: deburr('dat tuan thai set week cap nhat tracker thai ky giai doan'),
  },
  {
    id: 'act-react',
    label: 'Thả tim commit mới nhất',
    sub: 'cổ vũ cộng đồng',
    kind: 'hành động',
    icon: '❤️',
    action: 'react',
    search: deburr('tha tim react like co vu vote love kudos'),
  },
  {
    id: 'act-theme',
    label: 'Đổi giao diện sáng / tối',
    sub: 'dark mode',
    kind: 'hành động',
    icon: '🌗',
    action: 'theme',
    search: deburr('doi giao dien sang toi dark mode light theme nen'),
  },
];

const NAV: Item[] = [
  { id: 'nav-feed', label: 'Cộng đồng ship.log', sub: 'feed', href: '/', kind: 'đi tới', search: 'feed cong dong trang chu home' },
  { id: 'nav-thai', label: 'Thai kỳ theo tuần', sub: 'tracker', href: '/thai-ky', kind: 'đi tới', search: 'thai ky tracker tuan' },
  { id: 'nav-disc', label: 'Khám phá cộng đồng', sub: 'cùng giai đoạn', href: '/cong-dong', kind: 'đi tới', search: 'kham pha discover cung giai doan' },
  { id: 'nav-me', label: 'Hồ sơ của bạn', sub: '@you', href: '/me', kind: 'đi tới', search: 'ho so profile me toi' },
];

const ITEMS: Item[] = [
  ...ACTIONS,
  ...NAV,
  ...WEEKS.map((w) => ({
    id: `w${w.week}`,
    label: `Tuần ${w.week}`,
    sub: `≈ ${w.compare}`,
    href: `/thai-ky/tuan-${w.week}`,
    kind: 'tuần',
    search: deburr(`tuan ${w.week} thai ${w.week} ${w.compare} ${w.fruit}`),
  })),
  ...MONTHS.map((m) => ({
    id: `m${m.month}`,
    label: m.month === 0 ? 'Sơ sinh' : `Tháng ${m.month}`,
    sub: `≈ ${m.compare}`,
    href: `/be/thang-${m.month}`,
    kind: 'tháng',
    search: deburr(`thang ${m.month} ${m.compare} ${m.month === 0 ? 'so sinh newborn' : ''}`),
  })),
  ...PROFILES.map((p) => ({
    id: `u${p.handle}`,
    label: `@${p.handle}`,
    sub: p.name,
    href: `/u/${p.handle}`,
    kind: 'người',
    search: deburr(`${p.handle} ${p.name}`),
  })),
];

const BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

const KIND_CLASS: Record<string, string> = {
  'hành động': 'bg-accent/15 text-accent-ink',
  'đi tới': 'bg-ink/[0.06] text-ink',
  tuần: 'bg-tagfeat-bg text-tagfeat-ink',
  tháng: 'bg-tagperf-bg text-tagperf-ink',
  người: 'bg-tagdocs-bg text-tagdocs-ink',
};

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string): void {
  try {
    const next = [id, ...loadRecent().filter((x) => x !== id)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / privacy mode */
  }
}

function rank(q: string): Item[] {
  const dq = deburr(q.trim());
  const num = /^\d+$/.test(dq) ? Number(dq) : null;
  const scored = ITEMS.map((i) => {
    const hay = deburr(i.label) + ' ' + i.search;
    let score = 0;
    if (hay.includes(dq)) score = 1;
    if (deburr(i.label).startsWith(dq)) score = 3;
    if (num !== null && i.id === `w${num}`) score = 5;
    if (num !== null && i.id === `m${num}`) score = 4;
    return { i, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 9)
    .map((s) => s.i);
}

/** Hand an action to the live store island, or carry it across a navigation. */
function dispatchAction(detail: { action: ActionId; week?: number }): void {
  if (location.pathname === '/') {
    dispatchEvent(new CustomEvent('cmdk-action', { detail }));
  } else {
    try {
      sessionStorage.setItem('cmdk-intent', JSON.stringify(detail));
    } catch {
      /* ignore */
    }
    location.href = '/';
  }
}

type Row = { type: 'header'; label: string } | { type: 'item'; item: Item; i: number };

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'search' | 'setweek'>('search');
  const [q, setQ] = useState('');
  const [weekInput, setWeekInput] = useState('');
  const [sel, setSel] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    addEventListener('keydown', onKey);
    addEventListener('open-cmdk', onOpen);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('open-cmdk', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setMode('search');
      setQ('');
      setWeekInput('');
      setSel(0);
      setRecentIds(loadRecent());
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  if (!open) return null;

  // ----- set-week sub-mode --------------------------------------------------
  if (mode === 'setweek') {
    const n = weekInput ? parseInt(weekInput, 10) : NaN;
    const clamped = Number.isFinite(n) ? Math.max(WEEK_MIN, Math.min(WEEK_MAX, n)) : null;
    const preview = clamped ? WEEKS.find((w) => w.week === clamped) : null;
    const confirm = () => {
      if (!clamped) return;
      setOpen(false);
      dispatchAction({ action: 'setweek', week: clamped });
    };
    const onWeekKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMode('search');
        setQ('');
        setTimeout(() => inputRef.current?.focus(), 20);
      }
    };
    return (
      <Shell onClose={() => setOpen(false)}>
        <div class="flex items-center gap-2 border-b border-hair/[0.08] px-4">
          <span class="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[0.62rem] text-accent-ink">tuần thai</span>
          <input
            ref={inputRef}
            value={weekInput}
            inputMode="numeric"
            onInput={(e) => setWeekInput((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2))}
            onKeyDown={onWeekKey}
            placeholder={`nhập tuần ${WEEK_MIN}–${WEEK_MAX}…`}
            class="w-full bg-transparent py-3.5 font-serif text-[1.05rem] text-ink placeholder:text-muted/60 focus:outline-none"
          />
        </div>
        <div class="p-2">
          {preview ? (
            <button
              type="button"
              onClick={confirm}
              class="flex w-full items-center gap-3 rounded-lg bg-accent/[0.08] px-3 py-3 text-left"
            >
              <span class="text-2xl" aria-hidden="true">{preview.emoji}</span>
              <span class="min-w-0 flex-1">
                <span class="block font-serif text-[1.05rem] text-ink">Tuần {preview.week}</span>
                <span class="block truncate font-mono text-[0.72rem] text-muted">≈ {preview.compare}</span>
              </span>
              <span class="shrink-0 font-mono text-[0.7rem] text-accent-ink">đặt ↵</span>
            </button>
          ) : (
            <p class="px-3 py-4 font-mono text-sm text-muted">
              {weekInput ? `tuần ${weekInput} ngoài khoảng ${WEEK_MIN}–${WEEK_MAX}` : `nhập số tuần thai (${WEEK_MIN}–${WEEK_MAX})`}
            </p>
          )}
        </div>
        <div class="flex items-center justify-between border-t border-hair/[0.08] px-4 py-2 font-mono text-[0.65rem] text-muted/70">
          <span>↵ đặt tuần · esc quay lại</span>
          <span>tracker của bạn</span>
        </div>
      </Shell>
    );
  }

  // ----- normal search / launcher ------------------------------------------
  const recentItems = q.trim() ? [] : recentIds.map((id) => BY_ID[id]).filter(Boolean);
  const groups: { label?: string; items: Item[] }[] = q.trim()
    ? [{ items: rank(q) }]
    : [
        { label: 'hành động', items: ACTIONS },
        ...(recentItems.length ? [{ label: 'gần đây', items: recentItems }] : []),
        { label: 'đi tới', items: NAV },
      ];

  const rows: Row[] = [];
  let count = 0;
  for (const g of groups) {
    if (g.label) rows.push({ type: 'header', label: g.label });
    for (const item of g.items) {
      rows.push({ type: 'item', item, i: count });
      count += 1;
    }
  }
  const visible = rows.filter((r): r is Extract<Row, { type: 'item' }> => r.type === 'item').map((r) => r.item);

  const run = (item: Item) => {
    if (item.action === 'setweek') {
      setMode('setweek');
      setWeekInput('');
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 20);
      return;
    }
    if (item.action === 'theme') {
      window.__theme?.toggle();
      setOpen(false);
      return;
    }
    if (item.action) {
      setOpen(false);
      dispatchAction({ action: item.action });
      return;
    }
    if (!item.href) return;
    pushRecent(item.id);
    setOpen(false);
    location.href = item.href;
  };

  const onInputKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(visible.length - 1, s + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === 'Enter' && visible[sel]) {
      e.preventDefault();
      run(visible[sel]);
    }
  };

  return (
    <Shell onClose={() => setOpen(false)}>
      <div class="flex items-center gap-2 border-b border-hair/[0.08] px-4">
        <span class="font-mono text-sm text-muted">⌘K</span>
        <input
          ref={inputRef}
          value={q}
          onInput={(e) => {
            setQ((e.target as HTMLInputElement).value);
            setSel(0);
          }}
          onKeyDown={onInputKey}
          placeholder="ship, đặt tuần, tìm tháng, @người…"
          class="w-full bg-transparent py-3.5 font-serif text-[1.05rem] text-ink placeholder:text-muted/60 focus:outline-none"
        />
      </div>

      {visible.length > 0 ? (
        <ul class="max-h-[52vh] overflow-y-auto p-2">
          {rows.map((row) =>
            row.type === 'header' ? (
              <li key={`h-${row.label}`} class="px-2 pb-1 pt-2.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted/60">
                {row.label}
              </li>
            ) : (
              <li key={row.item.id}>
                <button
                  type="button"
                  onClick={() => run(row.item)}
                  onMouseEnter={() => setSel(row.i)}
                  class={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    row.i === sel ? 'bg-accent/[0.08]' : ''
                  }`}
                >
                  <span class={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.62rem] ${KIND_CLASS[row.item.kind] ?? KIND_CLASS['đi tới']}`}>
                    {row.item.kind}
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate font-serif text-[1.02rem] text-ink">
                      {row.item.icon ? `${row.item.icon} ` : ''}
                      {row.item.label}
                    </span>
                    <span class="block truncate font-mono text-[0.7rem] text-muted">{row.item.sub}</span>
                  </span>
                  {row.i === sel && <span class="shrink-0 font-mono text-[0.7rem] text-accent-ink">↵</span>}
                </button>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p class="px-4 py-8 text-center font-mono text-sm text-muted">
          không có kết quả cho “{q}”
        </p>
      )}

      <div class="flex items-center justify-between border-t border-hair/[0.08] px-4 py-2 font-mono text-[0.65rem] text-muted/70">
        <span>↑↓ chọn · ↵ mở · esc đóng</span>
        <span>{ACTIONS.length} hành động · {ITEMS.length - ACTIONS.length} mục</span>
      </div>
    </Shell>
  );
}

function Shell({ children, onClose }: { children: ComponentChildren; onClose: () => void }) {
  return (
    <div class="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-scrim/50 backdrop-blur-sm" onClick={onClose} />
      <div class="rise relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-hair/10 bg-surface shadow-2xl">
        {children}
      </div>
    </div>
  );
}
