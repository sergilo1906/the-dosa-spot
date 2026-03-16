import type { BusinessMasterRecord } from '../../types/business-record';
import type {
  CopyBlockId,
  CopyProfileFile,
  CopySampleCheck,
  CopySeverity,
  CopyToneId,
  CopyValidationIssue,
} from '../../types/copy-engine';
import type { SectorProfileFile } from '../../types/sector-engine';
import type { VisualProfileFile } from '../../types/visual-engine';
import { COPY_SECTOR_RULES, COPY_VALIDATION_RULES, TONE_PREFERENCES } from './rules.ts';

const FILLER_PATTERNS = [
  'elevated experience',
  'carefully curated',
  'world class',
  'best of both worlds',
  'something for everyone',
  'crafted with passion',
];

const FORBIDDEN_CLAIM_PATTERNS: Array<{ pattern: RegExp; missingPaths?: string[]; message: string }> = [
  {
    pattern: /\b(order online|order now|delivery now|checkout)\b/i,
    missingPaths: ['contact.orderUrl'],
    message: 'Ordering language appears even though no verified order route exists.',
  },
  {
    pattern: /\b(open now|open late|open daily|late night)\b/i,
    missingPaths: ['location.openingHours'],
    message: 'Opening-hours language appears even though hours are not verified.',
  },
  {
    pattern: /\bbook now|reserve now|appointment today\b/i,
    message: 'Booking language should only be used when a verified booking route exists.',
  },
  {
    pattern: /\baward[- ]winning|best in town|number one|leading\b/i,
    message: 'Superlative marketing claim detected without evidence guardrails.',
  },
  {
    pattern: /\bemail us\b/i,
    missingPaths: ['contact.email'],
    message: 'Email callout appears even though no verified email exists.',
  },
  {
    pattern: /\bwhatsapp us\b/i,
    missingPaths: ['contact.whatsapp'],
    message: 'WhatsApp callout appears even though no verified WhatsApp route exists.',
  },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(value: string) {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(' ').length : 0;
}

function countSentences(value: string) {
  return value
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function selectTone(
  record: BusinessMasterRecord,
  sectorProfile: SectorProfileFile,
  visualProfile: VisualProfileFile,
) {
  const sectorRule = COPY_SECTOR_RULES[sectorProfile.sectorType];
  const toneInputs = [
    ...sectorRule.tonePriority,
    ...sectorProfile.rules.recommendedTone.map((tone) => {
      switch (tone) {
        case 'premium-casual':
          return 'premium-casual';
        case 'local-trust':
          return 'local-trust';
        case 'modern-clean':
          return 'modern-clean';
        case 'clinical-clear':
          return 'calm-clinical';
        case 'boutique':
          return 'boutique-service';
        case 'direct':
          return 'direct-conversion';
        case 'warm':
          return 'warm-food-led';
        case 'friendly':
          return 'local-trust';
        case 'expert':
          return 'direct-conversion';
        default:
          return 'local-trust';
      }
    }),
    ...(record.brief.brand.toneHints ?? []).flatMap((tone) => {
      const value = normalizeText(tone);
      if (value.includes('warm') || value.includes('fresh')) return ['warm-food-led' as const];
      if (value.includes('clear') || value.includes('clean')) return ['modern-clean' as const];
      if (value.includes('local')) return ['local-trust' as const];
      if (value.includes('welcoming')) return ['premium-casual' as const];
      return [] as CopyToneId[];
    }),
  ];

  const score = new Map<CopyToneId, number>();
  for (const tone of toneInputs) {
    score.set(tone, (score.get(tone as CopyToneId) ?? 0) + 1);
  }

  if (visualProfile.visualFamily === 'food-warm-editorial') {
    score.set('warm-food-led', (score.get('warm-food-led') ?? 0) + 2);
    score.set('premium-casual', (score.get('premium-casual') ?? 0) + 1);
  }

  const ordered = [...score.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([tone]) => tone);

  const primary = ordered[0] ?? sectorRule.tonePriority[0];
  const support = ordered.filter((tone) => tone !== primary).slice(0, 3);

  return {
    primary,
    support,
    reasoning: [
      `Primary tone selected from sector priority, sector tone hints, and brand tone hints.`,
      `Sector: ${sectorRule.label}. Visual family: ${visualProfile.family.label}.`,
      `Primary tone "${primary}" means: ${TONE_PREFERENCES[primary]}`,
    ],
  };
}

function buildContentOutline(
  sectorProfile: SectorProfileFile,
): Array<{ blockId: CopyBlockId; priority: 'high' | 'medium' | 'low'; reason: string }> {
  const priorityMap = new Map<string, 'high' | 'medium' | 'low'>();

  for (const section of sectorProfile.rules.recommendedSections) {
    switch (section.id) {
      case 'hero':
        priorityMap.set('hero-title', section.priority);
        priorityMap.set('hero-subheadline', section.priority);
        priorityMap.set('hero-support', section.priority);
        priorityMap.set('cta-primary', section.priority);
        priorityMap.set('cta-secondary', section.priority);
        break;
      case 'signature-items':
      case 'menu-highlights':
      case 'services':
      case 'products':
        priorityMap.set('highlights', section.priority);
        break;
      case 'trust':
      case 'reviews':
        priorityMap.set('trust-summary', section.priority);
        priorityMap.set('review-signals', section.priority);
        break;
      case 'gallery':
        priorityMap.set('gallery-support', section.priority);
        break;
      case 'location-contact':
        priorityMap.set('location-contact', section.priority);
        break;
      case 'faq':
        priorityMap.set('faq', section.priority);
        break;
      case 'cta':
      case 'booking':
        priorityMap.set('final-cta', section.priority);
        break;
      case 'footer':
        priorityMap.set('footer', section.priority);
        break;
      default:
        break;
    }
  }

  return [
    { blockId: 'hero-title', priority: priorityMap.get('hero-title') ?? 'high', reason: sectorProfile.rules.conversionFocus },
    { blockId: 'hero-subheadline', priority: priorityMap.get('hero-subheadline') ?? 'high', reason: 'Clarify the offer and the next step.' },
    { blockId: 'cta-primary', priority: priorityMap.get('cta-primary') ?? 'high', reason: 'Keep the strongest truthful action near the top.' },
    { blockId: 'highlights', priority: priorityMap.get('highlights') ?? 'medium', reason: 'Help users scan the offer without overload.' },
    { blockId: 'trust-summary', priority: priorityMap.get('trust-summary') ?? 'medium', reason: 'Use the strongest trust proof available.' },
    { blockId: 'gallery-support', priority: priorityMap.get('gallery-support') ?? 'medium', reason: 'Frame visuals without filler copy.' },
    { blockId: 'location-contact', priority: priorityMap.get('location-contact') ?? 'high', reason: 'Location and contact must stay useful.' },
    { blockId: 'faq', priority: priorityMap.get('faq') ?? 'medium', reason: 'FAQ should reduce friction, not add noise.' },
    { blockId: 'final-cta', priority: priorityMap.get('final-cta') ?? 'high', reason: 'Close on the strongest practical action.' },
    { blockId: 'footer', priority: priorityMap.get('footer') ?? 'low', reason: 'Reinforce location and one trust cue only.' },
  ];
}

function buildAllowedClaims(record: BusinessMasterRecord) {
  const claims: string[] = [];

  if (record.brief.identity.primaryCategory) {
    claims.push(record.brief.identity.primaryCategory);
  }

  if (record.brief.location.city) {
    claims.push(`${record.brief.location.city} location`);
  }

  if (record.brief.contact.mapsUrl) {
    claims.push('Directions are available');
  }

  if (record.brief.contact.phone) {
    claims.push('Phone contact is available');
  }

  if (record.brief.offer.serviceModes?.length) {
    claims.push(`${record.brief.offer.serviceModes.join(', ')} available`);
  }

  if (record.brief.trust.ratingValue && record.brief.trust.reviewCount) {
    claims.push(`${record.brief.trust.ratingValue.toFixed(1)} rating from ${record.brief.trust.reviewCount} reviews`);
  }

  if (record.brief.offer.featuredItems?.length) {
    claims.push(`Featured items such as ${record.brief.offer.featuredItems.slice(0, 2).map((item) => item.title).join(' and ')}`);
  }

  return claims;
}

function buildForbiddenClaims(record: BusinessMasterRecord, sectorProfile: SectorProfileFile) {
  const sectorRules = COPY_SECTOR_RULES[sectorProfile.sectorType];
  const claims = [...sectorRules.forbiddenClaims];

  const missingPaths = new Set(record.missingData.items.map((item) => item.path));
  if (missingPaths.has('location.openingHours')) {
    claims.push('Do not say open now, open daily, late night, or list hours.');
  }

  if (missingPaths.has('contact.orderUrl')) {
    claims.push('Do not say order online, checkout, or delivery now.');
  }

  if (missingPaths.has('contact.menuUrl')) {
    claims.push('Do not imply a verified full external menu URL.');
  }

  if (missingPaths.has('trust.testimonials')) {
    claims.push('Do not present testimonial quotes or quote marks as if direct quotes exist.');
  }

  return [...new Set(claims)];
}

function buildDegradations(
  record: BusinessMasterRecord,
  sectorProfile: SectorProfileFile,
  visualProfile: VisualProfileFile,
) {
  const missingPaths = new Set(record.missingData.items.map((item) => item.path));
  const imageSignals = new Set(sectorProfile.signals.imageSignals);
  const degradations = COPY_SECTOR_RULES[sectorProfile.sectorType].degradationRules.flatMap((rule) => {
    const triggeredBy = new Set<string>();

    for (const path of rule.whenMissingPaths ?? []) {
      if (missingPaths.has(path)) {
        triggeredBy.add(path);
      }
    }

    for (const signal of rule.whenMissingSignals ?? []) {
      if (!imageSignals.has(signal)) {
        triggeredBy.add(`signal:${signal}`);
      }
    }

    if (triggeredBy.size === 0) {
      return [];
    }

    return [
      {
        ruleId: rule.id,
        guidance: rule.guidance,
        affectedBlocks: [...rule.affectedBlocks],
        adjustments: [...rule.adjustments],
        triggeredBy: [...triggeredBy],
      },
    ];
  });

  return [
    ...degradations,
    ...visualProfile.appliedFallbacks.map((item) => ({
      ruleId: `visual:${item.ruleId}`,
      guidance: item.guidance,
      affectedBlocks: ['gallery-support', 'location-contact'] as CopyBlockId[],
      adjustments: [...item.adjustments],
      triggeredBy: [...item.triggeredBy],
    })),
  ];
}

function buildCtaRules(
  sectorProfile: SectorProfileFile,
) {
  return {
    primary: {
      actionKey: sectorProfile.recommendedPrimaryCta.actionKey,
      label: sectorProfile.recommendedPrimaryCta.label,
      guidance: [
        'Prefer literal verbs.',
        'Keep the label under 18 characters.',
        sectorProfile.recommendedPrimaryCta.reason,
      ],
      maxChars: 18,
    },
    secondary: sectorProfile.recommendedSecondaryCtas.map((cta) => ({
      actionKey: cta.actionKey,
      label: cta.label,
      guidance: [
        'Support the main action without competing with it.',
        'Keep the label under 18 characters.',
        cta.reason,
      ],
      maxChars: 18,
    })),
  };
}

function collectSamples(record: BusinessMasterRecord) {
  return [
    { blockId: 'hero-title' as const, sampleLabel: 'Hero title', text: record.brief.brand.tagline },
    { blockId: 'hero-subheadline' as const, sampleLabel: 'Hero subheadline', text: record.brief.brand.shortDescription },
    { blockId: 'hero-support' as const, sampleLabel: 'Hero support', text: record.brief.brand.heroSignature },
    { blockId: 'cta-primary' as const, sampleLabel: 'Primary CTA label', text: record.contentPlan.primaryCta.label },
    ...(record.contentPlan.secondaryCtas ?? []).map((cta, index) => ({
      blockId: 'cta-secondary' as const,
      sampleLabel: `Secondary CTA ${index + 1}`,
      text: cta.label,
    })),
    ...(record.brief.offer.featuredItems ?? []).slice(0, 3).map((item, index) => ({
      blockId: 'highlights' as const,
      sampleLabel: `Highlight ${index + 1}`,
      text: item.summary,
    })),
    { blockId: 'trust-summary' as const, sampleLabel: 'Trust summary', text: record.contentPlan.messaging.trustFocus },
    ...(record.brief.trust.reviewHighlights ?? []).slice(0, 4).map((item, index) => ({
      blockId: 'review-signals' as const,
      sampleLabel: `Review signal ${index + 1}`,
      text: item,
    })),
    { blockId: 'gallery-support' as const, sampleLabel: 'Gallery support', text: record.brief.brand.photographyStyle },
    { blockId: 'location-contact' as const, sampleLabel: 'Location focus', text: record.contentPlan.messaging.locationFocus },
    ...(record.brief.offer.faqItems ?? []).slice(0, 3).flatMap((item, index) => [
      {
        blockId: 'faq' as const,
        sampleLabel: `FAQ question ${index + 1}`,
        text: item.question,
      },
      {
        blockId: 'faq' as const,
        sampleLabel: `FAQ answer ${index + 1}`,
        text: item.answer,
      },
    ]),
    { blockId: 'final-cta' as const, sampleLabel: 'Primary CTA reason', text: record.contentPlan.primaryCta.reason },
    { blockId: 'footer' as const, sampleLabel: 'Footer summary', text: record.brief.brand.shortDescription },
  ];
}

function detectRepeatedPhrases(samples: Array<{ text: string }>) {
  const counts = new Map<string, number>();

  for (const sample of samples) {
    const words = normalizeText(sample.text).split(' ').filter(Boolean);

    for (let size = 2; size <= 3; size += 1) {
      for (let index = 0; index <= words.length - size; index += 1) {
        const phrase = words.slice(index, index + size).join(' ');
        if (phrase.length < 8) continue;
        counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .map(([phrase]) => phrase)
    .slice(0, 10);
}

function validateSample(
  sample: { blockId: CopyProfileFile['contentRules']['blockRules'][number]['blockId']; sampleLabel: string; text: string },
  rule: CopyProfileFile['contentRules']['blockRules'][number],
  missingPaths: Set<string>,
  forbiddenClaims: string[],
): CopySampleCheck {
  const issues: CopyValidationIssue[] = [];
  const wordCount = countWords(sample.text);
  const charCount = sample.text.length;
  const sentenceCount = countSentences(sample.text);

  if (rule.length.maxWords && wordCount > rule.length.maxWords) {
    issues.push({
      severity: 'warning',
      blockId: sample.blockId,
      sampleLabel: sample.sampleLabel,
      message: `Exceeds max words (${wordCount}/${rule.length.maxWords}).`,
    });
  }

  if (rule.length.maxChars && charCount > rule.length.maxChars) {
    issues.push({
      severity: 'warning',
      blockId: sample.blockId,
      sampleLabel: sample.sampleLabel,
      message: `Exceeds max characters (${charCount}/${rule.length.maxChars}).`,
    });
  }

  if (rule.length.maxSentences && sentenceCount > rule.length.maxSentences) {
    issues.push({
      severity: 'warning',
      blockId: sample.blockId,
      sampleLabel: sample.sampleLabel,
      message: `Exceeds max sentences (${sentenceCount}/${rule.length.maxSentences}).`,
    });
  }

  for (const filler of FILLER_PATTERNS) {
    if (normalizeText(sample.text).includes(normalizeText(filler))) {
      issues.push({
        severity: 'hint',
        blockId: sample.blockId,
        sampleLabel: sample.sampleLabel,
        message: `Contains filler-style phrase "${filler}".`,
      });
    }
  }

  for (const claim of FORBIDDEN_CLAIM_PATTERNS) {
    if (!claim.pattern.test(sample.text)) continue;
    if (claim.missingPaths && !claim.missingPaths.some((path) => missingPaths.has(path))) continue;

    issues.push({
      severity: 'error',
      blockId: sample.blockId,
      sampleLabel: sample.sampleLabel,
      message: claim.message,
    });
  }

  for (const claim of forbiddenClaims) {
    const normalizedClaim = normalizeText(claim);
    const words = normalizedClaim.split(' ').filter(Boolean);
    if (words.length < 3) continue;
    const cue = words.slice(-3).join(' ');
    if (cue && normalizeText(sample.text).includes(cue)) {
      issues.push({
        severity: 'hint',
        blockId: sample.blockId,
        sampleLabel: sample.sampleLabel,
        message: `May drift toward a forbidden claim area: "${claim}".`,
      });
      break;
    }
  }

  return {
    blockId: sample.blockId,
    sampleLabel: sample.sampleLabel,
    text: sample.text,
    wordCount,
    charCount,
    issues,
  };
}

export function analyzeBusinessCopy(
  record: BusinessMasterRecord,
  sectorProfile: SectorProfileFile,
  visualProfile: VisualProfileFile,
): CopyProfileFile {
  const sectorRules = COPY_SECTOR_RULES[sectorProfile.sectorType];
  const recommendedTone = selectTone(record, sectorProfile, visualProfile);
  const forbiddenClaims = buildForbiddenClaims(record, sectorProfile);
  const blockRules = sectorRules.blockRules.map((rule) => ({
    ...rule,
    tone: [recommendedTone.primary, ...recommendedTone.support.filter((tone) => rule.tone.includes(tone))].slice(0, 3),
    forbiddenClaims: [...new Set([...rule.forbiddenClaims, ...forbiddenClaims])],
  }));
  const samples = collectSamples(record);
  const missingPaths = new Set(record.missingData.items.map((item) => item.path));
  const checkedSamples = samples.map((sample) => {
    const rule = blockRules.find((item) => item.blockId === sample.blockId);
    if (!rule) {
      return {
        blockId: sample.blockId,
        sampleLabel: sample.sampleLabel,
        text: sample.text,
        wordCount: countWords(sample.text),
        charCount: sample.text.length,
        issues: [],
      } satisfies CopySampleCheck;
    }

    return validateSample(sample, rule, missingPaths, forbiddenClaims);
  });

  const repeatedPhrases = detectRepeatedPhrases(checkedSamples);
  const repetitionIssues = repeatedPhrases.map((phrase) => ({
    severity: 'hint' as const,
    blockId: 'highlights' as const,
    message: `Repeated phrase across samples: "${phrase}".`,
    sampleLabel: null,
  }));

  const issues = [...checkedSamples.flatMap((sample) => sample.issues), ...repetitionIssues];
  const summary = issues.reduce(
    (accumulator, issue) => {
      accumulator[issue.severity] += 1;
      return accumulator;
    },
    { error: 0, warning: 0, hint: 0 } satisfies Record<CopySeverity, number>,
  );

  return {
    schemaVersion: 1,
    fileKind: 'copy-profile',
    businessSlug: record.brief.identity.slug,
    updatedAt: new Date().toISOString(),
    recommendedTone,
    inputs: {
      sectorType: sectorProfile.sectorType,
      visualFamily: visualProfile.visualFamily,
      visualConfidence: visualProfile.visualConfidence,
      sectorTone: [...sectorProfile.rules.recommendedTone],
      contentTone: [...(record.contentPlan.tone ?? [])],
      conversionGoal: record.contentPlan.primaryGoal,
      availableCtas: [
        record.contentPlan.primaryCta.key,
        ...(record.contentPlan.secondaryCtas ?? []).map((cta) => cta.key),
      ],
      missingPaths: [...missingPaths],
      trustSystems: [...sectorProfile.rules.recommendedTrustSystems],
    },
    contentRules: {
      sectorLabel: sectorRules.label,
      summary: sectorRules.description,
      heroFocus: sectorRules.heroFocus,
      closingStyle: sectorRules.closingStyle,
      blockRules,
      forbiddenClaims,
      allowedClaims: buildAllowedClaims(record),
      contentOutlineBySector: buildContentOutline(sectorProfile),
    },
    ctaRules: buildCtaRules(sectorProfile),
    contentConstraints: {
      maxVisibleCtas: 2,
      repetitionWindow: 3,
      forbiddenClaims,
      honestyRules: [
        'Only use what is verified or explicitly prepared in the brief.',
        'Simplify instead of inventing when data is missing.',
        'Prefer themes over quotes when testimonial quotes are absent.',
        'Prefer local practical actions over unverified digital flows.',
      ],
    },
    degradationCopyRules: buildDegradations(record, sectorProfile, visualProfile),
    copyValidationRules: COPY_VALIDATION_RULES,
    validation: {
      summary: {
        errors: summary.error,
        warnings: summary.warning,
        hints: summary.hint,
      },
      issues,
      checkedSamples,
      repeatedPhrases,
    },
  };
}

export function validateCopyProfile(profile: CopyProfileFile) {
  const issues: Array<{ path: string; severity: 'error' | 'warning'; message: string }> = [];

  if (profile.contentRules.blockRules.length === 0) {
    issues.push({
      path: 'contentRules.blockRules',
      severity: 'error',
      message: 'Copy profile must include block rules.',
    });
  }

  if (!profile.recommendedTone.primary) {
    issues.push({
      path: 'recommendedTone.primary',
      severity: 'error',
      message: 'Copy profile must include a primary tone.',
    });
  }

  if (profile.ctaRules.primary.label.length > profile.ctaRules.primary.maxChars) {
    issues.push({
      path: 'ctaRules.primary.label',
      severity: 'warning',
      message: 'Primary CTA label exceeds its configured max length.',
    });
  }

  return issues;
}

export function assertValidCopyProfile(profile: CopyProfileFile) {
  const issues = validateCopyProfile(profile);
  const errors = issues.filter((issue) => issue.severity === 'error');

  if (errors.length === 0) {
    return profile;
  }

  throw new Error(
    ['Copy profile validation failed:', ...errors.map((issue) => `- ${issue.path}: ${issue.message}`)].join('\n'),
  );
}
