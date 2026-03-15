import type { APIRoute } from 'astro';
import { siteConfig } from '../lib/seo/site';

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString() ?? siteConfig.siteUrl;
  const sitemapUrl = new URL('/sitemap-index.xml', base).toString();

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
