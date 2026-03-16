import path from 'node:path';
import type {
  BusinessSource,
  ContentSectionId,
  ConversionActionKey,
  ConversionGoal,
  DataState,
  FieldStateEntry,
  MissingDataItem,
  PlannedCta,
  PlannedSection,
  RawFeaturedItem,
  ValidationIssue,
} from '../../types/business-record';
import type {
  ServiceItem,
} from '../../types/business';
import type { BusinessNiche } from '../../types/business';
import type {
  LoadedBusinessInputContext,
  ManualBusinessProfile,
  MissingFieldDescriptor,
  NormalizationSourceId,
  ParsedMenuSummary,
  ReconciliationCandidate,
  ReconciledField,
  SourcePriorityRule,
} from '../../types/business-normalization';

interface ResolveFieldOptions<T> {
  path: string;
  candidates: ReconciliationCandidate<T>[];
  explicitState?: FieldStateEntry | null;
  emptyReason: string;
}

export const SOURCE_PRIORITY: SourcePriorityRule[] = [
  {
    id: 'manual-profile',
    label: 'Structured manual profile',
    weight: 100,
    description: 'Highest-priority manual source for confirmed facts and prepared content.',
  },
  {
    id: 'intake-seed',
    label: 'Intake seed',
    weight: 90,
    description: 'Business seed entered at package root with early confirmed fields and preferences.',
  },
  {
    id: 'maps-link-file',
    label: 'Maps link file',
    weight: 85,
    description: 'Direct maps link captured in the raw intake package.',
  },
  {
    id: 'support-review-summary',
    label: 'Review summary doc',
    weight: 70,
    description: 'Support document that preserves rating and recurring trust themes.',
  },
  {
    id: 'support-menu-summary',
    label: 'Menu summary doc',
    weight: 65,
    description: 'Support document that preserves offer categories and highlighted items.',
  },
  {
    id: 'input-manifest',
    label: 'Input manifest',
    weight: 60,
    description: 'Manifest metadata describing what files exist and what the package is missing.',
  },
  {
    id: 'intake-notes',
    label: 'Intake notes',
    weight: 45,
    description: 'Freeform notes used for caveats, CTA truthfulness, and data gaps.',
  },
  {
    id: 'image-map',
    label: 'Image map',
    weight: 35,
    description: 'Reference layer for available visual assets and current runtime roles.',
  },
  {
    id: 'inference',
    label: 'Inference',
    weight: 10,
    description: 'Lowest-priority derived fallback when the source set is incomplete.',
  },
];

export const REQUIRED_MISSING_FIELDS: MissingFieldDescriptor[] = [
  {
    path: 'contact.email',
    severity: 'medium',
    reason: 'No verified email address is stored in the current source set.',
    impact: 'Email-based support or footer contact cannot be exposed truthfully.',
    recommendedAction: 'Confirm an email address from a verified first-party source before publishing it.',
  },
  {
    path: 'contact.website',
    severity: 'high',
    reason: 'No verified first-party website URL is currently stored.',
    impact: 'Canonical identity and visit-website conversion remain unavailable.',
    recommendedAction: 'Capture the official website once it is verified.',
  },
  {
    path: 'contact.orderUrl',
    severity: 'high',
    reason: 'No verified order link is stored.',
    impact: 'Order-led conversion cannot be used as a truthful primary CTA.',
    recommendedAction: 'Add a real ordering URL only after it is confirmed.',
  },
  {
    path: 'contact.menuUrl',
    severity: 'medium',
    reason: 'No verified external menu URL is stored.',
    impact: 'Menu discovery depends on the landing page content only.',
    recommendedAction: 'Capture a reliable public menu URL if one exists.',
  },
  {
    path: 'contact.whatsapp',
    severity: 'low',
    reason: 'No WhatsApp route has been verified.',
    impact: 'Messaging CTA options stay limited.',
    recommendedAction: 'Only add WhatsApp if the business actively uses it for customer contact.',
  },
  {
    path: 'location.coordinates',
    severity: 'low',
    reason: 'Exact coordinates are not stored in the dataset.',
    impact: 'Schema and map integrations cannot publish precise geo coordinates.',
    recommendedAction: 'Capture latitude and longitude from a verified listing.',
  },
  {
    path: 'location.openingHours',
    severity: 'medium',
    reason: 'Opening hours are not stored in the dataset.',
    impact: 'Schema, footer, and contact sections cannot expose trading hours.',
    recommendedAction: 'Add verified opening hours when they are available.',
  },
  {
    path: 'identity.secondaryCategories',
    severity: 'low',
    reason: 'Secondary categories are currently shaped for reuse rather than copied from a canonical listing.',
    impact: 'Fine for internal modeling, but not ideal as a verified taxonomy source.',
    recommendedAction: 'Confirm or replace with categories from a trusted listing when available.',
  },
  {
    path: 'trust.testimonials',
    severity: 'low',
    reason: 'No curated direct testimonial quotes are stored yet.',
    impact: 'Trust can rely on rating and proof points, but not on quoted voices.',
    recommendedAction: 'Capture two or three short, verified quotes before using testimonial cards.',
  },
];

export const SEED_CONFIRMATION_ALIASES: Record<string, string> = {
  businessName: 'identity.businessName',
  slug: 'identity.slug',
  niche: 'identity.niche',
  primaryCategory: 'identity.primaryCategory',
  secondaryCategories: 'identity.secondaryCategories',
  city: 'location.city',
  country: 'location.country',
  address: 'location.addressLine',
  phone: 'contact.phone',
  mapsLink: 'contact.mapsUrl',
  ratingValue: 'trust.rating.value',
  reviewCount: 'trust.rating.reviewCount',
  serviceModes: 'offer.serviceModes',
};

const SOURCE_PRIORITY_MAP = new Map(SOURCE_PRIORITY.map((item) => [item.id, item]));

export const CTA_LABELS: Record<ConversionActionKey, string> = {
  'get-directions': 'Get Directions',
  'order-online': 'Order Online',
  call: 'Call',
  'view-menu': 'View Menu',
  'visit-website': 'Visit Website',
  email: 'Email',
  whatsapp: 'WhatsApp',
};

export function getSourceWeight(sourceId: NormalizationSourceId) {
  return SOURCE_PRIORITY_MAP.get(sourceId)?.weight ?? 0;
}

export function getSourceLabel(sourceId: NormalizationSourceId) {
  return SOURCE_PRIORITY_MAP.get(sourceId)?.label ?? sourceId;
}

export function makeCandidate<T>(
  sourceId: NormalizationSourceId,
  value: T | null | undefined,
  state?: Exclude<DataState, 'missing' | 'conflict'>,
  notes?: string | null,
): ReconciliationCandidate<T> {
  return {
    sourceId,
    sourceLabel: getSourceLabel(sourceId),
    weight: getSourceWeight(sourceId),
    value,
    state,
    notes: notes ?? null,
  };
}

export function fieldStateForCandidate(entry?: FieldStateEntry | null): Exclude<DataState, 'missing' | 'conflict'> | undefined {
  if (!entry) return undefined;
  if (entry.state === 'missing' || entry.state === 'conflict') return undefined;
  return entry.state;
}

export function getManualFieldState(profile: ManualBusinessProfile | null, pathKey: string) {
  return profile?.fieldStates?.[pathKey] ?? null;
}

export function seedConfirmsPath(
  confirmedData: string[] | undefined | null,
  pathKey: string,
) {
  const confirmed = new Set((confirmedData ?? []).map((item) => SEED_CONFIRMATION_ALIASES[item] ?? item));
  return confirmed.has(pathKey);
}

export function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
}

function normalizeComparableValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim().replace(/\s+/gu, ' ').toLowerCase();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeComparableValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, normalizeComparableValue((value as Record<string, unknown>)[key])]),
    );
  }

  return value;
}

function stableSerialize(value: unknown): string {
  return JSON.stringify(normalizeComparableValue(value));
}

export function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export function resolveField<T>({ path, candidates, explicitState, emptyReason }: ResolveFieldOptions<T>): ReconciledField<T> {
  const usableCandidates = candidates.filter((candidate) => hasMeaningfulValue(candidate.value));
  const sourceIds = uniqueStrings([
    ...usableCandidates.map((candidate) => candidate.sourceId),
    ...(explicitState?.sourceIds ?? []),
  ]);

  if (explicitState?.state === 'missing' && usableCandidates.length > 0) {
    return {
      path,
      state: 'conflict',
      value: null,
      chosenSourceId: null,
      sourceIds,
      reason: explicitState.notes ?? 'A source provided a value, but the manual profile still marks this field as missing.',
      notes: explicitState.notes ?? null,
      conflictingValues: usableCandidates.map((candidate) => ({
        sourceId: candidate.sourceId,
        value: candidate.value ?? null,
      })),
    };
  }

  if (usableCandidates.length === 0) {
    const state = explicitState?.state ?? 'missing';

    return {
      path,
      state,
      value: null,
      chosenSourceId: null,
      sourceIds: explicitState?.sourceIds ?? [],
      reason: explicitState?.notes ?? emptyReason,
      notes: explicitState?.notes ?? null,
    };
  }

  const sortedCandidates = [...usableCandidates].sort((left, right) => right.weight - left.weight);
  const topWeight = sortedCandidates[0]?.weight ?? 0;
  const topCandidates = sortedCandidates.filter((candidate) => candidate.weight === topWeight);
  const distinctTopCandidates = [...new Map(topCandidates.map((candidate) => [stableSerialize(candidate.value), candidate])).values()];

  if (explicitState?.state === 'conflict' || distinctTopCandidates.length > 1) {
    return {
      path,
      state: 'conflict',
      value: null,
      chosenSourceId: null,
      sourceIds,
      reason:
        explicitState?.notes ??
        'Two or more top-priority sources disagree, so this field should stay unresolved until reviewed.',
      notes: explicitState?.notes ?? null,
      conflictingValues: distinctTopCandidates.map((candidate) => ({
        sourceId: candidate.sourceId,
        value: candidate.value ?? null,
      })),
    };
  }

  const chosen = distinctTopCandidates[0]!;
  const state =
    explicitState?.state ??
    chosen.state ??
    (chosen.weight >= getSourceWeight('maps-link-file') ? 'verified' : chosen.weight >= 40 ? 'inferred' : 'pending');

  return {
    path,
    state,
    value: (chosen.value ?? null) as T | null,
    chosenSourceId: chosen.sourceId,
    sourceIds,
    reason:
      explicitState?.notes ??
      `Resolved from ${chosen.sourceLabel}${chosen.notes ? `: ${chosen.notes}` : '.'}`,
    notes: explicitState?.notes ?? chosen.notes ?? null,
  };
}

export function buildFallbackCategorySummary(title: string) {
  return `${title} are present in the current source set.`;
}

export function buildFallbackFeaturedSummary(title: string, accent: string | null | undefined) {
  return accent ? `${title}. ${accent} in the current source set.` : `${title} appears in the current source set.`;
}

export function buildFallbackServicesFromMenu(menuSummary: ParsedMenuSummary | null): ServiceItem[] {
  if (!menuSummary) return [];

  return menuSummary.categories.map((entry) => ({
    title: entry.categoryTitle,
    summary: buildFallbackCategorySummary(entry.categoryTitle),
    priceLabel: entry.featuredItemTitle ?? null,
    accent: entry.accent ?? null,
  }));
}

export function buildFallbackFeaturedItems(menuSummary: ParsedMenuSummary | null): RawFeaturedItem[] {
  if (!menuSummary) return [];

  return menuSummary.categories
    .filter((entry) => entry.featuredItemTitle)
    .map((entry) => ({
      title: entry.featuredItemTitle ?? entry.categoryTitle,
      summary: buildFallbackFeaturedSummary(entry.featuredItemTitle ?? entry.categoryTitle, entry.accent),
      accent: entry.accent ?? null,
      imageAssetId: null,
    }));
}

const SAMPLE_LABEL_BY_NICHE: Partial<Record<BusinessNiche, string>> = {
  barbershop: 'Barbershop brief',
  restaurant: 'Restaurant brief',
  'cafe-bakery-takeaway': 'Cafe or bakery brief',
  'personal-care': 'Personal care brief',
  'retail-shop': 'Retail brief',
  'fitness-wellness': 'Fitness or wellness brief',
  'clinic-health': 'Clinic or health brief',
  'local-service': 'Local service brief',
};

export function getSampleLabel(niche: string | null) {
  if (!niche) return 'Local business brief';

  return SAMPLE_LABEL_BY_NICHE[niche as BusinessNiche] ?? 'Local business brief';
}

export function buildDefaultTagline(businessName: string, primaryCategory: string | null, city: string) {
  if (primaryCategory) {
    return `${businessName} is a ${primaryCategory.toLowerCase()} in ${city}.`;
  }

  return `${businessName} in ${city}.`;
}

export function buildDefaultShortDescription(
  businessName: string,
  city: string,
  serviceModes: string[],
  primaryCategory: string | null,
) {
  const modeLabel = serviceModes.length > 0 ? serviceModes.join(', ').replace(/, ([^,]+)$/u, ', and $1') : 'local visits';
  if (primaryCategory) {
    return `${businessName} is a ${primaryCategory.toLowerCase()} in ${city} offering ${modeLabel}.`;
  }

  return `${businessName} serves ${city} with ${modeLabel}.`;
}

export function buildDefaultHeroSignature(primaryCategory: string | null, featuredItems: RawFeaturedItem[], city: string) {
  const featured = featuredItems[0]?.title;
  if (featured && primaryCategory) {
    return `${featured} leads the story, backed by ${primaryCategory.toLowerCase()} cues and clear ${city} location context.`;
  }

  if (featured) {
    return `${featured} leads the story, backed by clear local context in ${city}.`;
  }

  return `Lead with the clearest local reason to visit in ${city}.`;
}

export function buildDefaultSeoTitle(businessName: string, primaryCategory: string | null, city: string) {
  return primaryCategory ? `${businessName} | ${primaryCategory} in ${city}` : `${businessName} | ${city}`;
}

export function buildDefaultSeoDescription(
  businessName: string,
  primaryCategory: string | null,
  city: string,
  serviceModes: string[],
  featuredItems: RawFeaturedItem[],
) {
  const featured = featuredItems[0]?.title;
  const serviceModeLabel =
    serviceModes.length > 0 ? ` with ${serviceModes.join(', ').replace(/, ([^,]+)$/u, ', and $1')} options` : '';
  if (primaryCategory && featured) {
    return `${businessName} is a ${primaryCategory.toLowerCase()} in ${city}${serviceModeLabel}, known for ${featured}.`;
  }

  return `${businessName} serves ${city}${serviceModeLabel}.`;
}

export function buildProofPoints(ratingValue: number | null, reviewCount: number | null, reviewThemes: string[], serviceModes: string[]) {
  const proofPoints: string[] = [];

  if (ratingValue && reviewCount) {
    proofPoints.push(`${ratingValue} rating from ${reviewCount} reviews.`);
  }

  if (reviewThemes.length > 0) {
    proofPoints.push(`Known for ${reviewThemes.slice(0, 2).join(' and ').toLowerCase()}.`);
  }

  if (serviceModes.length > 0) {
    proofPoints.push(`${serviceModes.join(', ')} available.`);
  }

  return proofPoints;
}

export function buildBusinessSources(context: LoadedBusinessInputContext): BusinessSource[] {
  const sources: BusinessSource[] = [
    {
      id: 'intake-seed',
      type: 'manual',
      label: 'Business intake seed',
      url: context.seed?.mapsLink ?? null,
      notes: 'Base seed for slug, niche, early confirmed fields, and conversion direction.',
      filePath: `${context.rootPath}/intake.json`,
    },
    {
      id: 'input-manifest',
      type: 'other',
      label: 'Input manifest',
      notes: 'Inventory of raw files, missing source types, and intake validations.',
      filePath: `${context.normalizedPath}/input-manifest.json`,
    },
    {
      id: 'manual-profile',
      type: 'manual',
      label: 'Structured manual profile',
      notes: 'Highest-priority manual source for confirmed facts and prepared render content.',
      filePath: `${context.rootPath}/raw/notes/manual-profile.json`,
    },
    {
      id: 'maps-link-file',
      type: 'maps',
      label: 'Maps link file',
      url: context.mapsLink,
      notes: 'Direct maps URL captured in the intake package.',
      filePath: `${context.rootPath}/raw/maps/maps-link.txt`,
    },
    {
      id: 'support-menu-summary',
      type: 'research',
      label: 'Menu summary doc',
      notes: 'Support file preserving categories and highlighted menu items.',
      filePath: `${context.rootPath}/raw/docs/menu-summary.md`,
    },
    {
      id: 'support-review-summary',
      type: 'review-platform',
      label: 'Review summary doc',
      notes: 'Support file preserving rating snapshot and repeated trust themes.',
      filePath: `${context.rootPath}/raw/docs/reviews-selected.md`,
    },
    {
      id: 'intake-notes',
      type: 'manual',
      label: 'Intake notes',
      notes: 'Freeform notes describing CTA truthfulness and known gaps.',
      filePath: `${context.rootPath}/raw/notes/intake-notes.md`,
    },
    {
      id: 'image-map',
      type: 'image-folder',
      label: 'Runtime image map',
      notes: 'Reference for approved assets already used by the app.',
      filePath: `${context.normalizedPath}/image-map.json`,
    },
  ];

  return sources.filter((source) => {
    if (source.id === 'manual-profile') return Boolean(context.manualProfile);
    if (source.id === 'support-menu-summary') return Boolean(context.menuSummary);
    if (source.id === 'support-review-summary') return Boolean(context.reviewSummary);
    if (source.id === 'intake-notes') return context.intakeNotes.length > 0;
    if (source.id === 'maps-link-file') return Boolean(context.mapsLink);
    return true;
  });
}

export function actionKeyFromDesiredPrimaryCta(value: string | null | undefined): ConversionActionKey | null {
  switch (value) {
    case 'get-directions':
    case 'order-online':
    case 'call':
    case 'view-menu':
    case 'visit-website':
    case 'email':
    case 'whatsapp':
      return value;
    default:
      return null;
  }
}

export function actionGoalFromKey(key: ConversionActionKey): ConversionGoal {
  switch (key) {
    case 'get-directions':
      return 'visit';
    case 'order-online':
      return 'order';
    case 'call':
      return 'call';
    case 'email':
    case 'whatsapp':
      return 'message';
    case 'view-menu':
    case 'visit-website':
      return 'browse-menu';
    default:
      return 'visit';
  }
}

export function buildPlannedCta(key: ConversionActionKey, reason: string): PlannedCta {
  return {
    key,
    label: CTA_LABELS[key],
    reason,
  };
}

export function resolvePrimaryCta(availableActions: Set<ConversionActionKey>, desiredAction: ConversionActionKey | null): ConversionActionKey {
  if (desiredAction && availableActions.has(desiredAction)) {
    return desiredAction;
  }

  const fallbackOrder: ConversionActionKey[] = [
    'order-online',
    'get-directions',
    'call',
    'view-menu',
    'visit-website',
    'whatsapp',
    'email',
  ];

  return fallbackOrder.find((key) => availableActions.has(key)) ?? 'view-menu';
}

export function buildSectionPlan(id: ContentSectionId, enabled: boolean, priority: PlannedSection['priority'], reason: string): PlannedSection {
  return { id, enabled, priority, reason };
}

export function buildMissingDataItems(fields: ReconciledField[]): MissingDataItem[] {
  const fieldLookup = new Map(fields.map((field) => [field.path, field]));

  return REQUIRED_MISSING_FIELDS.flatMap((descriptor) => {
    const resolved = fieldLookup.get(descriptor.path);
    if (!resolved || resolved.state === 'verified') return [];

    return [
      {
        path: descriptor.path,
        state: resolved.state,
        severity: descriptor.severity,
        reason: descriptor.reason,
        impact: descriptor.impact ?? null,
        recommendedAction: descriptor.recommendedAction ?? null,
      } satisfies MissingDataItem,
    ];
  });
}

export function summarizeStates(fields: ReconciledField[]) {
  return fields.reduce(
    (summary, field) => {
      summary[field.state] += 1;
      return summary;
    },
    {
      verified: 0,
      inferred: 0,
      missing: 0,
      conflict: 0,
      pending: 0,
    },
  );
}

export function manifestWarningsAsValidationIssues(context: LoadedBusinessInputContext): ValidationIssue[] {
  return context.manifest.validations.map((item) => ({
    path: item.paths?.[0] ?? 'input-manifest',
    severity: item.level,
    message: item.message,
  }));
}

export function getImageSourceFolder(imageMap: { assets: Array<{ publicPath: string }> }) {
  const firstPublicPath = imageMap.assets[0]?.publicPath;
  if (!firstPublicPath) return null;

  const folder = path.posix.dirname(firstPublicPath);
  return folder.startsWith('/') ? `public${folder}` : `public/${folder}`;
}

export function pickFirstNonEmpty<T>(...values: Array<T | null | undefined>) {
  return values.find((value) => hasMeaningfulValue(value)) ?? null;
}
