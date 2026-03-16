import type { ImageAsset } from './business';
import type { ContentPriority, ContentSectionId, ConversionActionKey, ImageMapQuality } from './business-record';
import type { CopyToneId } from './copy-engine';
import type { SectorType } from './sector-engine';
import type { VisualFamilyId } from './visual-engine';

export type AssemblyFileKind = 'assembly-profile';
export type AssemblySectionMode = 'full' | 'compact' | 'hidden';
export type AssemblyActionAvailability = 'available' | 'fallback';
export type AssemblyActionSource = 'content-plan' | 'sector-profile' | 'fallback';
export type AssemblyActionPlacement = 'hero' | 'final-cta';
export type AssemblyDegradationSource = 'sector' | 'visual' | 'copy' | 'assembly';
export type AssemblyTrustMode = 'rating-and-themes' | 'proof-points' | 'testimonial-led';

export interface AssemblySectionDecision {
  id: ContentSectionId;
  anchor: string;
  show: boolean;
  mode: AssemblySectionMode;
  priority: ContentPriority;
  reason: string;
  triggeredBy: string[];
}

export interface AssemblyResolvedAction {
  key: string;
  renderActionKey?: ConversionActionKey | null;
  label: string;
  href: string;
  availability: AssemblyActionAvailability;
  source: AssemblyActionSource;
  reason: string;
}

export interface AssemblyActionPlacementMap {
  primary: AssemblyResolvedAction | null;
  secondary: AssemblyResolvedAction | null;
  hidden: AssemblyResolvedAction[];
  reason: string;
}

export interface AssemblyRenderImage extends ImageAsset {
  quality: ImageMapQuality;
  reason: string;
}

export interface AssemblyPopularCard {
  eyebrow: string;
  title: string;
  body: string;
  image: AssemblyRenderImage | null;
  reason: string;
}

export interface AssemblyTrustContent {
  mode: AssemblyTrustMode;
  title: string;
  body: string;
  ratingValue: string;
  ratingContext: string;
  signals: string[];
  visitDetails: string[];
}

export interface AssemblyGalleryContent {
  title: string;
  body: string;
  noteTitle: string;
  noteBody: string;
  mode: 'standard' | 'compact';
}

export interface AssemblyLocationContent {
  eyebrow: string;
  title: string;
  body: string;
  visitLabel: string;
  visitValue: string;
  supportLabel: string;
  supportValue: string;
  supportNote: string;
}

export interface AssemblyFooterLink {
  label: string;
  href: string;
  enabled: boolean;
  reason: string;
}

export interface AssemblyDegradation {
  id: string;
  source: AssemblyDegradationSource;
  triggeredBy: string[];
  guidance: string;
  adjustments: string[];
}

export interface AssemblyProfileFile {
  schemaVersion: number;
  fileKind: AssemblyFileKind;
  businessSlug: string;
  updatedAt: string;
  page: {
    defaultPresetSlug: string | null;
    routePolicy: {
      primaryPath: string;
      demoPathPrefix: string;
      indexablePresetSlugs: string[];
      noindexPresetSlugs: string[];
    };
  };
  context: {
    sectorType: SectorType;
    visualFamily: VisualFamilyId;
    recommendedTone: CopyToneId;
    conversionGoal: string;
  };
  visibility: {
    sections: AssemblySectionDecision[];
  };
  ctaMap: {
    availableActions: AssemblyResolvedAction[];
    hero: AssemblyActionPlacementMap;
    finalCta: AssemblyActionPlacementMap;
  };
  images: {
    heroMain: AssemblyRenderImage | null;
    heroSupport: AssemblyRenderImage | null;
    popularItems: AssemblyRenderImage[];
    gallery: AssemblyRenderImage[];
    fallback: AssemblyRenderImage | null;
  };
  content: {
    heroSupport: {
      eyebrow: string;
      title: string;
      body: string;
    };
    popularItems: {
      title: string;
      body: string;
      cards: AssemblyPopularCard[];
    };
    trust: AssemblyTrustContent;
    gallery: AssemblyGalleryContent;
    location: AssemblyLocationContent;
    footerSummary: string;
    footerProof: string[];
  };
  navigation: {
    footerLinks: AssemblyFooterLink[];
  };
  degradations: AssemblyDegradation[];
  diagnostics: {
    hiddenSections: string[];
    suppressedClaims: string[];
    ghostsAvoided: string[];
  };
}
