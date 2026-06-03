/**
 * Regenerate per-page OG share images into public/og/.
 *
 * These are rendered from the /og-card/<slug> pages (noindexed) by screenshotting
 * them at 1200×630 with real fonts + emoji + the cute baby.
 *
 * Usage:
 *   1. npm i -D playwright-core          (drives system Edge/Chrome, no browser download)
 *   2. npm run build && npm run preview  (note the port it prints, default 4321)
 *   3. OG_BASE=http://localhost:4321 node scripts/gen-og.mjs
 *   4. npm run build                     (copies public/og/ → dist/og/)
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.OG_BASE || 'http://localhost:4321';
const EXECUTABLE = process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og');

const slugs = ['home', 'thai-ky', 'cong-dong'];
for (let w = 4; w <= 40; w++) slugs.push(`tuan-${w}`);
for (let m = 0; m <= 24; m++) slugs.push(`thang-${m}`);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: EXECUTABLE, headless: true });
let done = 0;
const failed = [];
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const slug of slugs) {
    try {
      await page.goto(`${BASE}/og-card/${slug}`, { waitUntil: 'networkidle' });
      await page.locator('svg').first().waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(350);
      await page.screenshot({ path: join(OUT, `${slug}.png`), clip: { x: 0, y: 0, width: 1200, height: 630 } });
      done++;
    } catch {
      failed.push(slug);
    }
  }
} finally {
  await browser.close();
}
console.log(`✓ ${done} OG images → public/og/` + (failed.length ? ` · failed: ${failed.join(', ')}` : ''));
