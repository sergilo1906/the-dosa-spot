import type {
  BusinessNiche,
  Coordinates,
  DesiredLuxuryLevel,
  FaqItem,
  OpeningHoursItem,
  PreferredContrast,
  ReviewItem,
  SectionDensityPreference,
  ServiceItem,
  VisualIntensity,
} from './business';
import type { BusinessInputSeed, InputManifest } from './business-input';
import type {
  BusinessBriefFile,
  BusinessRawFile,
  ContentPlanFile,
  DataState,
  FieldStateEntry,
  ImageMapFile,
  MissingDataFile,
  MissingDataSeverity,
  ValidationIssue,
} from './business-record';

export type NormalizationSourceId =
  | 'manual-profile'
  | 'intake-seed'
  | 'maps-link-file'
  | 'support-menu-summary'
  | 'support-review-summary'
  | 'intake-notes'
  | 'input-manifest'
  | 'image-map'
  | 'inference';

export interface SourcePriorityRule {
  id: NormalizationSourceId;
  label: string;
  weight: number;
  description: string;
}

export interface ManualBusinessProfile {
  schemaVersion: number;
  businessSlug: string;
  capturedAt: string;
  identity?: {
    businessName?: string | null;
    slug?: string | null;
    niche?: BusinessNiche | null;
    primaryCategory?: string | null;
    secondaryCategories?: string[];
    city?: string | null;
    country?: string | null;
    district?: string | null;
    addressLine?: string | null;
    plusCode?: string | null;
    coordinates?: Coordinates | null;
  };
  contact?: {
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    website?: string | null;
    orderUrl?: string | null;
    menuUrl?: string | null;
    mapsUrl?: string | null;
    socialLinks?: string[];
    externalPlatforms?: Array<{
      label: string;
      url: string;
      kind?: string | null;
    }>;
  };
  operations?: {
    openingHours?: OpeningHoursItem[];
  };
  offer?: {
    serviceModes?: string[];
    categories?: Array<{
      title: string;
      summary: string;
    }>;
    featuredItems?: Array<{
      title: string;
      summary: string;
      accent?: string | null;
      imageAssetId?: string | null;
    }>;
    services?: ServiceItem[];
    faqItems?: FaqItem[];
  };
  trust?: {
    ratingValue?: number | null;
    reviewCount?: number | null;
    reviewThemes?: string[];
    proofPoints?: string[];
    testimonials?: ReviewItem[];
    credibilityRisks?: string[];
  };
  brand?: {
    tagline?: string | null;
    shortDescription?: string | null;
    heroSignature?: string | null;
    brandHints?: string[];
    brandColors?: string[];
    toneHints?: string[];
    visualMood?: string | null;
    desiredLuxuryLevel?: DesiredLuxuryLevel | null;
    visualIntensity?: VisualIntensity | null;
    photographyStyle?: string | null;
    atmosphereKeywords?: string[];
    preferredContrast?: PreferredContrast | null;
    sectionDensityPreference?: SectionDensityPreference | null;
    materialFinish?: string | null;
    imageTreatment?: string | null;
  };
  seo?: {
    title?: string | null;
    description?: string | null;
    areaServed?: string[];
    geoPrecision?: 'exact' | 'district' | 'city';
    serviceType?: string | null;
    priceRange?: string | null;
    keywordHints?: string[];
  };
  notes?: string[];
  fieldStates?: Record<string, FieldStateEntry>;
}

export interface ParsedMenuSummaryEntry {
  categoryTitle: string;
  accent?: string | null;
  featuredItemTitle?: string | null;
}

export interface ParsedMenuSummary {
  categories: ParsedMenuSummaryEntry[];
  notes: string[];
}

export interface ParsedReviewSummary {
  themes: string[];
  ratingValue?: number | null;
  reviewCount?: number | null;
  notes: string[];
}

export interface LoadedBusinessInputContext {
  slug: string;
  rootPath: string;
  normalizedPath: string;
  seed: BusinessInputSeed | null;
  manifest: InputManifest;
  manualProfile: ManualBusinessProfile | null;
  menuSummary: ParsedMenuSummary | null;
  reviewSummary: ParsedReviewSummary | null;
  intakeNotes: string[];
  mapsLink: string | null;
  imageMap: ImageMapFile;
}

export interface ReconciliationCandidate<T = unknown> {
  sourceId: NormalizationSourceId;
  sourceLabel: string;
  weight: number;
  value: T | null | undefined;
  state?: Exclude<DataState, 'missing' | 'conflict'>;
  notes?: string | null;
}

export interface ReconciledField<T = unknown> {
  path: string;
  state: DataState;
  value: T | null;
  chosenSourceId?: NormalizationSourceId | null;
  sourceIds: string[];
  reason: string;
  notes?: string | null;
  conflictingValues?: Array<{
    sourceId: NormalizationSourceId;
    value: unknown;
  }>;
}

export interface MissingFieldDescriptor {
  path: string;
  severity: MissingDataSeverity;
  reason: string;
  impact?: string | null;
  recommendedAction?: string | null;
}

export interface ReconciliationReportFile {
  schemaVersion: number;
  fileKind: 'reconciliation-report';
  businessSlug: string;
  updatedAt: string;
  sourcePriority: SourcePriorityRule[];
  fields: ReconciledField[];
  summary: {
    verified: number;
    inferred: number;
    missing: number;
    conflict: number;
    pending: number;
  };
  validations: ValidationIssue[];
  notes?: string[];
}

export interface NormalizationResult {
  raw: BusinessRawFile;
  brief: BusinessBriefFile;
  missingData: MissingDataFile;
  contentPlan: ContentPlanFile;
  reconciliationReport: ReconciliationReportFile;
}
