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
}

export function buildPageMeta(input: BuildPageMetaInput): PageMeta {
  const canonical = new URL(input.pathname, siteConfig.siteUrl).toString();
  const title = input.business.seoTitle;
  const description = input.business.seoDescription;

  return {
    title,
    description,
    canonical,
    robots: input.noindex ? 'noindex, nofollow' : 'index, follow',
    ogImage: new URL(siteConfig.defaultOgImage, siteConfig.siteUrl).toString(),
  };
}
