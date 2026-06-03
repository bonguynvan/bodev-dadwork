// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bodev.vn',
  integrations: [
    preact({ compat: false }),
    sitemap({ filter: (page) => !page.includes('/og-card/') && !page.endsWith('/me/') }),
  ],
});
