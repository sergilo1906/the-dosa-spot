import type { BusinessBrief } from '../../types/business';
import { siteConfig } from './site';

function compactObject<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => compactObject(item))
      .filter((item) => item !== null && item !== undefined && item !== '') as T;
  }

  if (value && typeof value === 'object') {
    const next = Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, compactObject(item)])
        .filter(([, item]) => {
          if (item === null || item === undefined || item === '') return false;
          if (Array.isArray(item) && item.length === 0) return false;
          if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0) return false;
          return true;
        }),
    );

    return next as T;
  }

  return value;
}

export function buildStructuredData(business: BusinessBrief, canonical: string) {
  const website = compactObject({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: siteConfig.siteUrl,
    inLanguage: siteConfig.languageTag,
  });

  const organization = compactObject({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: business.businessName,
    url: business.website ?? canonical,
    description: business.shortDescription,
    sameAs: business.socialLinks,
    email: business.email ?? undefined,
  });

  const businessType = business.niche === 'restaurant' ? 'Restaurant' : 'HairSalon';
  const servesCuisine =
    business.niche === 'restaurant' && business.primaryCategory
      ? business.primaryCategory.replace(/\s+restaurant$/i, '').trim()
      : undefined;

  const localBusiness = compactObject({
    '@context': 'https://schema.org',
    '@type': [businessType, 'LocalBusiness'],
    name: business.businessName,
    description: business.shortDescription,
    url: business.website ?? canonical,
    image: business.primaryImage ? new URL(business.primaryImage.src, siteConfig.siteUrl).toString() : undefined,
    email: business.email ?? undefined,
    telephone: business.phone ?? undefined,
    sameAs: business.socialLinks,
    areaServed: business.localSeoData.areaServed,
    servesCuisine,
    priceRange: business.localSeoData.priceRange ?? undefined,
    aggregateRating:
      business.ratingValue && business.reviewCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: business.ratingValue,
            reviewCount: business.reviewCount,
          }
        : undefined,
    geo:
      business.coordinates && business.localSeoData.geoPrecision === 'exact'
        ? {
            '@type': 'GeoCoordinates',
            latitude: business.coordinates.lat,
            longitude: business.coordinates.lng,
          }
        : undefined,
    address: business.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: business.address,
          addressLocality: business.city,
          addressCountry: business.country,
        }
      : undefined,
    openingHoursSpecification: business.openingHours
      .filter((item) => item.dayOfWeek?.length && item.opens && item.closes)
      .map((item) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: item.dayOfWeek,
        opens: item.opens,
        closes: item.closes,
      })),
  });

  return [website, organization, localBusiness];
}
