import type { ConversionActionKey } from './business-record';
import type { SectorToneRule, SectorType, SectorTrustSystem } from './sector-engine';
import type { VisualConfidence, VisualFamilyId } from './visual-engine';

export type CopyToneId =
  | 'warm-food-led'
  | 'premium-casual'
  | 'local-trust'
  | 'modern-clean'
  | 'calm-clinical'
  | 'boutique-service'
  | 'direct-conversion';

export type CopyBlockId =
  | 'hero-title'
  | 'hero-subheadline'
  | 'hero-support'
  | 'cta-primary'
  | 'cta-secondary'
  | 'highlights'
  | 'trust-summary'
  | 'review-signals'
  | 'gallery-support'
  | 'location-contact'
  | 'faq'
  | 'final-cta'
  | 'footer';

export type CopySeverity = 'error' | 'warning' | 'hint';

export interface CopyLengthRule {
  maxWords?: number;
  maxChars?: number;
  maxSentences?: number;
  maxItems?: number;
}

export interface CopyBlockRule {
  blockId: CopyBlockId;
  purpose: string;
  audienceIntent: string;
  tone: CopyToneId[];
  structure: string[];
  requiredSignals?: string[];
  preferredInputs: string[];
  allowedProofTypes: Array<'facts' | 'ratings' | 'review-themes' | 'testimonials' | 'location' | 'offer' | 'visual-cues'>;
  avoid: string[];
  forbiddenClaims: string[];
  length: CopyLengthRule;
  degradationGuidance: string[];
}

export interface CopyDegradationRule {
  id: string;
  whenMissingPaths?: string[];
  whenMissingSignals?: string[];
  guidance: string;
  affectedBlocks: CopyBlockId[];
  adjustments: string[];
}

export interface CopyValidationRule {
  id: string;
  description: string;
  appliesTo: CopyBlockId[];
  severity: CopySeverity;
}

export interface CopySectorRuleSet {
  sectorType: SectorType;
  label: string;
  description: string;
  tonePriority: CopyToneId[];
  heroFocus: string;
  closingStyle: string;
  trustPriority: SectorTrustSystem[];
  allowedClaims: string[];
  forbiddenClaims: string[];
  blockRules: CopyBlockRule[];
  degradationRules: CopyDegradationRule[];
}

export interface CopyValidationIssue {
  severity: CopySeverity;
  blockId: CopyBlockId;
  message: string;
  sampleLabel?: string | null;
}

export interface CopySampleCheck {
  blockId: CopyBlockId;
  sampleLabel: string;
  text: string;
  wordCount: number;
  charCount: number;
  issues: CopyValidationIssue[];
}

export interface CopyProfileFile {
  schemaVersion: number;
  fileKind: 'copy-profile';
  businessSlug: string;
  updatedAt: string;
  recommendedTone: {
    primary: CopyToneId;
    support: CopyToneId[];
    reasoning: string[];
  };
  inputs: {
    sectorType: SectorType;
    visualFamily: VisualFamilyId;
    visualConfidence: VisualConfidence;
    sectorTone: SectorToneRule[];
    contentTone: string[];
    conversionGoal: string;
    availableCtas: ConversionActionKey[];
    missingPaths: string[];
    trustSystems: SectorTrustSystem[];
  };
  contentRules: {
    sectorLabel: string;
    summary: string;
    heroFocus: string;
    closingStyle: string;
    blockRules: CopyBlockRule[];
    forbiddenClaims: string[];
    allowedClaims: string[];
    contentOutlineBySector: Array<{
      blockId: CopyBlockId;
      priority: 'high' | 'medium' | 'low';
      reason: string;
    }>;
  };
  ctaRules: {
    primary: {
      actionKey: string;
      label: string;
      guidance: string[];
      maxChars: number;
    };
    secondary: Array<{
      actionKey: string;
      label: string;
      guidance: string[];
      maxChars: number;
    }>;
  };
  contentConstraints: {
    maxVisibleCtas: number;
    repetitionWindow: number;
    forbiddenClaims: string[];
    honestyRules: string[];
  };
  degradationCopyRules: Array<{
    ruleId: string;
    guidance: string;
    affectedBlocks: CopyBlockId[];
    adjustments: string[];
    triggeredBy: string[];
  }>;
  copyValidationRules: CopyValidationRule[];
  validation: {
    summary: {
      errors: number;
      warnings: number;
      hints: number;
    };
    issues: CopyValidationIssue[];
    checkedSamples: CopySampleCheck[];
    repeatedPhrases: string[];
  };
}
