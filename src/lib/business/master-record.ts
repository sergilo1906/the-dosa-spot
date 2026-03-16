import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type {
  BusinessBriefInput,
  Coordinates,
  FaqItem,
  FeaturedItem,
  ImageAsset,
  OpeningHoursItem,
  ReviewItem,
  ServiceItem,
} from '../../types/business';
import { BUSINESS_NICHES as SUPPORTED_BUSINESS_NICHES } from '../../types/business.ts';
import type {
  BusinessBriefFile,
  BusinessMasterRecord,
  BusinessRawFile,
  BusinessRecordFileBase,
  BusinessRecordFileKind,
  BusinessSource,
  ContentFallbackRule,
  ContentPlanFile,
  ConversionActionKey,
  ExternalPlatformLink,
  FieldStateEntry,
  ImageCropIntent,
  ImageMapAsset,
  ImageMapFile,
  ImageMapRole,
  MissingDataFile,
  MissingDataItem,
  PlannedCta,
  PlannedSection,
  RawFeaturedItem,
  RawOfferCategory,
  RawRatingSnapshot,
  ValidationIssue,
} from '../../types/business-record';

type UnknownRecord = Record<string, unknown>;

const FILE_NAMES = {
  raw: 'business-raw.json',
  brief: 'business-brief.json',
  missingData: 'missing-data.json',
  contentPlan: 'content-plan.json',
  imageMap: 'image-map.json',
} as const;

const dataStates = ['verified', 'inferred', 'missing', 'conflict', 'pending'] as const;
const fileKinds = ['business-raw', 'business-brief', 'missing-data', 'content-plan', 'image-map'] as const;
const businessNiches = SUPPORTED_BUSINESS_NICHES;
const missingDataSeverities = ['high', 'medium', 'low'] as const;
const sourceTypes = [
  'maps',
  'website',
  'html',
  'manual',
  'research',
  'image-folder',
  'social',
  'review-platform',
  'other',
] as const;
const conversionActionKeys = [
  'get-directions',
  'order-online',
  'call',
  'view-menu',
  'visit-website',
  'email',
  'whatsapp',
] as const;
const conversionGoals = ['visit', 'call', 'order', 'book', 'message', 'browse-menu'] as const;
const contentSectionIds = ['hero', 'popular-items', 'services', 'credibility', 'about', 'gallery', 'faq', 'cta', 'footer'] as const;
const contentPriorities = ['high', 'medium', 'low'] as const;
const desiredLuxuryLevels = ['elevated', 'high', 'editorial'] as const;
const visualIntensities = ['restrained', 'bold', 'cinematic'] as const;
const preferredContrasts = ['soft', 'balanced', 'high'] as const;
const sectionDensityPreferences = ['airy', 'balanced', 'dense'] as const;
const geoPrecisions = ['exact', 'district', 'city'] as const;
const imageKinds = ['hero', 'gallery', 'detail', 'texture'] as const;
const imageRatios = ['portrait', 'landscape', 'square', 'ultrawide'] as const;
const imageMapRoles = ['hero', 'gallery', 'dish', 'ambience', 'exterior', 'interior', 'detail', 'social', 'fallback', 'discard'] as const;
const imageMapQualities = ['strong', 'usable', 'weak', 'discard'] as const;
const imageReviewStatuses = ['approved', 'backup', 'discard'] as const;
const imageCropIntents = ['portrait', 'landscape', 'square', 'social'] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectRecord(value: unknown, path: string): UnknownRecord {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value;
}

function expectArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array.`);
  }

  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} must be a non-empty string.`);
  }

  return value.trim();
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalStringOrUndefined(value: unknown): string | undefined {
  const normalized = optionalString(value);
  return normalized ?? undefined;
}

function optionalNumber(value: unknown, path: string): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${path} must be a number when provided.`);
  }

  return value;
}

function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${path} must be a boolean.`);
  }

  return value;
}

function optionalBoolean(value: unknown, defaultValue = false): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

function optionalStringArray(value: unknown, path: string): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array when provided.`);
  }

  return value.map((item, index) => expectString(item, `${path}[${index}]`));
}

function expectOneOf<T extends string>(value: unknown, path: string, allowed: readonly T[]): T {
  const stringValue = expectString(value, path);

  if (!allowed.includes(stringValue as T)) {
    throw new Error(`${path} must be one of: ${allowed.join(', ')}.`);
  }

  return stringValue as T;
}

function parseCoordinates(value: unknown, path: string): Coordinates | null {
  if (value === null || value === undefined) return null;

  const record = expectRecord(value, path);
  const lat = optionalNumber(record.lat, `${path}.lat`);
  const lng = optionalNumber(record.lng, `${path}.lng`);

  if (lat === null || lng === null) {
    throw new Error(`${path} must include lat and lng when provided.`);
  }

  return { lat, lng };
}

function parseOpeningHoursItem(value: unknown, path: string): OpeningHoursItem {
  const record = expectRecord(value, path);

  return {
    label: expectString(record.label, `${path}.label`),
    dayOfWeek: optionalStringArray(record.dayOfWeek, `${path}.dayOfWeek`),
    opens: optionalStringOrUndefined(record.opens),
    closes: optionalStringOrUndefined(record.closes),
  };
}

function parseServiceItem(value: unknown, path: string): ServiceItem {
  const record = expectRecord(value, path);

  return {
    title: expectString(record.title, `${path}.title`),
    summary: expectString(record.summary, `${path}.summary`),
    duration: optionalString(record.duration),
    priceLabel: optionalString(record.priceLabel),
    accent: optionalString(record.accent),
  };
}

function parseFaqItem(value: unknown, path: string): FaqItem {
  const record = expectRecord(value, path);

  return {
    question: expectString(record.question, `${path}.question`),
    answer: expectString(record.answer, `${path}.answer`),
  };
}

function parseReviewItem(value: unknown, path: string): ReviewItem {
  const record = expectRecord(value, path);

  return {
    quote: expectString(record.quote, `${path}.quote`),
    reviewer: expectString(record.reviewer, `${path}.reviewer`),
    sourceLabel: optionalString(record.sourceLabel),
    datePublished: optionalString(record.datePublished),
  };
}

function parseExternalPlatformLink(value: unknown, path: string): ExternalPlatformLink {
  const record = expectRecord(value, path);

  return {
    label: expectString(record.label, `${path}.label`),
    url: expectString(record.url, `${path}.url`),
    kind: optionalString(record.kind),
  };
}

function parseFieldStateEntry(value: unknown, path: string): FieldStateEntry {
  const record = expectRecord(value, path);

  return {
    state: expectOneOf(record.state, `${path}.state`, dataStates),
    sourceIds: optionalStringArray(record.sourceIds, `${path}.sourceIds`),
    notes: optionalString(record.notes),
  };
}

function parseBusinessSource(value: unknown, path: string): BusinessSource {
  const record = expectRecord(value, path);

  return {
    id: expectString(record.id, `${path}.id`),
    type: expectOneOf(record.type, `${path}.type`, sourceTypes),
    label: expectString(record.label, `${path}.label`),
    filePath: optionalString(record.filePath),
    url: optionalString(record.url),
    notes: optionalString(record.notes),
  };
}

function parseRawOfferCategory(value: unknown, path: string): RawOfferCategory {
  const record = expectRecord(value, path);

  return {
    title: expectString(record.title, `${path}.title`),
    summary: expectString(record.summary, `${path}.summary`),
  };
}

function parseRawFeaturedItem(value: unknown, path: string): RawFeaturedItem {
  const record = expectRecord(value, path);

  return {
    title: expectString(record.title, `${path}.title`),
    summary: expectString(record.summary, `${path}.summary`),
    accent: optionalString(record.accent),
    imageAssetId: optionalString(record.imageAssetId),
  };
}

function parseMissingDataItem(value: unknown, path: string): MissingDataItem {
  const record = expectRecord(value, path);

  return {
    path: expectString(record.path, `${path}.path`),
    state: expectOneOf(record.state, `${path}.state`, ['inferred', 'missing', 'conflict', 'pending'] as const),
    severity: expectOneOf(record.severity, `${path}.severity`, missingDataSeverities),
    reason: expectString(record.reason, `${path}.reason`),
    impact: optionalString(record.impact),
    recommendedAction: optionalString(record.recommendedAction),
  };
}

function parsePlannedCta(value: unknown, path: string): PlannedCta {
  const record = expectRecord(value, path);

  return {
    key: expectOneOf(record.key, `${path}.key`, conversionActionKeys),
    label: expectString(record.label, `${path}.label`),
    reason: expectString(record.reason, `${path}.reason`),
  };
}

function parseFallbackRule(value: unknown, path: string): ContentFallbackRule {
  const record = expectRecord(value, path);

  return {
    when: expectString(record.when, `${path}.when`),
    useActionKey: expectOneOf(record.useActionKey, `${path}.useActionKey`, conversionActionKeys),
    reason: expectString(record.reason, `${path}.reason`),
  };
}

function parsePlannedSection(value: unknown, path: string): PlannedSection {
  const record = expectRecord(value, path);

  return {
    id: expectOneOf(record.id, `${path}.id`, contentSectionIds),
    enabled: expectBoolean(record.enabled, `${path}.enabled`),
    priority: expectOneOf(record.priority, `${path}.priority`, contentPriorities),
    reason: expectString(record.reason, `${path}.reason`),
  };
}

function parseImageMapAsset(value: unknown, path: string): ImageMapAsset {
  const record = expectRecord(value, path);

  return {
    id: expectString(record.id, `${path}.id`),
    publicPath: expectString(record.publicPath, `${path}.publicPath`),
    originalFilename: optionalString(record.originalFilename),
    kind: expectOneOf(record.kind, `${path}.kind`, imageKinds),
    ratio: expectOneOf(record.ratio, `${path}.ratio`, imageRatios),
    roles: optionalStringArray(record.roles, `${path}.roles`).map((item, index) =>
      expectOneOf(item, `${path}.roles[${index}]`, imageMapRoles),
    ) as ImageMapRole[],
    quality: expectOneOf(record.quality, `${path}.quality`, imageMapQualities),
    reviewStatus: expectOneOf(record.reviewStatus, `${path}.reviewStatus`, imageReviewStatuses),
    heroCandidate: optionalBoolean(record.heroCandidate),
    discard: optionalBoolean(record.discard),
    subject: expectString(record.subject, `${path}.subject`),
    treatment: optionalString(record.treatment),
    suggestedAlt: expectString(record.suggestedAlt, `${path}.suggestedAlt`),
    desiredCrops: optionalStringArray(record.desiredCrops, `${path}.desiredCrops`).map((item, index) =>
      expectOneOf(item, `${path}.desiredCrops[${index}]`, imageCropIntents),
    ) as ImageCropIntent[],
    width: optionalNumber(record.width, `${path}.width`),
    height: optionalNumber(record.height, `${path}.height`),
    notes: optionalString(record.notes),
  };
}

function parseFileBase(value: unknown, expectedKind: BusinessRecordFileKind, path: string): BusinessRecordFileBase {
  const record = expectRecord(value, path);
  const fileKind = expectOneOf(record.fileKind, `${path}.fileKind`, fileKinds);

  if (fileKind !== expectedKind) {
    throw new Error(`${path}.fileKind must be ${expectedKind}.`);
  }

  return {
    schemaVersion: optionalNumber(record.schemaVersion, `${path}.schemaVersion`) ?? 1,
    fileKind,
    businessSlug: expectString(record.businessSlug, `${path}.businessSlug`),
    updatedAt: expectString(record.updatedAt, `${path}.updatedAt`),
  };
}

function parseBusinessRawFile(value: unknown, path: string): BusinessRawFile {
  const meta = parseFileBase(value, 'business-raw', path);
  const record = expectRecord(value, path);
  const identity = expectRecord(record.identity, `${path}.identity`);
  const contact = expectRecord(record.contact, `${path}.contact`);
  const operations = expectRecord(record.operations ?? {}, `${path}.operations`);
  const offer = expectRecord(record.offer, `${path}.offer`);
  const trust = expectRecord(record.trust, `${path}.trust`);
  const visual = expectRecord(record.visual, `${path}.visual`);
  const seo = expectRecord(record.seo, `${path}.seo`);
  const assets = expectRecord(record.assets ?? {}, `${path}.assets`);
  const fieldStatusRecord = isRecord(record.fieldStatus) ? record.fieldStatus : {};

  return {
    ...meta,
    fileKind: 'business-raw',
    sources: expectArray(record.sources, `${path}.sources`).map((item, index) =>
      parseBusinessSource(item, `${path}.sources[${index}]`),
    ),
    identity: {
      businessName: expectString(identity.businessName, `${path}.identity.businessName`),
      slug: expectString(identity.slug, `${path}.identity.slug`),
      niche: expectOneOf(identity.niche, `${path}.identity.niche`, businessNiches),
      primaryCategory: optionalString(identity.primaryCategory),
      secondaryCategories: optionalStringArray(identity.secondaryCategories, `${path}.identity.secondaryCategories`),
      city: expectString(identity.city, `${path}.identity.city`),
      country: expectString(identity.country, `${path}.identity.country`),
      district: optionalString(identity.district),
      addressLine: optionalString(identity.addressLine),
      plusCode: optionalString(identity.plusCode),
      coordinates: parseCoordinates(identity.coordinates, `${path}.identity.coordinates`),
    },
    contact: {
      phone: optionalString(contact.phone),
      whatsapp: optionalString(contact.whatsapp),
      email: optionalString(contact.email),
      website: optionalString(contact.website),
      orderUrl: optionalString(contact.orderUrl),
      menuUrl: optionalString(contact.menuUrl),
      mapsUrl: optionalString(contact.mapsUrl),
      socialLinks: optionalStringArray(contact.socialLinks, `${path}.contact.socialLinks`),
      externalPlatforms: expectArray(contact.externalPlatforms ?? [], `${path}.contact.externalPlatforms`).map((item, index) =>
        parseExternalPlatformLink(item, `${path}.contact.externalPlatforms[${index}]`),
      ),
    },
    operations: {
      openingHours: expectArray(operations.openingHours ?? [], `${path}.operations.openingHours`).map((item, index) =>
        parseOpeningHoursItem(item, `${path}.operations.openingHours[${index}]`),
      ),
    },
    offer: {
      serviceModes: optionalStringArray(offer.serviceModes, `${path}.offer.serviceModes`),
      categories: expectArray(offer.categories ?? [], `${path}.offer.categories`).map((item, index) =>
        parseRawOfferCategory(item, `${path}.offer.categories[${index}]`),
      ),
      featuredItems: expectArray(offer.featuredItems ?? [], `${path}.offer.featuredItems`).map((item, index) =>
        parseRawFeaturedItem(item, `${path}.offer.featuredItems[${index}]`),
      ),
      services: expectArray(offer.services ?? [], `${path}.offer.services`).map((item, index) =>
        parseServiceItem(item, `${path}.offer.services[${index}]`),
      ),
    },
    trust: {
      rating: (() => {
        if (trust.rating === null || trust.rating === undefined) return null;

        const rating = expectRecord(trust.rating, `${path}.trust.rating`);

        return {
          value: optionalNumber(rating.value, `${path}.trust.rating.value`),
          reviewCount: optionalNumber(rating.reviewCount, `${path}.trust.rating.reviewCount`),
          sourceLabel: optionalString(rating.sourceLabel),
        } satisfies RawRatingSnapshot;
      })(),
      reviewThemes: optionalStringArray(trust.reviewThemes, `${path}.trust.reviewThemes`),
      proofPoints: optionalStringArray(trust.proofPoints, `${path}.trust.proofPoints`),
      testimonials: expectArray(trust.testimonials ?? [], `${path}.trust.testimonials`).map((item, index) =>
        parseReviewItem(item, `${path}.trust.testimonials[${index}]`),
      ),
      credibilityRisks: optionalStringArray(trust.credibilityRisks, `${path}.trust.credibilityRisks`),
    },
    visual: {
      brandHints: optionalStringArray(visual.brandHints, `${path}.visual.brandHints`),
      brandColors: optionalStringArray(visual.brandColors, `${path}.visual.brandColors`),
      toneHints: optionalStringArray(visual.toneHints, `${path}.visual.toneHints`),
      visualMood: optionalString(visual.visualMood),
      desiredLuxuryLevel:
        visual.desiredLuxuryLevel === null || visual.desiredLuxuryLevel === undefined
          ? null
          : expectOneOf(visual.desiredLuxuryLevel, `${path}.visual.desiredLuxuryLevel`, desiredLuxuryLevels),
      visualIntensity:
        visual.visualIntensity === null || visual.visualIntensity === undefined
          ? null
          : expectOneOf(visual.visualIntensity, `${path}.visual.visualIntensity`, visualIntensities),
      photographyStyle: optionalString(visual.photographyStyle),
      preferredContrast:
        visual.preferredContrast === null || visual.preferredContrast === undefined
          ? null
          : expectOneOf(visual.preferredContrast, `${path}.visual.preferredContrast`, preferredContrasts),
      sectionDensityPreference:
        visual.sectionDensityPreference === null || visual.sectionDensityPreference === undefined
          ? null
          : expectOneOf(
              visual.sectionDensityPreference,
              `${path}.visual.sectionDensityPreference`,
              sectionDensityPreferences,
            ),
      materialNotes: optionalStringArray(visual.materialNotes, `${path}.visual.materialNotes`),
    },
    seo: {
      areaServed: optionalStringArray(seo.areaServed, `${path}.seo.areaServed`),
      geoPrecision:
        seo.geoPrecision === null || seo.geoPrecision === undefined
          ? undefined
          : expectOneOf(seo.geoPrecision, `${path}.seo.geoPrecision`, geoPrecisions),
      serviceType: optionalString(seo.serviceType),
      keywordHints: optionalStringArray(seo.keywordHints, `${path}.seo.keywordHints`),
      titleHint: optionalString(seo.titleHint),
      descriptionHint: optionalString(seo.descriptionHint),
    },
    assets: {
      assetIds: optionalStringArray(assets.assetIds, `${path}.assets.assetIds`),
      sourceFolder: optionalString(assets.sourceFolder),
      notes: optionalStringArray(assets.notes, `${path}.assets.notes`),
    },
    notes: optionalStringArray(record.notes, `${path}.notes`),
    fieldStatus: Object.fromEntries(
      Object.entries(fieldStatusRecord).map(([key, item]) => [key, parseFieldStateEntry(item, `${path}.fieldStatus.${key}`)]),
    ),
  };
}

function parseBusinessBriefFile(value: unknown, path: string): BusinessBriefFile {
  const meta = parseFileBase(value, 'business-brief', path);
  const record = expectRecord(value, path);
  const identity = expectRecord(record.identity, `${path}.identity`);
  const location = expectRecord(record.location, `${path}.location`);
  const contact = expectRecord(record.contact, `${path}.contact`);
  const offer = expectRecord(record.offer, `${path}.offer`);
  const trust = expectRecord(record.trust, `${path}.trust`);
  const brand = expectRecord(record.brand, `${path}.brand`);
  const seo = expectRecord(record.seo, `${path}.seo`);

  return {
    ...meta,
    fileKind: 'business-brief',
    identity: {
      businessName: expectString(identity.businessName, `${path}.identity.businessName`),
      slug: expectString(identity.slug, `${path}.identity.slug`),
      niche: expectOneOf(identity.niche, `${path}.identity.niche`, businessNiches),
      isMockSample: expectBoolean(identity.isMockSample, `${path}.identity.isMockSample`),
      sampleLabel: expectString(identity.sampleLabel, `${path}.identity.sampleLabel`),
      primaryCategory: optionalString(identity.primaryCategory),
      secondaryCategories: optionalStringArray(identity.secondaryCategories, `${path}.identity.secondaryCategories`),
    },
    location: {
      city: expectString(location.city, `${path}.location.city`),
      country: expectString(location.country, `${path}.location.country`),
      district: optionalString(location.district),
      addressLine: optionalString(location.addressLine),
      coordinates: parseCoordinates(location.coordinates, `${path}.location.coordinates`),
      openingHours: expectArray(location.openingHours ?? [], `${path}.location.openingHours`).map((item, index) =>
        parseOpeningHoursItem(item, `${path}.location.openingHours[${index}]`),
      ),
    },
    contact: {
      phone: optionalString(contact.phone),
      whatsapp: optionalString(contact.whatsapp),
      email: optionalString(contact.email),
      website: optionalString(contact.website),
      orderUrl: optionalString(contact.orderUrl),
      menuUrl: optionalString(contact.menuUrl),
      mapsUrl: optionalString(contact.mapsUrl),
      socialLinks: optionalStringArray(contact.socialLinks, `${path}.contact.socialLinks`),
      externalPlatforms: expectArray(contact.externalPlatforms ?? [], `${path}.contact.externalPlatforms`).map((item, index) =>
        parseExternalPlatformLink(item, `${path}.contact.externalPlatforms[${index}]`),
      ),
    },
    offer: {
      serviceModes: optionalStringArray(offer.serviceModes, `${path}.offer.serviceModes`),
      featuredItems: expectArray(offer.featuredItems ?? [], `${path}.offer.featuredItems`).map((item, index) =>
        parseRawFeaturedItem(item, `${path}.offer.featuredItems[${index}]`),
      ),
      services: expectArray(offer.services ?? [], `${path}.offer.services`).map((item, index) =>
        parseServiceItem(item, `${path}.offer.services[${index}]`),
      ),
      faqItems: expectArray(offer.faqItems ?? [], `${path}.offer.faqItems`).map((item, index) =>
        parseFaqItem(item, `${path}.offer.faqItems[${index}]`),
      ),
    },
    trust: {
      ratingValue: optionalNumber(trust.ratingValue, `${path}.trust.ratingValue`),
      reviewCount: optionalNumber(trust.reviewCount, `${path}.trust.reviewCount`),
      reviewHighlights: optionalStringArray(trust.reviewHighlights, `${path}.trust.reviewHighlights`),
      proofPoints: optionalStringArray(trust.proofPoints, `${path}.trust.proofPoints`),
      testimonials: expectArray(trust.testimonials ?? [], `${path}.trust.testimonials`).map((item, index) =>
        parseReviewItem(item, `${path}.trust.testimonials[${index}]`),
      ),
      credibilityRisks: optionalStringArray(trust.credibilityRisks, `${path}.trust.credibilityRisks`),
    },
    brand: {
      tagline: expectString(brand.tagline, `${path}.brand.tagline`),
      shortDescription: expectString(brand.shortDescription, `${path}.brand.shortDescription`),
      heroSignature: expectString(brand.heroSignature, `${path}.brand.heroSignature`),
      brandHints: optionalStringArray(brand.brandHints, `${path}.brand.brandHints`),
      brandColors: optionalStringArray(brand.brandColors, `${path}.brand.brandColors`),
      toneHints: optionalStringArray(brand.toneHints, `${path}.brand.toneHints`),
      visualMood: expectString(brand.visualMood, `${path}.brand.visualMood`),
      desiredLuxuryLevel:
        brand.desiredLuxuryLevel === null || brand.desiredLuxuryLevel === undefined
          ? null
          : expectOneOf(brand.desiredLuxuryLevel, `${path}.brand.desiredLuxuryLevel`, desiredLuxuryLevels),
      visualIntensity:
        brand.visualIntensity === null || brand.visualIntensity === undefined
          ? null
          : expectOneOf(brand.visualIntensity, `${path}.brand.visualIntensity`, visualIntensities),
      photographyStyle: expectString(brand.photographyStyle, `${path}.brand.photographyStyle`),
      atmosphereKeywords: optionalStringArray(brand.atmosphereKeywords, `${path}.brand.atmosphereKeywords`),
      preferredContrast:
        brand.preferredContrast === null || brand.preferredContrast === undefined
          ? null
          : expectOneOf(brand.preferredContrast, `${path}.brand.preferredContrast`, preferredContrasts),
      sectionDensityPreference:
        brand.sectionDensityPreference === null || brand.sectionDensityPreference === undefined
          ? null
          : expectOneOf(
              brand.sectionDensityPreference,
              `${path}.brand.sectionDensityPreference`,
              sectionDensityPreferences,
            ),
      materialFinish: expectString(brand.materialFinish, `${path}.brand.materialFinish`),
      imageTreatment: expectString(brand.imageTreatment, `${path}.brand.imageTreatment`),
    },
    seo: {
      title: expectString(seo.title, `${path}.seo.title`),
      description: expectString(seo.description, `${path}.seo.description`),
      areaServed: optionalStringArray(seo.areaServed, `${path}.seo.areaServed`),
      geoPrecision:
        seo.geoPrecision === null || seo.geoPrecision === undefined
          ? undefined
          : expectOneOf(seo.geoPrecision, `${path}.seo.geoPrecision`, geoPrecisions),
      serviceType: optionalString(seo.serviceType),
      priceRange: optionalString(seo.priceRange),
      keywordHints: optionalStringArray(seo.keywordHints, `${path}.seo.keywordHints`),
    },
  };
}

function parseMissingDataFile(value: unknown, path: string): MissingDataFile {
  const meta = parseFileBase(value, 'missing-data', path);
  const record = expectRecord(value, path);
  const summary = expectRecord(record.summary, `${path}.summary`);

  return {
    ...meta,
    fileKind: 'missing-data',
    summary: {
      verified: optionalNumber(summary.verified, `${path}.summary.verified`) ?? 0,
      inferred: optionalNumber(summary.inferred, `${path}.summary.inferred`) ?? 0,
      missing: optionalNumber(summary.missing, `${path}.summary.missing`) ?? 0,
      conflict: optionalNumber(summary.conflict, `${path}.summary.conflict`) ?? 0,
      pending: optionalNumber(summary.pending, `${path}.summary.pending`) ?? 0,
    },
    items: expectArray(record.items, `${path}.items`).map((item, index) =>
      parseMissingDataItem(item, `${path}.items[${index}]`),
    ),
  };
}

function parseContentPlanFile(value: unknown, path: string): ContentPlanFile {
  const meta = parseFileBase(value, 'content-plan', path);
  const record = expectRecord(value, path);
  const messaging = expectRecord(record.messaging, `${path}.messaging`);

  return {
    ...meta,
    fileKind: 'content-plan',
    primaryGoal: expectOneOf(record.primaryGoal, `${path}.primaryGoal`, conversionGoals),
    conversionFocus: expectString(record.conversionFocus, `${path}.conversionFocus`),
    tone: optionalStringArray(record.tone, `${path}.tone`),
    primaryCta: parsePlannedCta(record.primaryCta, `${path}.primaryCta`),
    secondaryCtas: expectArray(record.secondaryCtas ?? [], `${path}.secondaryCtas`).map((item, index) =>
      parsePlannedCta(item, `${path}.secondaryCtas[${index}]`),
    ),
    fallbackRules: expectArray(record.fallbackRules ?? [], `${path}.fallbackRules`).map((item, index) =>
      parseFallbackRule(item, `${path}.fallbackRules[${index}]`),
    ),
    recommendedSections: expectArray(record.recommendedSections ?? [], `${path}.recommendedSections`).map((item, index) =>
      parsePlannedSection(item, `${path}.recommendedSections[${index}]`),
    ),
    messaging: {
      heroFocus: expectString(messaging.heroFocus, `${path}.messaging.heroFocus`),
      offerFocus: expectString(messaging.offerFocus, `${path}.messaging.offerFocus`),
      trustFocus: expectString(messaging.trustFocus, `${path}.messaging.trustFocus`),
      galleryFocus: expectString(messaging.galleryFocus, `${path}.messaging.galleryFocus`),
      locationFocus: expectString(messaging.locationFocus, `${path}.messaging.locationFocus`),
    },
    contentPriorities: optionalStringArray(record.contentPriorities, `${path}.contentPriorities`),
  };
}

function parseImageMapFile(value: unknown, path: string): ImageMapFile {
  const meta = parseFileBase(value, 'image-map', path);
  const record = expectRecord(value, path);
  const summary = isRecord(record.summary) ? expectRecord(record.summary, `${path}.summary`) : null;
  const selection = isRecord(record.selection) ? expectRecord(record.selection, `${path}.selection`) : null;

  return {
    ...meta,
    fileKind: 'image-map',
    summary: summary
      ? {
          totalAssets: optionalNumber(summary.totalAssets, `${path}.summary.totalAssets`) ?? 0,
          selectedAssets: optionalNumber(summary.selectedAssets, `${path}.summary.selectedAssets`) ?? 0,
          reservedAssets: optionalNumber(summary.reservedAssets, `${path}.summary.reservedAssets`) ?? 0,
          discardedAssets: optionalNumber(summary.discardedAssets, `${path}.summary.discardedAssets`) ?? 0,
          duplicateAssets: optionalNumber(summary.duplicateAssets, `${path}.summary.duplicateAssets`) ?? 0,
          weakAssets: optionalNumber(summary.weakAssets, `${path}.summary.weakAssets`) ?? 0,
          heroCandidates: optionalNumber(summary.heroCandidates, `${path}.summary.heroCandidates`) ?? 0,
        }
      : undefined,
    selection: selection
      ? {
          heroMainAssetId: optionalString(selection.heroMainAssetId),
          heroAlternateAssetIds: optionalStringArray(selection.heroAlternateAssetIds, `${path}.selection.heroAlternateAssetIds`),
          dishAssetIds: optionalStringArray(selection.dishAssetIds, `${path}.selection.dishAssetIds`),
          galleryAssetIds: optionalStringArray(selection.galleryAssetIds, `${path}.selection.galleryAssetIds`),
          ambienceAssetIds: optionalStringArray(selection.ambienceAssetIds, `${path}.selection.ambienceAssetIds`),
          exteriorAssetIds: optionalStringArray(selection.exteriorAssetIds, `${path}.selection.exteriorAssetIds`),
          fallbackAssetId: optionalString(selection.fallbackAssetId),
        }
      : undefined,
    assets: expectArray(record.assets, `${path}.assets`).map((item, index) =>
      parseImageMapAsset(item, `${path}.assets[${index}]`),
    ),
    notes: optionalStringArray(record.notes, `${path}.notes`),
  };
}

function readJsonFile(fileUrl: URL): unknown {
  return JSON.parse(readFileSync(fileURLToPath(fileUrl), 'utf8'));
}

function buildCallHref(phone?: string | null) {
  if (!phone) return null;

  const numeric = phone.replace(/[^\d+]/g, '');
  return numeric ? `tel:${numeric}` : null;
}

function buildEmailHref(email?: string | null) {
  return email ? `mailto:${email}` : null;
}

function buildWhatsAppHref(whatsapp?: string | null) {
  if (!whatsapp) return null;
  if (whatsapp.startsWith('http://') || whatsapp.startsWith('https://')) return whatsapp;

  const numeric = whatsapp.replace(/[^\d]/g, '');
  return numeric ? `https://wa.me/${numeric}` : null;
}

export function resolveContentActionHref(record: BusinessMasterRecord, key: ConversionActionKey) {
  const { contact } = record.brief;

  switch (key) {
    case 'get-directions':
      return contact.mapsUrl ?? null;
    case 'order-online':
      return contact.orderUrl ?? null;
    case 'call':
      return buildCallHref(contact.phone);
    case 'view-menu':
      return contact.menuUrl ?? '#menu';
    case 'visit-website':
      return contact.website ?? null;
    case 'email':
      return buildEmailHref(contact.email);
    case 'whatsapp':
      return buildWhatsAppHref(contact.whatsapp);
    default:
      return null;
  }
}

export function getImageAssetLookup(record: BusinessMasterRecord) {
  return new Map(record.imageMap.assets.map((asset) => [asset.id, asset]));
}

export function validateBusinessMasterRecord(record: BusinessMasterRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const slugs = new Set([
    record.raw.businessSlug,
    record.raw.identity.slug,
    record.brief.businessSlug,
    record.brief.identity.slug,
    record.missingData.businessSlug,
    record.contentPlan.businessSlug,
    record.imageMap.businessSlug,
  ]);

  if (slugs.size !== 1) {
    issues.push({
      path: 'businessSlug',
      severity: 'error',
      message: 'All business files must share the same slug.',
    });
  }

  const assetIds = new Set<string>();
  for (const asset of record.imageMap.assets) {
    if (assetIds.has(asset.id)) {
      issues.push({
        path: `imageMap.assets.${asset.id}`,
        severity: 'error',
        message: `Duplicate asset id "${asset.id}".`,
      });
      continue;
    }

    assetIds.add(asset.id);
  }

  for (const assetId of record.raw.assets.assetIds ?? []) {
    if (!assetIds.has(assetId)) {
      issues.push({
        path: `raw.assets.assetIds.${assetId}`,
        severity: 'error',
        message: `Raw asset reference "${assetId}" does not exist in image-map.json.`,
      });
    }
  }

  const discardAssetIds = new Set(
    record.imageMap.assets.filter((asset) => asset.discard || asset.reviewStatus === 'discard').map((asset) => asset.id),
  );

  for (const item of record.brief.offer.featuredItems ?? []) {
    if (item.imageAssetId && !assetIds.has(item.imageAssetId)) {
      issues.push({
        path: `brief.offer.featuredItems.${item.title}`,
        severity: 'error',
        message: `Featured item "${item.title}" references unknown image asset "${item.imageAssetId}".`,
      });
    }

    if (item.imageAssetId && discardAssetIds.has(item.imageAssetId)) {
      issues.push({
        path: `brief.offer.featuredItems.${item.title}`,
        severity: 'warning',
        message: `Featured item "${item.title}" points to an asset marked for discard.`,
      });
    }
  }

  const plannedActions = [record.contentPlan.primaryCta, ...(record.contentPlan.secondaryCtas ?? [])];
  for (const action of plannedActions) {
    if (!resolveContentActionHref(record, action.key)) {
      issues.push({
        path: `contentPlan.cta.${action.key}`,
        severity: 'error',
        message: `CTA "${action.key}" does not resolve to a usable href from business-brief.json.`,
      });
    }
  }

  const summaryCounts = record.missingData.items.reduce(
    (summary, item) => {
      summary[item.state] += 1;
      return summary;
    },
    {
      inferred: 0,
      missing: 0,
      conflict: 0,
      pending: 0,
    },
  );

  if (summaryCounts.inferred !== record.missingData.summary.inferred) {
    issues.push({
      path: 'missingData.summary.inferred',
      severity: 'warning',
      message: 'The inferred count does not match the listed items.',
    });
  }

  if (summaryCounts.missing !== record.missingData.summary.missing) {
    issues.push({
      path: 'missingData.summary.missing',
      severity: 'warning',
      message: 'The missing count does not match the listed items.',
    });
  }

  if (summaryCounts.conflict !== record.missingData.summary.conflict) {
    issues.push({
      path: 'missingData.summary.conflict',
      severity: 'warning',
      message: 'The conflict count does not match the listed items.',
    });
  }

  if (summaryCounts.pending !== record.missingData.summary.pending) {
    issues.push({
      path: 'missingData.summary.pending',
      severity: 'warning',
      message: 'The pending count does not match the listed items.',
    });
  }

  return issues;
}

export function assertValidBusinessMasterRecord(record: BusinessMasterRecord) {
  const issues = validateBusinessMasterRecord(record);
  const errors = issues.filter((issue) => issue.severity === 'error');

  if (errors.length === 0) {
    return record;
  }

  throw new Error(
    ['Business master record validation failed:', ...errors.map((issue) => `- ${issue.path}: ${issue.message}`)].join('\n'),
  );
}

export function createBusinessMasterRecord(files: {
  raw: unknown;
  brief: unknown;
  missingData: unknown;
  contentPlan: unknown;
  imageMap: unknown;
}): BusinessMasterRecord {
  const raw = parseBusinessRawFile(files.raw, FILE_NAMES.raw);
  const brief = parseBusinessBriefFile(files.brief, FILE_NAMES.brief);
  const missingData = parseMissingDataFile(files.missingData, FILE_NAMES.missingData);
  const contentPlan = parseContentPlanFile(files.contentPlan, FILE_NAMES.contentPlan);
  const imageMap = parseImageMapFile(files.imageMap, FILE_NAMES.imageMap);

  return assertValidBusinessMasterRecord({
    raw,
    brief,
    missingData,
    contentPlan,
    imageMap,
  });
}

export function loadBusinessMasterRecordSync(baseDirectoryUrl: URL): BusinessMasterRecord {
  return createBusinessMasterRecord({
    raw: readJsonFile(new URL(FILE_NAMES.raw, baseDirectoryUrl)),
    brief: readJsonFile(new URL(FILE_NAMES.brief, baseDirectoryUrl)),
    missingData: readJsonFile(new URL(FILE_NAMES.missingData, baseDirectoryUrl)),
    contentPlan: readJsonFile(new URL(FILE_NAMES.contentPlan, baseDirectoryUrl)),
    imageMap: readJsonFile(new URL(FILE_NAMES.imageMap, baseDirectoryUrl)),
  });
}

function toImageAsset(entry: ImageMapAsset): ImageAsset {
  return {
    id: entry.id,
    src: entry.publicPath,
    alt: entry.suggestedAlt,
    kind: entry.kind,
    ratio: entry.ratio,
    treatment: entry.treatment ?? null,
    width: entry.width ?? null,
    height: entry.height ?? null,
  };
}

function toFeaturedItem(
  entry: { title: string; summary: string; accent?: string | null; imageAssetId?: string | null },
  assetLookup: Map<string, ImageMapAsset>,
): FeaturedItem {
  const asset = entry.imageAssetId ? assetLookup.get(entry.imageAssetId) : null;

  return {
    title: entry.title,
    summary: entry.summary,
    accent: entry.accent ?? null,
    imageSrc: asset?.publicPath ?? null,
    imageAlt: asset?.suggestedAlt ?? entry.title,
    imageWidth: asset?.width ?? null,
    imageHeight: asset?.height ?? null,
  };
}

export function createBusinessBriefInputFromMasterRecord(record: BusinessMasterRecord): BusinessBriefInput {
  const assetLookup = getImageAssetLookup(record);
  const imageAssets = record.imageMap.assets
    .filter((asset) => !asset.discard && asset.reviewStatus !== 'discard')
    .map(toImageAsset);

  const missingDataFlags = record.missingData.items
    .filter((item) => item.state === 'missing' || item.state === 'pending' || item.state === 'conflict')
    .map((item) => item.path);

  return {
    slug: record.brief.identity.slug,
    isMockSample: record.brief.identity.isMockSample,
    sampleLabel: record.brief.identity.sampleLabel,
    businessName: record.brief.identity.businessName,
    niche: record.brief.identity.niche,
    primaryCategory: record.brief.identity.primaryCategory ?? null,
    tagline: record.brief.brand.tagline,
    shortDescription: record.brief.brand.shortDescription,
    city: record.brief.location.city,
    country: record.brief.location.country,
    address: record.brief.location.addressLine ?? null,
    phone: record.brief.contact.phone ?? null,
    email: record.brief.contact.email ?? null,
    website: record.brief.contact.website ?? null,
    orderUrl: record.brief.contact.orderUrl ?? null,
    menuUrl: record.brief.contact.menuUrl ?? null,
    openingHours: record.brief.location.openingHours ?? [],
    coordinates: record.brief.location.coordinates ?? null,
    socialLinks: record.brief.contact.socialLinks ?? [],
    featuredItems: (record.brief.offer.featuredItems ?? []).map((item) => toFeaturedItem(item, assetLookup)),
    services: record.brief.offer.services ?? [],
    faqItems: record.brief.offer.faqItems ?? [],
    realReviews: record.brief.trust.testimonials ?? [],
    ratingValue: record.brief.trust.ratingValue ?? null,
    reviewCount: record.brief.trust.reviewCount ?? null,
    reviewHighlights: record.brief.trust.reviewHighlights ?? [],
    serviceModes: record.brief.offer.serviceModes ?? [],
    imageAssets,
    brandHints: record.brief.brand.brandHints ?? [],
    brandColors: record.brief.brand.brandColors ?? [],
    toneHints: record.brief.brand.toneHints ?? [],
    visualMood: record.brief.brand.visualMood,
    seoTitle: record.brief.seo.title,
    seoDescription: record.brief.seo.description,
    localSeoData: {
      areaServed: record.brief.seo.areaServed ?? [],
      geoPrecision: record.brief.seo.geoPrecision,
      priceRange: record.brief.seo.priceRange ?? null,
      serviceType: record.brief.seo.serviceType ?? null,
    },
    missingDataFlags,
    desiredLuxuryLevel: record.brief.brand.desiredLuxuryLevel ?? undefined,
    visualIntensity: record.brief.brand.visualIntensity ?? undefined,
    photographyStyle: record.brief.brand.photographyStyle,
    atmosphereKeywords: record.brief.brand.atmosphereKeywords ?? [],
    preferredContrast: record.brief.brand.preferredContrast ?? undefined,
    sectionDensityPreference: record.brief.brand.sectionDensityPreference ?? undefined,
    proofPoints: record.brief.trust.proofPoints ?? [],
    heroSignature: record.brief.brand.heroSignature,
    materialFinish: record.brief.brand.materialFinish,
    imageTreatment: record.brief.brand.imageTreatment,
  };
}
