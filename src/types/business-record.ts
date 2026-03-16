import type {
  BusinessNiche,
  Coordinates,
  DesiredLuxuryLevel,
  FaqItem,
  ImageKind,
  ImageRatio,
  OpeningHoursItem,
  PreferredContrast,
  ReviewItem,
  SectionDensityPreference,
  ServiceItem,
  VisualIntensity,
} from './business';

export type BusinessRecordFileKind =
  | 'business-raw'
  | 'business-brief'
  | 'missing-data'
  | 'content-plan'
  | 'image-map';

export type DataState = 'verified' | 'inferred' | 'missing' | 'conflict' | 'pending';
export type MissingDataSeverity = 'high' | 'medium' | 'low';
export type BusinessSourceType =
  | 'maps'
  | 'website'
  | 'html'
  | 'manual'
  | 'research'
  | 'image-folder'
  | 'social'
  | 'review-platform'
  | 'other';

export type ConversionActionKey =
  | 'get-directions'
  | 'order-online'
  | 'call'
  | 'view-menu'
  | 'visit-website'
  | 'email'
  | 'whatsapp';

export type ConversionGoal = 'visit' | 'call' | 'order' | 'book' | 'message' | 'browse-menu';

export type ContentSectionId =
  | 'hero'
  | 'popular-items'
  | 'services'
  | 'credibility'
  | 'about'
  | 'gallery'
  | 'faq'
  | 'cta'
  | 'footer';

export type ContentPriority = 'high' | 'medium' | 'low';

export type ImageMapRole =
  | 'hero'
  | 'gallery'
  | 'dish'
  | 'ambience'
  | 'exterior'
  | 'interior'
  | 'detail'
  | 'social'
  | 'fallback'
  | 'discard';

export type ImageMapQuality = 'strong' | 'usable' | 'weak' | 'discard';
export type ImageReviewStatus = 'approved' | 'backup' | 'discard';
export type ImageCropIntent = 'portrait' | 'landscape' | 'square' | 'social';

export interface BusinessRecordFileBase {
  schemaVersion: number;
  fileKind: BusinessRecordFileKind;
  businessSlug: string;
  updatedAt: string;
}

export interface BusinessSource {
  id: string;
  type: BusinessSourceType;
  label: string;
  filePath?: string | null;
  url?: string | null;
  notes?: string | null;
}

export interface FieldStateEntry {
  state: DataState;
  sourceIds?: string[];
  notes?: string | null;
}

export interface ExternalPlatformLink {
  label: string;
  url: string;
  kind?: string | null;
}

export interface RawOfferCategory {
  title: string;
  summary: string;
}

export interface RawFeaturedItem {
  title: string;
  summary: string;
  accent?: string | null;
  imageAssetId?: string | null;
}

export interface RawRatingSnapshot {
  value?: number | null;
  reviewCount?: number | null;
  sourceLabel?: string | null;
}

export interface BusinessRawFile extends BusinessRecordFileBase {
  fileKind: 'business-raw';
  sources: BusinessSource[];
  identity: {
    businessName: string;
    slug: string;
    niche: BusinessNiche;
    primaryCategory?: string | null;
    secondaryCategories?: string[];
    city: string;
    country: string;
    district?: string | null;
    addressLine?: string | null;
    plusCode?: string | null;
    coordinates?: Coordinates | null;
  };
  contact: {
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    website?: string | null;
    orderUrl?: string | null;
    menuUrl?: string | null;
    mapsUrl?: string | null;
    socialLinks?: string[];
    externalPlatforms?: ExternalPlatformLink[];
  };
  operations: {
    openingHours?: OpeningHoursItem[];
  };
  offer: {
    serviceModes?: string[];
    categories?: RawOfferCategory[];
    featuredItems?: RawFeaturedItem[];
    services?: ServiceItem[];
  };
  trust: {
    rating?: RawRatingSnapshot | null;
    reviewThemes?: string[];
    proofPoints?: string[];
    testimonials?: ReviewItem[];
    credibilityRisks?: string[];
  };
  visual: {
    brandHints?: string[];
    brandColors?: string[];
    toneHints?: string[];
    visualMood?: string | null;
    desiredLuxuryLevel?: DesiredLuxuryLevel | null;
    visualIntensity?: VisualIntensity | null;
    photographyStyle?: string | null;
    preferredContrast?: PreferredContrast | null;
    sectionDensityPreference?: SectionDensityPreference | null;
    materialNotes?: string[];
  };
  seo: {
    areaServed?: string[];
    geoPrecision?: 'exact' | 'district' | 'city';
    serviceType?: string | null;
    keywordHints?: string[];
    titleHint?: string | null;
    descriptionHint?: string | null;
  };
  assets: {
    assetIds?: string[];
    sourceFolder?: string | null;
    notes?: string[];
  };
  notes?: string[];
  fieldStatus?: Record<string, FieldStateEntry>;
}

export interface BriefFeaturedItem {
  title: string;
  summary: string;
  accent?: string | null;
  imageAssetId?: string | null;
}

export interface BusinessBriefFile extends BusinessRecordFileBase {
  fileKind: 'business-brief';
  identity: {
    businessName: string;
    slug: string;
    niche: BusinessNiche;
    isMockSample: boolean;
    sampleLabel: string;
    primaryCategory?: string | null;
    secondaryCategories?: string[];
  };
  location: {
    city: string;
    country: string;
    district?: string | null;
    addressLine?: string | null;
    coordinates?: Coordinates | null;
    openingHours?: OpeningHoursItem[];
  };
  contact: {
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    website?: string | null;
    orderUrl?: string | null;
    menuUrl?: string | null;
    mapsUrl?: string | null;
    socialLinks?: string[];
    externalPlatforms?: ExternalPlatformLink[];
  };
  offer: {
    serviceModes?: string[];
    featuredItems?: BriefFeaturedItem[];
    services?: ServiceItem[];
    faqItems?: FaqItem[];
  };
  trust: {
    ratingValue?: number | null;
    reviewCount?: number | null;
    reviewHighlights?: string[];
    proofPoints?: string[];
    testimonials?: ReviewItem[];
    credibilityRisks?: string[];
  };
  brand: {
    tagline: string;
    shortDescription: string;
    heroSignature: string;
    brandHints?: string[];
    brandColors?: string[];
    toneHints?: string[];
    visualMood: string;
    desiredLuxuryLevel?: DesiredLuxuryLevel | null;
    visualIntensity?: VisualIntensity | null;
    photographyStyle: string;
    atmosphereKeywords?: string[];
    preferredContrast?: PreferredContrast | null;
    sectionDensityPreference?: SectionDensityPreference | null;
    materialFinish: string;
    imageTreatment: string;
  };
  seo: {
    title: string;
    description: string;
    areaServed?: string[];
    geoPrecision?: 'exact' | 'district' | 'city';
    serviceType?: string | null;
    priceRange?: string | null;
    keywordHints?: string[];
  };
}

export interface MissingDataItem {
  path: string;
  state: Exclude<DataState, 'verified'>;
  severity: MissingDataSeverity;
  reason: string;
  impact?: string | null;
  recommendedAction?: string | null;
}

export interface MissingDataFile extends BusinessRecordFileBase {
  fileKind: 'missing-data';
  summary: {
    verified: number;
    inferred: number;
    missing: number;
    conflict: number;
    pending: number;
  };
  items: MissingDataItem[];
}

export interface PlannedCta {
  key: ConversionActionKey;
  label: string;
  reason: string;
}

export interface ContentFallbackRule {
  when: string;
  useActionKey: ConversionActionKey;
  reason: string;
}

export interface PlannedSection {
  id: ContentSectionId;
  enabled: boolean;
  priority: ContentPriority;
  reason: string;
}

export interface ContentPlanFile extends BusinessRecordFileBase {
  fileKind: 'content-plan';
  primaryGoal: ConversionGoal;
  conversionFocus: string;
  tone?: string[];
  primaryCta: PlannedCta;
  secondaryCtas?: PlannedCta[];
  fallbackRules?: ContentFallbackRule[];
  recommendedSections?: PlannedSection[];
  messaging: {
    heroFocus: string;
    offerFocus: string;
    trustFocus: string;
    galleryFocus: string;
    locationFocus: string;
  };
  contentPriorities?: string[];
}

export interface ImageMapAsset {
  id: string;
  publicPath: string;
  originalFilename?: string | null;
  kind: ImageKind;
  ratio: ImageRatio;
  roles?: ImageMapRole[];
  quality: ImageMapQuality;
  reviewStatus: ImageReviewStatus;
  heroCandidate?: boolean;
  discard?: boolean;
  subject: string;
  treatment?: string | null;
  suggestedAlt: string;
  desiredCrops?: ImageCropIntent[];
  width?: number | null;
  height?: number | null;
  notes?: string | null;
}

export interface ImageMapFile extends BusinessRecordFileBase {
  fileKind: 'image-map';
  summary?: {
    totalAssets: number;
    selectedAssets: number;
    reservedAssets: number;
    discardedAssets: number;
    duplicateAssets: number;
    weakAssets: number;
    heroCandidates: number;
  };
  selection?: {
    heroMainAssetId?: string | null;
    heroAlternateAssetIds: string[];
    dishAssetIds: string[];
    galleryAssetIds: string[];
    ambienceAssetIds: string[];
    exteriorAssetIds: string[];
    fallbackAssetId?: string | null;
  };
  assets: ImageMapAsset[];
  notes?: string[];
}

export interface BusinessMasterRecord {
  raw: BusinessRawFile;
  brief: BusinessBriefFile;
  missingData: MissingDataFile;
  contentPlan: ContentPlanFile;
  imageMap: ImageMapFile;
}

export interface ValidationIssue {
  path: string;
  severity: 'error' | 'warning';
  message: string;
}
