// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

const defaultSiteUrl = 'https://preview.local-business-site.example';
const siteUrl = (process.env.PUBLIC_SITE_URL ?? process.env.SITE_URL ?? defaultSiteUrl).replace(/\/+$/u, '');

export default defineConfig({
  site: siteUrl,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/demo/'),
    }),
  ],
  build: {
    format: 'directory',
  },
});
