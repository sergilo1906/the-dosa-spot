import type {
  CtaVariant,
  DesiredLuxuryLevel,
  GalleryVariant,
  HeroVariant,
  PreferredContrast,
  SectionDensityPreference,
  ServicesVariant,
  VisualIntensity,
} from './business';
import type {
  SectorConfidence,
  SectorGallerySystem,
  SectorToneRule,
  SectorTrustSystem,
  SectorType,
} from './sector-engine';

export type VisualFamilyId =
  | 'food-warm-editorial'
  | 'local-service-premium'
  | 'retail-clean-modern'
  | 'clinic-calm-trust'
  | 'dark-boutique-luxury'
  | 'neutral-reusable';

export type VisualConfidence = 'high' | 'medium' | 'low';
export type VisualColorTemperature = 'warm' | 'cool' | 'neutral';
export type VisualImageAbundance = 'high' | 'medium' | 'low';
export type VisualHeroDirection =
  | 'food-first'
  | 'service-first'
  | 'trust-first'
  | 'product-first'
  | 'transformation-first'
  | 'local-presence-first'
  | 'editorial-first';
export type VisualButtonStyle = 'accent-solid' | 'dark-solid' | 'calm-solid' | 'clean-outline' | 'ghost-outline';
export type VisualCardStyle =
  | 'luxe-panel'
  | 'editorial-frame'
  | 'clean-elevated'
  | 'trust-panel'
  | 'minimal-border';
export type VisualGalleryLayout =
  | 'carousel-warm'
  | 'frames-mosaic'
  | 'structured-grid'
  | 'poster-strip'
  | 'proof-strip';
export type VisualTrustStyle =
  | 'rating-panel'
  | 'review-columns'
  | 'credential-stack'
  | 'reassurance-cards'
  | 'contact-trust-panel';
export type VisualMotionStyle = 'cinematic-float' | 'gentle-rise' | 'clean-slide' | 'minimal';

export interface VisualPaletteTokens {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceSoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  borderSoft: string;
  borderStrong: string;
  overlayStrong: string;
  overlaySoft: string;
  ctaPrimaryBackground: string;
  ctaPrimaryText: string;
  ctaSecondaryBorder: string;
  ctaSecondaryText: string;
  chipBackground: string;
  chipText: string;
}

export interface VisualTypographyTokens {
  displayFamily: string;
  bodyFamily: string;
  combination: 'serif-sans' | 'sans-sans' | 'serif-led';
  displayTone: string;
  h1Weight: number;
  h2Weight: number;
  h3Weight: number;
  bodyWeight: number;
  maxHeroLineLength: string;
  bodyMeasure: string;
}

export interface VisualSpacingTokens {
  density: 'airy' | 'balanced' | 'dense';
  sectionGap: string;
  contentGap: string;
  cardGap: string;
  heroGap: string;
  containerWidth: string;
}

export interface VisualHeroSystem {
  recommendedHeroType: VisualHeroDirection;
  layoutMood: string;
  mediaBalance: string;
  overlayTreatment: string;
  headlineApproach: string;
  currentHeroVariant: HeroVariant;
}

export interface VisualCtaSystem {
  primaryStyle: VisualButtonStyle;
  secondaryStyle: VisualButtonStyle;
  weightBalance: 'clear-primary' | 'balanced' | 'subtle-secondary';
  buttonShape: 'pill' | 'rounded-rect';
  maxVisibleActions: number;
}

export interface VisualCardSystem {
  featuredItemStyle: VisualCardStyle;
  serviceCardStyle: VisualCardStyle;
  trustCardStyle: VisualCardStyle;
  infoCardStyle: VisualCardStyle;
  highlightCardStyle: VisualCardStyle;
  currentServicesVariant: ServicesVariant;
}

export interface VisualGallerySystem {
  recommendedGallerySystems: SectorGallerySystem[];
  layout: VisualGalleryLayout;
  cropBias: 'portrait-first' | 'mixed' | 'landscape-first';
  maxImages: number;
  currentGalleryVariant: GalleryVariant;
}

export interface VisualTrustSystem {
  recommendedTrustSystems: SectorTrustSystem[];
  style: VisualTrustStyle;
  emphasis: string;
  contactCardTone: string;
}

export interface VisualMotionHints {
  entranceStyle: VisualMotionStyle;
  hoverStyle: VisualMotionStyle;
  ambientStyle: VisualMotionStyle;
  motionIntensity: 'low' | 'medium' | 'high';
}

export interface VisualDegradationRule {
  id: string;
  whenMissingPaths?: string[];
  whenMissingSignals?: string[];
  whenLowImageCount?: number;
  whenNoBrandColors?: boolean;
  whenIncompleteBrief?: boolean;
  guidance: string;
  adjustments: string[];
}

export interface VisualFamilyDefinition {
  familyId: VisualFamilyId;
  label: string;
  description: string;
  personality: string;
  suitedSectors: SectorType[];
  bestFor: string[];
  avoidWhen: string[];
  toneAffinities: SectorToneRule[];
  luxuryAffinities: DesiredLuxuryLevel[];
  preferredColorTemperature: VisualColorTemperature[];
  preferredImageAbundance: VisualImageAbundance[];
  palette: VisualPaletteTokens;
  typography: VisualTypographyTokens;
  spacing: VisualSpacingTokens;
  hero: VisualHeroSystem;
  cta: VisualCtaSystem;
  cards: VisualCardSystem;
  gallery: VisualGallerySystem;
  trust: VisualTrustSystem;
  motion: VisualMotionHints;
  degradationRules: VisualDegradationRule[];
  currentCtaVariant: CtaVariant;
}

export interface VisualCandidateScore {
  familyId: VisualFamilyId;
  score: number;
  matchedSignals: string[];
  concerns: string[];
}

export interface AppliedVisualFallback {
  ruleId: string;
  triggeredBy: string[];
  guidance: string;
  adjustments: string[];
}

export interface VisualProfileFile {
  schemaVersion: number;
  fileKind: 'visual-profile';
  businessSlug: string;
  updatedAt: string;
  visualFamily: VisualFamilyId;
  visualConfidence: VisualConfidence;
  visualScore: number;
  fallbackUsed: boolean;
  reasoning: string[];
  candidateScores: VisualCandidateScore[];
  signals: {
    sectorType: SectorType;
    sectorConfidence: SectorConfidence;
    toneHints: string[];
    sectorTone: SectorToneRule[];
    desiredLuxuryLevel?: DesiredLuxuryLevel | null;
    visualIntensity?: VisualIntensity | null;
    preferredContrast?: PreferredContrast | null;
    sectionDensityPreference?: SectionDensityPreference | null;
    brandColorTemperature: VisualColorTemperature;
    brandColorCount: number;
    approvedImageCount: number;
    strongImageCount: number;
    imageAbundance: VisualImageAbundance;
    imageSignals: string[];
    trustSignals: string[];
    missingPaths: string[];
  };
  family: VisualFamilyDefinition;
  appliedFallbacks: AppliedVisualFallback[];
}
