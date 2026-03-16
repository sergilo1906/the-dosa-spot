const DEFAULT_SITE_URL = 'https://preview.local-business-site.example';
const resolvedSiteUrl = (process.env.PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/u, '');

export const siteConfig = {
  siteUrl: resolvedSiteUrl,
  locale: 'en_IE',
  languageTag: 'en-IE',
};
