import type { BusinessMasterRecord, ValidationIssue } from '../../types/business-record';
import type { SectorProfileFile } from '../../types/sector-engine';
import type {
  AppliedVisualFallback,
  VisualCandidateScore,
  VisualColorTemperature,
  VisualConfidence,
  VisualFamilyDefinition,
  VisualFamilyId,
  VisualImageAbundance,
  VisualProfileFile,
} from '../../types/visual-engine';
import { VISUAL_FAMILIES, VISUAL_FAMILY_ORDER } from './families.ts';

interface VisualSignals {
  sectorType: SectorProfileFile['sectorType'];
  sectorConfidence: SectorProfileFile['sectorConfidence'];
  toneHints: string[];
  sectorTone: SectorProfileFile['rules']['recommendedTone'];
  desiredLuxuryLevel?: BusinessMasterRecord['brief']['brand']['desiredLuxuryLevel'];
  visualIntensity?: BusinessMasterRecord['brief']['brand']['visualIntensity'];
  preferredContrast?: BusinessMasterRecord['brief']['brand']['preferredContrast'];
  sectionDensityPreference?: BusinessMasterRecord['brief']['brand']['sectionDensityPreference'];
  brandColorTemperature: VisualColorTemperature;
  brandColorCount: number;
  approvedImageCount: number;
  strongImageCount: number;
  imageAbundance: VisualImageAbundance;
  imageSignals: string[];
  trustSignals: string[];
  missingPaths: string[];
  incompleteBrief: boolean;
}

function hexToRgb(hex: string) {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return null;

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHue({ r, g, b }: { r: number; g: number; b: number }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return null;

  let hue = 0;

  if (max === red) {
    hue = ((green - blue) / delta) % 6;
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  const degrees = hue * 60;
  return degrees < 0 ? degrees + 360 : degrees;
}

function classifyColorTemperature(colors: string[]): VisualColorTemperature {
  if (colors.length === 0) return 'neutral';

  let warm = 0;
  let cool = 0;
  let neutral = 0;

  for (const color of colors) {
    const rgb = hexToRgb(color);
    const hue = rgb ? rgbToHue(rgb) : null;

    if (hue === null) {
      neutral += 1;
      continue;
    }

    if (hue < 70 || hue >= 320) {
      warm += 1;
    } else if (hue >= 160 && hue < 280) {
      cool += 1;
    } else {
      neutral += 1;
    }
  }

  if (warm >= cool && warm >= neutral) return 'warm';
  if (cool >= warm && cool >= neutral) return 'cool';
  return 'neutral';
}

function getImageAbundance(approvedImageCount: number): VisualImageAbundance {
  if (approvedImageCount >= 6) return 'high';
  if (approvedImageCount >= 3) return 'medium';
  return 'low';
}

function buildSignals(record: BusinessMasterRecord, sectorProfile: SectorProfileFile): VisualSignals {
  const approvedAssets = record.imageMap.assets.filter((asset) => !asset.discard && asset.reviewStatus !== 'discard');
  const strongAssets = approvedAssets.filter((asset) => asset.quality === 'strong');
  const brandColors = record.brief.brand.brandColors ?? [];
  const missingPaths = record.missingData.items.map((item) => item.path);
  const toneHints = [
    ...(record.brief.brand.toneHints ?? []),
    ...sectorProfile.rules.recommendedTone,
  ];

  return {
    sectorType: sectorProfile.sectorType,
    sectorConfidence: sectorProfile.sectorConfidence,
    toneHints: [...new Set(toneHints.map((value) => value.trim()).filter(Boolean))],
    sectorTone: [...sectorProfile.rules.recommendedTone],
    desiredLuxuryLevel: record.brief.brand.desiredLuxuryLevel ?? undefined,
    visualIntensity: record.brief.brand.visualIntensity ?? undefined,
    preferredContrast: record.brief.brand.preferredContrast ?? undefined,
    sectionDensityPreference: record.brief.brand.sectionDensityPreference ?? undefined,
    brandColorTemperature: classifyColorTemperature(brandColors),
    brandColorCount: brandColors.length,
    approvedImageCount: approvedAssets.length,
    strongImageCount: strongAssets.length,
    imageAbundance: getImageAbundance(approvedAssets.length),
    imageSignals: [...sectorProfile.signals.imageSignals],
    trustSignals: [...sectorProfile.signals.trustSignals],
    missingPaths,
    incompleteBrief:
      sectorProfile.sectorConfidence === 'low' ||
      approvedAssets.length < 2 ||
      (brandColors.length === 0 && strongAssets.length < 2) ||
      !record.brief.brand.visualMood ||
      !record.brief.brand.photographyStyle,
  };
}

function scoreFamily(
  family: VisualFamilyDefinition,
  signals: VisualSignals,
  sectorProfile: SectorProfileFile,
): VisualCandidateScore {
  let score = family.familyId === 'neutral-reusable' ? 2 : 0;
  const matchedSignals: string[] = [];
  const concerns: string[] = [];

  if (family.suitedSectors.includes(signals.sectorType)) {
    score += 10;
    matchedSignals.push(`sector:${signals.sectorType}`);
  }

  const toneMatches = family.toneAffinities.filter((tone) => signals.sectorTone.includes(tone));
  if (toneMatches.length > 0) {
    score += toneMatches.length * 2;
    matchedSignals.push(...toneMatches.map((tone) => `tone:${tone}`));
  }

  if (signals.desiredLuxuryLevel && family.luxuryAffinities.includes(signals.desiredLuxuryLevel)) {
    score += 3;
    matchedSignals.push(`luxury:${signals.desiredLuxuryLevel}`);
  }

  if (family.preferredColorTemperature.includes(signals.brandColorTemperature)) {
    score += signals.brandColorCount > 0 ? 2 : 1;
    matchedSignals.push(`color:${signals.brandColorTemperature}`);
  } else if (signals.brandColorCount > 0) {
    concerns.push(`Brand colors read as ${signals.brandColorTemperature}, which is not a strong fit for this family.`);
  }

  if (family.preferredImageAbundance.includes(signals.imageAbundance)) {
    score += 2;
    matchedSignals.push(`images:${signals.imageAbundance}`);
  } else {
    concerns.push(`Image abundance is ${signals.imageAbundance}, which is weaker for this family.`);
  }

  if (family.familyId === 'food-warm-editorial') {
    if (signals.imageSignals.includes('image:dish')) {
      score += 4;
      matchedSignals.push('image:dish');
    }
    if (signals.imageSignals.includes('image:ambience')) {
      score += 2;
      matchedSignals.push('image:ambience');
    }
  }

  if (family.familyId === 'clinic-calm-trust') {
    if (signals.trustSignals.includes('trust:credentials')) {
      score += 4;
      matchedSignals.push('trust:credentials');
    }
    if (sectorProfile.rules.recommendedHeroType === 'trust-first') {
      score += 2;
      matchedSignals.push('hero:trust-first');
    }
  }

  if (family.familyId === 'dark-boutique-luxury') {
    if (signals.visualIntensity === 'bold' || signals.visualIntensity === 'cinematic') {
      score += 3;
      matchedSignals.push(`intensity:${signals.visualIntensity}`);
    }
    if (signals.strongImageCount >= 3) {
      score += 2;
      matchedSignals.push('images:strong-set');
    } else {
      concerns.push('This family wants a stronger image set than the current brief can guarantee.');
    }
  }

  if (family.familyId === 'retail-clean-modern' && signals.imageSignals.includes('image:product')) {
    score += 4;
    matchedSignals.push('image:product');
  }

  if (family.familyId === 'local-service-premium') {
    if (sectorProfile.rules.recommendedHeroType === 'service-first' || sectorProfile.rules.recommendedHeroType === 'local-presence-first') {
      score += 2;
      matchedSignals.push(`hero:${sectorProfile.rules.recommendedHeroType}`);
    }
    if (signals.trustSignals.includes('trust:rating-reviews')) {
      score += 1;
      matchedSignals.push('trust:rating-reviews');
    }
  }

  if (family.familyId === 'neutral-reusable') {
    if (signals.incompleteBrief) {
      score += 4;
      matchedSignals.push('fallback:incomplete-brief');
    }
    if (signals.brandColorCount === 0) {
      score += 2;
      matchedSignals.push('fallback:no-brand-colors');
    }
  }

  if (signals.incompleteBrief && family.familyId !== 'neutral-reusable' && family.familyId !== 'local-service-premium') {
    concerns.push('The brief is still incomplete, so this family may be too opinionated for the current state.');
  }

  return {
    familyId: family.familyId,
    score,
    matchedSignals,
    concerns,
  };
}

function selectFamily(candidates: VisualCandidateScore[]) {
  const sorted = [...candidates].sort((left, right) => right.score - left.score);
  const top = sorted[0];
  const runnerUp = sorted[1];
  const delta = top.score - (runnerUp?.score ?? 0);

  let visualFamily: VisualFamilyId = top.familyId;
  let fallbackUsed = false;
  let confidence: VisualConfidence = 'low';

  if (top.score < 8) {
    visualFamily = 'neutral-reusable';
    fallbackUsed = top.familyId !== 'neutral-reusable';
  }

  if (top.score >= 18 && delta >= 5) {
    confidence = 'high';
  } else if (top.score >= 11 && delta >= 3) {
    confidence = 'medium';
  }

  return {
    visualFamily,
    fallbackUsed,
    confidence,
    top,
    runnerUp,
    sorted,
  };
}

function resolveAppliedFallbacks(
  family: VisualFamilyDefinition,
  signals: VisualSignals,
): AppliedVisualFallback[] {
  return family.degradationRules.flatMap((rule) => {
    const triggeredBy = new Set<string>();

    for (const path of rule.whenMissingPaths ?? []) {
      if (signals.missingPaths.includes(path)) {
        triggeredBy.add(path);
      }
    }

    for (const signal of rule.whenMissingSignals ?? []) {
      const hasSignal = signals.imageSignals.includes(signal) || signals.trustSignals.includes(signal);
      if (!hasSignal) {
        triggeredBy.add(`signal:${signal}`);
      }
    }

    if (typeof rule.whenLowImageCount === 'number' && signals.approvedImageCount <= rule.whenLowImageCount) {
      triggeredBy.add(`images<=${rule.whenLowImageCount}`);
    }

    if (rule.whenNoBrandColors && signals.brandColorCount === 0) {
      triggeredBy.add('brand-colors:none');
    }

    if (rule.whenIncompleteBrief && signals.incompleteBrief) {
      triggeredBy.add('brief:incomplete');
    }

    if (triggeredBy.size === 0) {
      return [];
    }

    return [
      {
        ruleId: rule.id,
        triggeredBy: [...triggeredBy],
        guidance: rule.guidance,
        adjustments: [...rule.adjustments],
      },
    ];
  });
}

function buildReasoning(
  selection: ReturnType<typeof selectFamily>,
  family: VisualFamilyDefinition,
  signals: VisualSignals,
) {
  const reasoning = [
    `Selected ${family.label} with score ${selection.top.score}.`,
  ];

  if (selection.top.matchedSignals.length > 0) {
    reasoning.push(`Matched signals: ${selection.top.matchedSignals.join(', ')}.`);
  }

  if (selection.runnerUp && selection.runnerUp.score > 0) {
    reasoning.push(`Runner-up was ${VISUAL_FAMILIES[selection.runnerUp.familyId].label} at ${selection.runnerUp.score}.`);
  }

  if (selection.fallbackUsed) {
    reasoning.push('Signals were too weak for a more opinionated family, so the engine fell back to Neutral Reusable.');
  } else if (selection.confidence === 'low') {
    reasoning.push('The family fit is usable, but visual confidence is still low enough that later blocks should keep the UI cautious.');
  }

  reasoning.push(
    `Image abundance is ${signals.imageAbundance} with ${signals.strongImageCount} strong approved assets.`,
  );

  return reasoning;
}

export function analyzeBusinessVisual(record: BusinessMasterRecord, sectorProfile: SectorProfileFile): VisualProfileFile {
  const signals = buildSignals(record, sectorProfile);
  const candidateScores = VISUAL_FAMILY_ORDER.map((familyId) =>
    scoreFamily(VISUAL_FAMILIES[familyId], signals, sectorProfile),
  );
  const selection = selectFamily(candidateScores);
  const family = VISUAL_FAMILIES[selection.visualFamily];
  const appliedFallbacks = resolveAppliedFallbacks(family, signals);

  return {
    schemaVersion: 1,
    fileKind: 'visual-profile',
    businessSlug: record.brief.identity.slug,
    updatedAt: new Date().toISOString(),
    visualFamily: selection.visualFamily,
    visualConfidence: selection.confidence,
    visualScore: selection.top.score,
    fallbackUsed: selection.fallbackUsed,
    reasoning: buildReasoning(selection, family, signals),
    candidateScores: [...selection.sorted],
    signals: {
      sectorType: signals.sectorType,
      sectorConfidence: signals.sectorConfidence,
      toneHints: [...signals.toneHints],
      sectorTone: [...signals.sectorTone],
      desiredLuxuryLevel: signals.desiredLuxuryLevel ?? null,
      visualIntensity: signals.visualIntensity ?? null,
      preferredContrast: signals.preferredContrast ?? null,
      sectionDensityPreference: signals.sectionDensityPreference ?? null,
      brandColorTemperature: signals.brandColorTemperature,
      brandColorCount: signals.brandColorCount,
      approvedImageCount: signals.approvedImageCount,
      strongImageCount: signals.strongImageCount,
      imageAbundance: signals.imageAbundance,
      imageSignals: [...signals.imageSignals],
      trustSignals: [...signals.trustSignals],
      missingPaths: [...signals.missingPaths],
    },
    family,
    appliedFallbacks,
  };
}

export function validateVisualProfile(profile: VisualProfileFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!VISUAL_FAMILIES[profile.visualFamily]) {
    issues.push({
      path: 'visualFamily',
      severity: 'error',
      message: `Unknown visual family "${profile.visualFamily}".`,
    });
  }

  if (profile.candidateScores.length === 0) {
    issues.push({
      path: 'candidateScores',
      severity: 'error',
      message: 'Visual profile must include candidate scores.',
    });
  }

  const selectedCandidate = profile.candidateScores.find((candidate) => candidate.familyId === profile.visualFamily);
  if (!selectedCandidate) {
    issues.push({
      path: 'visualFamily',
      severity: 'error',
      message: 'Chosen visual family must exist in candidate scores.',
    });
  }

  if (profile.family.familyId !== profile.visualFamily) {
    issues.push({
      path: 'family.familyId',
      severity: 'error',
      message: 'Embedded family definition must match the chosen visual family.',
    });
  }

  if (profile.signals.approvedImageCount < profile.signals.strongImageCount) {
    issues.push({
      path: 'signals.strongImageCount',
      severity: 'error',
      message: 'Strong image count cannot exceed approved image count.',
    });
  }

  return issues;
}

export function assertValidVisualProfile(profile: VisualProfileFile) {
  const issues = validateVisualProfile(profile);
  const errors = issues.filter((issue) => issue.severity === 'error');

  if (errors.length === 0) {
    return profile;
  }

  throw new Error(
    ['Visual profile validation failed:', ...errors.map((issue) => `- ${issue.path}: ${issue.message}`)].join('\n'),
  );
}
