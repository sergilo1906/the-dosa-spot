import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseInputManifest, getInputManifestErrorCount } from '../ingestion/manifest.ts';
import type {
  BusinessNiche,
  FaqItem,
  OpeningHoursItem,
  ReviewItem,
  ServiceItem,
} from '../../types/business';
import { BUSINESS_NICHES as SUPPORTED_BUSINESS_NICHES } from '../../types/business.ts';
import type { FieldStateEntry, ImageMapFile } from '../../types/business-record';
import type {
  LoadedBusinessInputContext,
  ManualBusinessProfile,
  ParsedMenuSummary,
  ParsedReviewSummary,
} from '../../types/business-normalization';

type UnknownRecord = Record<string, unknown>;

const SUPPORTED_NICHES = new Set<string>(SUPPORTED_BUSINESS_NICHES);
const DATA_STATES = new Set(['verified', 'inferred', 'missing', 'conflict', 'pending']);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readTextFileIfExists(filePath: string) {
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8');
}

function readJsonFileIfExists(filePath: string): unknown | null {
  const raw = readTextFileIfExists(filePath);
  return raw ? JSON.parse(raw) : null;
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function asStringArray(value: unknown): string[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error('Expected an array of strings.');
  }

  return value
    .map((item) => asTrimmedString(item))
    .filter((item): item is string => Boolean(item));
}

function asNullableNumber(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error('Expected a number.');
  }

  return value;
}

function asOpeningHours(value: unknown): OpeningHoursItem[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error('Expected openingHours to be an array.');

  return value.map((item) => {
    if (!isRecord(item)) throw new Error('Expected openingHours item to be an object.');

    return {
      label: asTrimmedString(item.label) ?? '',
      dayOfWeek: asStringArray(item.dayOfWeek),
      opens: asTrimmedString(item.opens) ?? undefined,
      closes: asTrimmedString(item.closes) ?? undefined,
    };
  });
}

function asServiceItems(value: unknown): ServiceItem[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error('Expected services to be an array.');

  return value.map((item) => {
    if (!isRecord(item)) throw new Error('Expected service item to be an object.');

    return {
      title: asTrimmedString(item.title) ?? '',
      summary: asTrimmedString(item.summary) ?? '',
      duration: asTrimmedString(item.duration) ?? null,
      priceLabel: asTrimmedString(item.priceLabel) ?? null,
      accent: asTrimmedString(item.accent) ?? null,
    };
  });
}

function asFaqItems(value: unknown): FaqItem[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error('Expected faqItems to be an array.');

  return value.map((item) => {
    if (!isRecord(item)) throw new Error('Expected FAQ item to be an object.');

    return {
      question: asTrimmedString(item.question) ?? '',
      answer: asTrimmedString(item.answer) ?? '',
    };
  });
}

function asReviewItems(value: unknown): ReviewItem[] | undefined {
  if (value === null || value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error('Expected testimonials to be an array.');

  return value.map((item) => {
    if (!isRecord(item)) throw new Error('Expected review item to be an object.');

    return {
      quote: asTrimmedString(item.quote) ?? '',
      reviewer: asTrimmedString(item.reviewer) ?? '',
      sourceLabel: asTrimmedString(item.sourceLabel) ?? null,
      datePublished: asTrimmedString(item.datePublished) ?? null,
    };
  });
}

function asCoordinates(value: unknown) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw new Error('Expected coordinates to be an object.');
  const lat = asNullableNumber(value.lat);
  const lng = asNullableNumber(value.lng);

  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return null;
  }

  return { lat, lng };
}

function asFieldStateMap(value: unknown): Record<string, FieldStateEntry> | undefined {
  if (value === null || value === undefined) return undefined;
  if (!isRecord(value)) throw new Error('Expected fieldStates to be an object.');

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (!isRecord(item)) throw new Error(`Expected fieldStates.${key} to be an object.`);
      const state = asTrimmedString(item.state);
      if (!state || !DATA_STATES.has(state)) {
        throw new Error(`Expected fieldStates.${key}.state to be a supported data state.`);
      }

      return [
        key,
        {
          state: state as FieldStateEntry['state'],
          sourceIds: asStringArray(item.sourceIds),
          notes: asTrimmedString(item.notes) ?? null,
        } satisfies FieldStateEntry,
      ];
    }),
  );
}

export function parseManualBusinessProfile(value: unknown): ManualBusinessProfile | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw new Error('manual-profile.json must be an object.');

  const identity = isRecord(value.identity) ? value.identity : {};
  const contact = isRecord(value.contact) ? value.contact : {};
  const operations = isRecord(value.operations) ? value.operations : {};
  const offer = isRecord(value.offer) ? value.offer : {};
  const trust = isRecord(value.trust) ? value.trust : {};
  const brand = isRecord(value.brand) ? value.brand : {};
  const seo = isRecord(value.seo) ? value.seo : {};

  const niche = asTrimmedString(identity.niche);
  if (niche && !SUPPORTED_NICHES.has(niche)) {
    throw new Error('manual-profile.json identity.niche must be a supported business niche.');
  }

  return {
    schemaVersion: typeof value.schemaVersion === 'number' ? value.schemaVersion : 1,
    businessSlug: asTrimmedString(value.businessSlug) ?? '',
    capturedAt: asTrimmedString(value.capturedAt) ?? '',
    identity: {
      businessName: asTrimmedString(identity.businessName),
      slug: asTrimmedString(identity.slug),
      niche: (niche as BusinessNiche | null) ?? null,
      primaryCategory: asTrimmedString(identity.primaryCategory),
      secondaryCategories: asStringArray(identity.secondaryCategories),
      city: asTrimmedString(identity.city),
      country: asTrimmedString(identity.country),
      district: asTrimmedString(identity.district),
      addressLine: asTrimmedString(identity.addressLine),
      plusCode: asTrimmedString(identity.plusCode),
      coordinates: asCoordinates(identity.coordinates),
    },
    contact: {
      phone: asTrimmedString(contact.phone),
      whatsapp: asTrimmedString(contact.whatsapp),
      email: asTrimmedString(contact.email),
      website: asTrimmedString(contact.website),
      orderUrl: asTrimmedString(contact.orderUrl),
      menuUrl: asTrimmedString(contact.menuUrl),
      mapsUrl: asTrimmedString(contact.mapsUrl),
      socialLinks: asStringArray(contact.socialLinks),
      externalPlatforms: Array.isArray(contact.externalPlatforms)
        ? contact.externalPlatforms.map((item) => {
            if (!isRecord(item)) throw new Error('Expected external platform item to be an object.');

            return {
              label: asTrimmedString(item.label) ?? '',
              url: asTrimmedString(item.url) ?? '',
              kind: asTrimmedString(item.kind) ?? null,
            };
          })
        : undefined,
    },
    operations: {
      openingHours: asOpeningHours(operations.openingHours),
    },
    offer: {
      serviceModes: asStringArray(offer.serviceModes),
      categories: Array.isArray(offer.categories)
        ? offer.categories.map((item) => {
            if (!isRecord(item)) throw new Error('Expected category item to be an object.');

            return {
              title: asTrimmedString(item.title) ?? '',
              summary: asTrimmedString(item.summary) ?? '',
            };
          })
        : undefined,
      featuredItems: Array.isArray(offer.featuredItems)
        ? offer.featuredItems.map((item) => {
            if (!isRecord(item)) throw new Error('Expected featured item to be an object.');

            return {
              title: asTrimmedString(item.title) ?? '',
              summary: asTrimmedString(item.summary) ?? '',
              accent: asTrimmedString(item.accent) ?? null,
              imageAssetId: asTrimmedString(item.imageAssetId) ?? null,
            };
          })
        : undefined,
      services: asServiceItems(offer.services),
      faqItems: asFaqItems(offer.faqItems),
    },
    trust: {
      ratingValue: asNullableNumber(trust.ratingValue),
      reviewCount: asNullableNumber(trust.reviewCount),
      reviewThemes: asStringArray(trust.reviewThemes),
      proofPoints: asStringArray(trust.proofPoints),
      testimonials: asReviewItems(trust.testimonials),
      credibilityRisks: asStringArray(trust.credibilityRisks),
    },
    brand: {
      tagline: asTrimmedString(brand.tagline),
      shortDescription: asTrimmedString(brand.shortDescription),
      heroSignature: asTrimmedString(brand.heroSignature),
      brandHints: asStringArray(brand.brandHints),
      brandColors: asStringArray(brand.brandColors),
      toneHints: asStringArray(brand.toneHints),
      visualMood: asTrimmedString(brand.visualMood),
      desiredLuxuryLevel: asTrimmedString(brand.desiredLuxuryLevel) as 'elevated' | 'high' | 'editorial' | null,
      visualIntensity: asTrimmedString(brand.visualIntensity) as 'restrained' | 'bold' | 'cinematic' | null,
      photographyStyle: asTrimmedString(brand.photographyStyle),
      atmosphereKeywords: asStringArray(brand.atmosphereKeywords),
      preferredContrast: asTrimmedString(brand.preferredContrast) as 'soft' | 'balanced' | 'high' | null,
      sectionDensityPreference: asTrimmedString(brand.sectionDensityPreference) as
        | 'airy'
        | 'balanced'
        | 'dense'
        | null,
      materialFinish: asTrimmedString(brand.materialFinish),
      imageTreatment: asTrimmedString(brand.imageTreatment),
    },
    seo: {
      title: asTrimmedString(seo.title),
      description: asTrimmedString(seo.description),
      areaServed: asStringArray(seo.areaServed),
      geoPrecision: (asTrimmedString(seo.geoPrecision) as 'exact' | 'district' | 'city' | null) ?? undefined,
      serviceType: asTrimmedString(seo.serviceType),
      priceRange: asTrimmedString(seo.priceRange),
      keywordHints: asStringArray(seo.keywordHints),
    },
    notes: asStringArray(value.notes),
    fieldStates: asFieldStateMap(value.fieldStates),
  };
}

function parseBulletLines(markdown: string | null): string[] {
  if (!markdown) return [];

  return markdown
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

export function parseMenuSummary(markdown: string | null): ParsedMenuSummary | null {
  if (!markdown) return null;

  const categories = parseBulletLines(markdown).reduce<ParsedMenuSummary['categories']>((accumulator, line) => {
    const match = line.match(/^`([^`]+)`\s*->\s*([^:]+):\s*(.+)$/u);
    if (!match) return accumulator;

    accumulator.push({
      categoryTitle: match[1]?.trim() ?? '',
      accent: match[2]?.trim() ?? null,
      featuredItemTitle: match[3]?.trim() ?? null,
    });
    return accumulator;
  }, []);

  return {
    categories,
    notes: parseBulletLines(markdown).filter((line) => !line.startsWith('`')),
  };
}

export function parseReviewSummary(markdown: string | null): ParsedReviewSummary | null {
  if (!markdown) return null;

  const ratingLine = markdown.match(/-\s*`([\d.]+)`/u);
  const countLine = markdown.match(/-\s*`([\d,]+)\s+reviews`/iu);
  const themes = parseBulletLines(markdown).filter((line) => !line.includes('`'));

  return {
    themes,
    ratingValue: ratingLine ? Number.parseFloat(ratingLine[1] ?? '') : null,
    reviewCount: countLine ? Number.parseInt((countLine[1] ?? '').replace(/,/gu, ''), 10) : null,
    notes: [],
  };
}

function loadImageMap(filePath: string): ImageMapFile {
  const value = readJsonFileIfExists(filePath);
  if (!value || !isRecord(value)) {
    throw new Error(`Missing or invalid image-map.json at ${filePath}.`);
  }

  return value as unknown as ImageMapFile;
}

export function loadBusinessInputContext(slug: string, projectRoot = process.cwd()): LoadedBusinessInputContext {
  const businessRoot = path.join(projectRoot, 'business-input', slug);
  const normalizedRoot = path.join(businessRoot, 'normalized');
  const manifestPath = path.join(normalizedRoot, 'input-manifest.json');
  const manifestValue = readJsonFileIfExists(manifestPath);

  if (!manifestValue) {
    throw new Error(`Missing input manifest for ${slug}. Run "npm run ingest:manifest -- ${slug}" first.`);
  }

  const manifest = parseInputManifest(manifestValue);
  if (getInputManifestErrorCount(manifest) > 0) {
    throw new Error(`Input manifest for ${slug} contains blocking errors. Fix intake issues before normalization.`);
  }

  const manualProfile = parseManualBusinessProfile(
    readJsonFileIfExists(path.join(businessRoot, 'raw', 'notes', 'manual-profile.json')),
  );
  const menuSummary = parseMenuSummary(readTextFileIfExists(path.join(businessRoot, 'raw', 'docs', 'menu-summary.md')));
  const reviewSummary = parseReviewSummary(
    readTextFileIfExists(path.join(businessRoot, 'raw', 'docs', 'reviews-selected.md')),
  );
  const intakeNotes = parseBulletLines(readTextFileIfExists(path.join(businessRoot, 'raw', 'notes', 'intake-notes.md')));
  const mapsLinkFile = readTextFileIfExists(path.join(businessRoot, 'raw', 'maps', 'maps-link.txt'));

  return {
    slug,
    rootPath: path.posix.join('business-input', slug),
    normalizedPath: path.posix.join('business-input', slug, 'normalized'),
    seed: manifest.seed,
    manifest,
    manualProfile,
    menuSummary,
    reviewSummary,
    intakeNotes,
    mapsLink: asTrimmedString(mapsLinkFile) ?? manifest.seed?.mapsLink ?? null,
    imageMap: loadImageMap(path.join(normalizedRoot, 'image-map.json')),
  };
}
