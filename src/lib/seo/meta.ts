import type { BusinessBrief, DemoPreset } from '../../types/business';
import { siteConfig } from './site';

interface BuildPageMetaInput {
  business: BusinessBrief;
  preset: DemoPreset;
  pathname: string;
  noindex?: boolean;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogImage: string;
  siteName: string;
  themeColor: string;
}

export function buildPageMeta(input: BuildPageMetaInput): PageMeta {
  const canonical = new URL(input.pathname, siteConfig.siteUrl).toString();
  const title = input.business.seoTitle;
  const description = input.business.seoDescription;
  const ogImage =
    input.business.primaryImage?.src
      ? new URL(input.business.primaryImage.src, siteConfig.siteUrl).toString()
      : new URL('/favicon.svg', siteConfig.siteUrl).toString();

  return {
    title,
    description,
    canonical,
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow',
    ogImage,
    siteName: input.business.businessName,
    themeColor: input.business.brandColors[0] ?? '#2a140e',
  };
}
