import type { BusinessNiche } from './business';
import type {
  ContentPriority,
  ConversionActionKey,
} from './business-record';

export type SectorType =
  | 'restaurant'
  | 'cafe-bakery-takeaway'
  | 'personal-care'
  | 'retail-shop'
  | 'fitness-wellness'
  | 'clinic-health'
  | 'local-service';

export type SectorConfidence = 'high' | 'medium' | 'low';

export type SectorActionKey =
  | ConversionActionKey
  | 'book-appointment'
  | 'browse-products'
  | 'request-consultation';

export type SectorSectionId =
  | 'hero'
  | 'signature-items'
  | 'menu-highlights'
  | 'services'
  | 'products'
  | 'results'
  | 'team'
  | 'trust'
  | 'reviews'
  | 'about'
  | 'gallery'
  | 'faq'
  | 'booking'
  | 'location-contact'
  | 'cta'
  | 'footer';

export type SectorHeroType =
  | 'food-first'
  | 'service-first'
  | 'trust-first'
  | 'product-first'
  | 'transformation-first'
  | 'local-presence-first';

export type SectorTrustSystem =
  | 'rating-reviews'
  | 'menu-signatures'
  | 'staff-credentials'
  | 'service-results'
  | 'product-quality'
  | 'local-trust'
  | 'certifications'
  | 'years-in-business';

export type SectorGallerySystem =
  | 'dishes'
  | 'ambience'
  | 'exterior'
  | 'team'
  | 'service-results'
  | 'products'
  | 'spaces';

export type SectorToneRule =
  | 'premium-casual'
  | 'local-trust'
  | 'clinical-clear'
  | 'modern-clean'
  | 'boutique'
  | 'warm'
  | 'direct'
  | 'friendly'
  | 'expert';

export type SectorCtaAvailability = 'available' | 'degraded' | 'unavailable';

export interface SectorSectionRecommendation {
  id: SectorSectionId;
  currentSystemSectionId?: string | null;
  priority: ContentPriority;
  reason: string;
}

export interface SectorSchemaHints {
  preferredSchemaTypes: string[];
  prioritySignals: string[];
  keywordPatterns: string[];
  doNotInvent: string[];
}

export interface SectorDegradationRule {
  id: string;
  whenMissingPaths?: string[];
  whenUnavailableActions?: SectorActionKey[];
  whenMissingSignals?: string[];
  guidance: string;
  suppress?: string[];
  fallbackActions?: SectorActionKey[];
}

export interface SectorRuleSet {
  sectorType: SectorType;
  label: string;
  description: string;
  nicheSignals?: BusinessNiche[];
  categoryKeywords: string[];
  serviceModeKeywords?: string[];
  offerKeywords?: string[];
  imageSignals?: string[];
  primaryCtaPriority: SectorActionKey[];
  secondaryCtaPriority: SectorActionKey[];
  conversionFocus: string;
  recommendedHeroType: SectorHeroType;
  recommendedSections: SectorSectionRecommendation[];
  recommendedTrustSystems: SectorTrustSystem[];
  recommendedGallerySystems: SectorGallerySystem[];
  recommendedTone: SectorToneRule[];
  degradationRules: SectorDegradationRule[];
  schemaHints: SectorSchemaHints;
}

export interface SectorCandidateScore {
  sectorType: SectorType;
  score: number;
  matchedSignals: string[];
  concerns: string[];
}

export interface SectorRecommendedCta {
  actionKey: SectorActionKey;
  renderActionKey?: ConversionActionKey | null;
  label: string;
  availability: SectorCtaAvailability;
  reason: string;
}

export interface AppliedDegradation {
  ruleId: string;
  triggeredBy: string[];
  guidance: string;
  fallbackActions: SectorActionKey[];
}

export interface SectorProfileFile {
  schemaVersion: number;
  fileKind: 'sector-profile';
  businessSlug: string;
  updatedAt: string;
  sectorType: SectorType;
  sectorConfidence: SectorConfidence;
  sectorScore: number;
  fallbackUsed: boolean;
  reasoning: string[];
  candidateScores: SectorCandidateScore[];
  signals: {
    niche?: string | null;
    primaryCategory?: string | null;
    secondaryCategories: string[];
    serviceModes: string[];
    offerSignals: string[];
    availableRenderActions: ConversionActionKey[];
    availableSectorActions: SectorActionKey[];
    imageSignals: string[];
    trustSignals: string[];
    missingPaths: string[];
  };
  rules: {
    label: string;
    description: string;
    conversionFocus: string;
    primaryCtaPriority: SectorActionKey[];
    secondaryCtaPriority: SectorActionKey[];
    recommendedHeroType: SectorHeroType;
    recommendedSections: SectorSectionRecommendation[];
    recommendedTrustSystems: SectorTrustSystem[];
    recommendedGallerySystems: SectorGallerySystem[];
    recommendedTone: SectorToneRule[];
    degradationRules: SectorDegradationRule[];
    schemaHints: SectorSchemaHints;
  };
  recommendedPrimaryCta: SectorRecommendedCta;
  recommendedSecondaryCtas: SectorRecommendedCta[];
  appliedDegradations: AppliedDegradation[];
}
