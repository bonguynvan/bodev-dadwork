/**
 * Client-side share card generator. Renders a branded 1080×1080 image of the
 * user's current baby "build" (their diary photo when present) to a canvas,
 * then hands it to the native share sheet or falls back to a download.
 * Everything happens locally — the photo never touches a server.
 */

export interface ShareData {
  title: string; // e.g. "Tuần 20" / "Tháng 3"
  name?: string; // baby's home name / codename
  version: string; // "v1.0.0"
  compare: string; // "một chiếc bàn phím cơ"
  emoji: string;
  caption?: string; // optional diary note
  sub: string; // short status, e.g. "còn 20 tuần → v1.0.0"
  photoUrl?: string; // diary photo data URL
  streak: number;
  pct: number; // 0..100 progress
}

const W = 1080;
const SURFACE = '#FAFAF8';
const INK = '#1A1A1A';
const MUTED = '#6B6B6B';
const ACCENT = '#1D9E75';
const ACCENT_INK = '#15795A';
const LINE = 'rgba(0,0,0,0.08)';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number): void {
  const ir = img.width / img.height;
  const rr = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (ir > rr) {
    sw = img.height * rr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / rr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function clampLine(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });

async function ensureFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('700 84px Newsreader'),
      document.fonts.load('500 42px Newsreader'),
      document.fonts.load('italic 500 40px Newsreader'),
      document.fonts.load('500 30px "JetBrains Mono"'),
      document.fonts.load('700 34px "JetBrains Mono"'),
    ]);
    await document.fonts.ready;
  } catch {
    /* fall back to system fonts */
  }
}

export async function renderShareCard(d: ShareData): Promise<Blob> {
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas không khả dụng');

  const P = 80;
  const innerW = W - P * 2;

  // background
  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, 0, W, W);

  // wordmark
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 34px "JetBrains Mono", monospace';
  ctx.fillStyle = INK;
  ctx.fillText('bo', P, 118);
  const w1 = ctx.measureText('bo').width;
  ctx.fillStyle = ACCENT_INK;
  ctx.fillText('dev', P + w1, 118);
  const w2 = ctx.measureText('dev').width;
  ctx.fillStyle = INK;
  ctx.fillText('.vn', P + w1 + w2, 118);
  ctx.fillStyle = MUTED;
  ctx.font = '500 30px "JetBrains Mono", monospace';
  ctx.fillText('/ ship.log', P + w1 + w2 + ctx.measureText('.vn').width + 14, 118);

  // version pill (right)
  ctx.font = '700 30px "JetBrains Mono", monospace';
  const vw = ctx.measureText(d.version).width;
  roundRect(ctx, W - P - vw - 36, 86, vw + 36, 44, 22);
  ctx.fillStyle = 'rgba(29,158,117,0.12)';
  ctx.fill();
  ctx.fillStyle = ACCENT_INK;
  ctx.fillText(d.version, W - P - vw - 18, 117);

  // feature block: photo, or an accent panel with the big emoji
  const fy = 150;
  const fh = 496;
  roundRect(ctx, P, fy, innerW, fh, 40);
  ctx.save();
  ctx.clip();
  if (d.photoUrl) {
    try {
      const img = await loadImage(d.photoUrl);
      drawCover(ctx, img, P, fy, innerW, fh);
    } catch {
      ctx.fillStyle = 'rgba(29,158,117,0.10)';
      ctx.fillRect(P, fy, innerW, fh);
    }
  } else {
    ctx.fillStyle = 'rgba(29,158,117,0.10)';
    ctx.fillRect(P, fy, innerW, fh);
    ctx.font = '260px serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.emoji, W / 2, fy + fh / 2 + 95);
    ctx.textAlign = 'left';
  }
  ctx.restore();
  roundRect(ctx, P, fy, innerW, fh, 40);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  // name kicker (codename) above the title
  if (d.name) {
    ctx.fillStyle = ACCENT_INK;
    ctx.font = '700 34px "JetBrains Mono", monospace';
    ctx.fillText(clampLine(ctx, `🍼 Bé ${d.name}`, innerW), P, 716);
  }

  // title
  ctx.fillStyle = INK;
  ctx.font = '700 84px Newsreader, Georgia, serif';
  ctx.fillText(clampLine(ctx, d.title, innerW), P, 796);

  // compare line
  ctx.font = '500 42px Newsreader, Georgia, serif';
  ctx.fillStyle = INK;
  ctx.fillText(clampLine(ctx, `≈ ${d.compare} ${d.emoji}`, innerW), P, 858);

  // caption (personal) or short status
  if (d.caption) {
    ctx.font = 'italic 500 40px Newsreader, Georgia, serif';
    ctx.fillStyle = ACCENT_INK;
    ctx.fillText(clampLine(ctx, `“${d.caption}”`, innerW), P, 920);
  } else {
    ctx.font = '500 32px "JetBrains Mono", monospace';
    ctx.fillStyle = MUTED;
    ctx.fillText(clampLine(ctx, `▸ ${d.sub}`, innerW), P, 918);
  }

  // progress bar
  const by = 966;
  roundRect(ctx, P, by, innerW, 12, 6);
  ctx.fillStyle = LINE;
  ctx.fill();
  const fillW = Math.max(12, (innerW * Math.min(100, Math.max(0, d.pct))) / 100);
  roundRect(ctx, P, by, fillW, 12, 6);
  ctx.fillStyle = ACCENT;
  ctx.fill();

  // footer
  ctx.font = '500 30px "JetBrains Mono", monospace';
  ctx.fillStyle = MUTED;
  ctx.fillText('theo dõi bé của bạn · bodev.vn', P, 1042);
  if (d.streak > 0) {
    const s = `🔥 ${d.streak}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = ACCENT_INK;
    ctx.fillText(s, W - P, 1042);
    ctx.textAlign = 'left';
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export interface RecapData {
  commits: number;
  activeDays: number; // 0..7
  reactions: number;
  photos: number;
  babyLine: string; // "Bé Bún · Tuần 20 · v1.0.0"
  streak: number;
}

/** A "wrapped"-style weekly summary card. */
export async function renderRecapCard(d: RecapData): Promise<Blob> {
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas không khả dụng');

  const P = 80;
  const innerW = W - P * 2;

  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, 0, W, W);

  // wordmark
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 34px "JetBrains Mono", monospace';
  ctx.fillStyle = INK;
  ctx.fillText('bo', P, 118);
  const w1 = ctx.measureText('bo').width;
  ctx.fillStyle = ACCENT_INK;
  ctx.fillText('dev', P + w1, 118);
  const w2 = ctx.measureText('dev').width;
  ctx.fillStyle = INK;
  ctx.fillText('.vn', P + w1 + w2, 118);

  // "tuần này" pill (right)
  ctx.font = '700 30px "JetBrains Mono", monospace';
  const pillTxt = 'tuần này';
  const pw = ctx.measureText(pillTxt).width;
  roundRect(ctx, W - P - pw - 36, 86, pw + 36, 44, 22);
  ctx.fillStyle = 'rgba(29,158,117,0.12)';
  ctx.fill();
  ctx.fillStyle = ACCENT_INK;
  ctx.fillText(pillTxt, W - P - pw - 18, 117);

  // title
  ctx.fillStyle = INK;
  ctx.font = '700 74px Newsreader, Georgia, serif';
  ctx.fillText('Tuần này trên', P, 252);
  ctx.fillText('ship.log 🚀', P, 330);

  // 2×2 stat grid
  const tiles = [
    { n: String(d.commits), label: 'commit' },
    { n: `${d.activeDays}/7`, label: 'ngày active 🔥' },
    { n: String(d.reactions), label: 'reaction ❤️' },
    { n: String(d.photos), label: 'ảnh mới 📸' },
  ];
  const gy = 392;
  const gap = 28;
  const tw = (innerW - gap) / 2;
  const th = 178;
  tiles.forEach((t, i) => {
    const x = P + (i % 2) * (tw + gap);
    const y = gy + Math.floor(i / 2) * (th + gap);
    roundRect(ctx, x, y, tw, th, 28);
    ctx.fillStyle = 'rgba(29,158,117,0.08)';
    ctx.fill();
    ctx.fillStyle = ACCENT_INK;
    ctx.font = '700 76px Newsreader, Georgia, serif';
    ctx.fillText(t.n, x + 36, y + 98);
    ctx.fillStyle = MUTED;
    ctx.font = '500 30px "JetBrains Mono", monospace';
    ctx.fillText(t.label, x + 36, y + 142);
  });

  // baby line
  const by = gy + 2 * th + gap + 64;
  ctx.fillStyle = INK;
  ctx.font = '500 40px Newsreader, Georgia, serif';
  ctx.fillText(clampLine(ctx, `🍼 ${d.babyLine}`, innerW), P, by);

  // footer
  ctx.font = '500 30px "JetBrains Mono", monospace';
  ctx.fillStyle = MUTED;
  ctx.fillText('theo dõi bé của bạn · bodev.vn', P, 1042);
  if (d.streak > 0) {
    ctx.textAlign = 'right';
    ctx.fillStyle = ACCENT_INK;
    ctx.fillText(`🔥 ${d.streak}`, W - P, 1042);
    ctx.textAlign = 'left';
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

/** Native share when available, otherwise download the PNG + copy the site link. */
export async function shareImage(blob: Blob, filename: string, text: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files?: File[]; text?: string; title?: string }) => Promise<void>;
  };
  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, title: 'bodev.vn / ship.log' });
      return 'shared';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'shared';
      /* otherwise fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  try {
    await navigator.clipboard?.writeText('https://bodev.vn');
  } catch {
    /* clipboard may be unavailable */
  }
  return 'downloaded';
}
