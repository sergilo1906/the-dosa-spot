import type { BusinessBrief, BusinessBriefInput } from '../../types/business';

const completenessWeights: Record<string, number> = {
  tagline: 8,
  shortDescription: 8,
  primaryCategory: 4,
  featuredItems: 10,
  email: 5,
  website: 4,
  orderUrl: 4,
  services: 13,
  faqItems: 8,
  imageAssets: 14,
  ratingValue: 4,
  reviewCount: 4,
  reviewHighlights: 6,
  serviceModes: 6,
  proofPoints: 8,
  brandHints: 5,
  toneHints: 5,
  seoTitle: 4,
  seoDescription: 4,
  socialLinks: 3,
  openingHours: 4,
  address: 3,
  phone: 3,
  coordinates: 3,
  heroSignature: 4,
  atmosphereKeywords: 4,
  localSeoData: 3,
};

const defaultTagline = 'Warm plates, clear local details, and a stronger first impression.';
const defaultDescription =
  'A premium-casual local restaurant shaped around food-first visuals, clearer menus, and easier next steps.';

function filterStringList(input?: string[] | null) {
  return (input ?? []).map((item) => item.trim()).filter(Boolean);
}

function getWebsiteLabel(website?: string | null) {
  if (!website) return null;

  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

function buildCallHref(phone?: string | null) {
  if (!phone) return null;

  const numeric = phone.replace(/[^\d+]/g, '');
  return numeric ? `tel:${numeric}` : null;
}

function buildDirectionsHref(address?: string | null, city?: string | null, country?: string | null) {
  const query = [address, city, country].filter(Boolean).join(', ');

  if (!query) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function scoreField(input: BusinessBriefInput, field: keyof typeof completenessWeights) {
  const value = input[field as keyof BusinessBriefInput];

  if (Array.isArray(value)) return value.length > 0 ? completenessWeights[field] : 0;
  if (typeof value === 'object' && value !== null) return completenessWeights[field];
  return value ? completenessWeights[field] : 0;
}

function buildMissingDataFlags(input: BusinessBriefInput) {
  const flags = new Set<string>(input.missingDataFlags ?? []);
  const checks: Array<[string, unknown]> = [
    ['address', input.address],
    ['phone', input.phone],
    ['openingHours', input.openingHours?.length],
    ['coordinates', input.coordinates],
    ['socialLinks', input.socialLinks?.length],
    ['realReviews', input.realReviews?.length],
  ];

  for (const [key, value] of checks) {
    if (!value) flags.add(key);
  }

  return [...flags];
}

export function normalizeBusinessBrief(input: BusinessBriefInput): BusinessBrief {
  const featuredItems = input.featuredItems ?? [];
  const services = input.services ?? [];
  const faqItems = input.faqItems ?? [];
  const realReviews = input.realReviews ?? [];
  const reviewHighlights = filterStringList(input.reviewHighlights);
  const serviceModes = filterStringList(input.serviceModes);
  const imageAssets = input.imageAssets ?? [];
  const visualAssets = imageAssets.filter((asset) => asset.kind !== 'texture');
  const primaryImage = imageAssets.find((asset) => asset.kind === 'hero') ?? visualAssets[0] ?? null;
  const galleryAssets = visualAssets.filter((asset) => asset.id !== primaryImage?.id);
  const openingHours = input.openingHours ?? [];
  const socialLinks = filterStringList(input.socialLinks);
  const brandHints = filterStringList(input.brandHints);
  const brandColors = filterStringList(input.brandColors);
  const toneHints = filterStringList(input.toneHints);
  const atmosphereKeywords = filterStringList(input.atmosphereKeywords);
  const proofPoints = filterStringList(input.proofPoints);

  const totalPossible = Object.values(completenessWeights).reduce((sum, value) => sum + value, 0);
  const totalScore = (Object.keys(completenessWeights) as Array<keyof typeof completenessWeights>).reduce(
    (sum, key) => sum + scoreField(input, key),
    0,
  );

  const callHref = buildCallHref(input.phone);
  const directionsHref = buildDirectionsHref(input.address, input.city, input.country);
  const orderHref = input.orderUrl?.trim() || null;
  const menuHref = input.menuUrl?.trim() || '#menu';
  const contactHref = callHref ?? (input.email ? `mailto:${input.email}` : input.website ?? null);
  const websiteLabel = getWebsiteLabel(input.website);
  const ratingLabel =
    input.ratingValue && input.reviewCount
      ? `${input.ratingValue} rating from ${input.reviewCount} reviews`
      : input.ratingValue
        ? `${input.ratingValue} rating`
        : null;

  return {
    ...input,
    primaryCategory: input.primaryCategory?.trim() || null,
    tagline: input.tagline?.trim() || defaultTagline,
    shortDescription: input.shortDescription?.trim() || defaultDescription,
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    website: input.website?.trim() || null,
    orderUrl: input.orderUrl?.trim() || null,
    menuUrl: input.menuUrl?.trim() || null,
    openingHours,
    coordinates: input.coordinates ?? null,
    socialLinks,
    featuredItems,
    services,
    faqItems,
    realReviews,
    ratingValue: input.ratingValue ?? null,
    reviewCount: input.reviewCount ?? null,
    reviewHighlights,
    serviceModes,
    imageAssets,
    brandHints,
    brandColors,
    toneHints,
    visualMood: input.visualMood?.trim() || 'Warm local restaurant with food-first colour',
    seoTitle:
      input.seoTitle?.trim() ||
      `${input.businessName} | Local Restaurant in ${input.city}, ${input.country}`,
    seoDescription:
      input.seoDescription?.trim() ||
      `${input.businessName} is a local restaurant in ${input.city}, ${input.country} with food-first visuals, clearer menu highlights, and a polished local presence.`,
    localSeoData: input.localSeoData ?? {},
    missingDataFlags: buildMissingDataFlags(input),
    completenessScore: input.completenessScore ?? Math.round((totalScore / totalPossible) * 100),
    desiredLuxuryLevel: input.desiredLuxuryLevel ?? 'editorial',
    visualIntensity: input.visualIntensity ?? 'cinematic',
    photographyStyle: input.photographyStyle?.trim() || 'hybrid editorial illustration',
    atmosphereKeywords,
    preferredContrast: input.preferredContrast ?? 'high',
    sectionDensityPreference: input.sectionDensityPreference ?? 'airy',
    proofPoints,
    heroSignature:
      input.heroSignature?.trim() ||
      'A local restaurant experience built around warm plates, quicker decisions, and an easier sense of trust.',
    materialFinish: input.materialFinish?.trim() || 'Warm cream, saffron, tamarind red, and leaf green accents.',
    imageTreatment: input.imageTreatment?.trim() || 'Warm tabletop light, plated close-ups, and textured food-first contrast.',
    primaryImage,
    galleryAssets,
    display: {
      location: input.address?.trim() || `${input.city}, ${input.country}`,
      contactLabel: callHref ? 'Call the restaurant' : input.email ? 'Email the restaurant' : input.website ? 'Visit the restaurant online' : 'Contact details updated soon',
      contactHref,
      callHref,
      directionsHref,
      orderHref,
      menuHref,
      websiteLabel,
      openingHoursLabel: openingHours[0]?.label ?? null,
      ratingLabel,
    },
    sectionEligibility: {
      about: true,
      featuredItems: featuredItems.length > 0,
      services: services.length > 0,
      gallery: galleryAssets.length > 0 || proofPoints.length > 0,
      credibility:
        realReviews.length > 0 ||
        proofPoints.length > 0 ||
        reviewHighlights.length > 0 ||
        Boolean(input.ratingValue && input.reviewCount),
      faq: faqItems.length > 0,
      contact: Boolean(input.email || input.website || input.address || input.phone),
    },
  };
}
