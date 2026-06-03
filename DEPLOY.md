# Deploy bodev.vn / ship.log

This is a **static** Astro site (`output: "static"`). `npm run build` → everything lands in `dist/`, which any static host serves. No server, no database, no env vars required.

The config files for the three easiest hosts are already in the repo:

| Host | Config in repo | What it does |
| --- | --- | --- |
| **Vercel** | `vercel.json` | build + headers + caching |
| **Netlify** | `netlify.toml` + `public/_headers` | build + headers + caching |
| **Cloudflare Pages** | `public/_headers` | headers + caching (build set in dashboard) |
| **GitHub Pages** | `.github/workflows/deploy-pages.yml` | CI build + deploy |

---

## Before you deploy (1 minute)

1. **Set your real domain.** In `astro.config.mjs`, `site` is `https://bodev.vn`. This drives canonical URLs, `og:image` URLs and the sitemap — so it **must** match the domain you'll serve from. If you use a different domain, change it and rebuild.
2. **Commit everything**, including `public/og/*.png` (the 65 pre-generated share images — they're committed, not built by the host) and `public/_headers`. `dist/`, `node_modules/`, and `.env` stay gitignored.
3. Push the repo to GitHub/GitLab (needed for the dashboard one-click flows).

---

## Option A — Vercel (recommended, easiest)

**Dashboard:** vercel.com → *Add New → Project* → import the repo. Vercel auto-detects Astro:
- Framework preset: **Astro**
- Build command: `npm run build` · Output dir: `dist`
- Deploy. `vercel.json` applies the headers/caching automatically.

**CLI:** `npm i -g vercel` → `vercel` (preview) → `vercel --prod`.

**Custom domain:** Project → Settings → Domains → add `bodev.vn` and point your DNS (Vercel shows the exact A/CNAME records).

## Option B — Netlify

**Dashboard:** netlify.com → *Add new site → Import an existing project* → pick the repo. Settings come from `netlify.toml` (build `npm run build`, publish `dist`, Node 22). Deploy.

**CLI:** `npm i -g netlify-cli` → `netlify deploy` → `netlify deploy --prod`.

**Custom domain:** Site → Domain management → add `bodev.vn`.

## Option C — Cloudflare Pages

Dashboard → *Workers & Pages → Create → Pages → Connect to Git* → pick the repo:
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `NODE_VERSION = 22`
- Save & Deploy. `public/_headers` applies the headers.

**Custom domain:** Pages project → Custom domains → add `bodev.vn`.

## Option D — GitHub Pages (free, CI-based)

1. Repo → Settings → Pages → **Source: GitHub Actions**.
2. Push to `main` — the included workflow builds and deploys.
3. **Custom domain** (`bodev.vn`): set it in Settings → Pages. If you instead use the default `username.github.io/<repo>/` URL, you must set `base: '/<repo>/'` in `astro.config.mjs` and update `site`, then rebuild (otherwise links/canonical/OG break). A custom domain avoids this.

---

## After deploy — checklist

- [ ] Site loads, the cartoon baby renders, onboarding appears on first visit.
- [ ] **Share preview**: paste a URL (e.g. `https://bodev.vn/thai-ky/tuan-24`) into [opengraph.xyz](https://www.opengraph.xyz/) or the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — you should see the baby card.
- [ ] `https://bodev.vn/sitemap-index.xml` and `https://bodev.vn/robots.txt` resolve.
- [ ] Submit the sitemap in **Google Search Console** (this is how the per-week/month pages start ranking — your traffic hook).
- [ ] Run **Lighthouse** (Chrome DevTools → Lighthouse) on the homepage + a week page; aim for 90+ on Performance/SEO/Best-Practices/Accessibility.

## Regenerating the OG share images

They're committed in `public/og/`. Only regenerate if you change the baby art or the week/month data:

```bash
npm i -D playwright-core      # drives system Edge/Chrome, no browser download
npm run build && npm run preview   # note the port (default 4321)
OG_BASE=http://localhost:4321 npm run gen:og
npm run build                 # copies public/og → dist/og
```

## Notes

- **CSP**: a Content-Security-Policy ships in the headers. `script-src` includes `'unsafe-inline'` because Astro emits a small inline hydration script; to tighten it later, switch to Astro's CSP hashing (`experimental.csp`) and drop `'unsafe-inline'`.
- The community is **simulated / local-first** — there's no backend to provision. Real accounts (e.g. "Sign in with GitHub") are a future step and would add a serverless function; nothing here blocks that later.
