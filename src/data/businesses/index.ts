import { normalizeBusinessBrief } from '../../lib/business/normalize';
import type { BusinessBrief } from '../../types/business';
import { theDosaSpotInput } from './theDosaSpot';

const businesses = [theDosaSpotInput].map(normalizeBusinessBrief);

const businessMap = new Map<string, BusinessBrief>(businesses.map((business) => [business.slug, business]));

export function getAllBusinesses() {
  return businesses;
}

export function getBusinessBySlug(slug: string) {
  const business = businessMap.get(slug);

  if (!business) {
    throw new Error(`Unknown business slug: ${slug}`);
  }

  return business;
}
