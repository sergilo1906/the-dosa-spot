import type {
  BusinessMasterRecord,
  ConversionActionKey,
  ValidationIssue,
} from '../../types/business-record';
import type { BusinessNiche } from '../../types/business';
import type {
  AppliedDegradation,
  SectorActionKey,
  SectorCandidateScore,
  SectorConfidence,
  SectorProfileFile,
  SectorRecommendedCta,
  SectorRuleSet,
} from '../../types/sector-engine';
import { SECTOR_RULE_ORDER, SECTOR_RULES } from './rules.ts';

const RENDER_ACTION_KEYS: ConversionActionKey[] = [
  'get-directions',
  'order-online',
  'call',
  'view-menu',
  'visit-website',
  'email',
  'whatsapp',
];

const SECTOR_ACTION_KEYS: SectorActionKey[] = [
  ...RENDER_ACTION_KEYS,
  'book-appointment',
  'browse-products',
  'request-consultation',
];

const ACTION_LABELS: Record<SectorActionKey, string> = {
  'get-directions': 'Get Directions',
  'order-online': 'Order Online',
  call: 'Call',
  'view-menu': 'View Menu',
  'visit-website': 'Visit Website',
  email: 'Email',
  whatsapp: 'WhatsApp',
  'book-appointment': 'Book Appointment',
  'browse-products': 'Browse Products',
  'request-consultation': 'Request Consultation',
};

interface SectorSignals {
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
  categoryText: string;
  serviceModeText: string;
  offerText: string;
}

function normalizeText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesKeyword(haystack: string, keyword: string) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;

  const pattern = new RegExp(`(?:^| )${escapeRegex(normalizedKeyword)}(?: |$)`);
  return pattern.test(haystack);
}

function matchKeywords(haystack: string, keywords: string[]) {
  const matches = new Set<string>();

  for (const keyword of keywords) {
    if (matchesKeyword(haystack, keyword)) {
      matches.add(keyword);
    }
  }

  return [...matches];
}

function getRenderActionAvailability(record: BusinessMasterRecord) {
  const hasOfferPreview = Boolean(
    (record.brief.offer.featuredItems?.length ?? 0) > 0 ||
      (record.brief.offer.services?.length ?? 0) > 0,
  );

  return {
    'get-directions': Boolean(record.brief.contact.mapsUrl),
    'order-online': Boolean(record.brief.contact.orderUrl),
    call: Boolean(record.brief.contact.phone),
    'view-menu': Boolean(record.brief.contact.menuUrl) || hasOfferPreview,
    'visit-website': Boolean(record.brief.contact.website),
    email: Boolean(record.brief.contact.email),
    whatsapp: Boolean(record.brief.contact.whatsapp),
  } satisfies Record<ConversionActionKey, boolean>;
}

function buildImageSignals(record: BusinessMasterRecord) {
  const signals = new Set<string>();

  for (const asset of record.imageMap.assets) {
    if (asset.discard || asset.reviewStatus === 'discard') continue;

    const text = normalizeText([asset.subject, asset.treatment, asset.suggestedAlt, asset.notes].join(' '));
    const roles = new Set(asset.roles ?? []);

    if (roles.has('dish') || matchesKeyword(text, 'dosa') || matchesKeyword(text, 'plate') || matchesKeyword(text, 'meal') || matchesKeyword(text, 'dessert') || matchesKeyword(text, 'curry') || matchesKeyword(text, 'coffee') || matchesKeyword(text, 'pastry')) {
      signals.add('image:dish');
    }

    if (roles.has('ambience')) {
      signals.add('image:ambience');
    }

    if (roles.has('interior') || matchesKeyword(text, 'interior') || matchesKeyword(text, 'room') || matchesKeyword(text, 'space') || matchesKeyword(text, 'studio') || matchesKeyword(text, 'store')) {
      signals.add('image:space');
    }

    if (roles.has('exterior') || matchesKeyword(text, 'exterior') || matchesKeyword(text, 'storefront') || matchesKeyword(text, 'frontage')) {
      signals.add('image:exterior');
    }

    if (matchesKeyword(text, 'product') || matchesKeyword(text, 'shelf') || matchesKeyword(text, 'collection') || matchesKeyword(text, 'retail')) {
      signals.add('image:product');
    }

    if (matchesKeyword(text, 'team') || matchesKeyword(text, 'staff') || matchesKeyword(text, 'barber') || matchesKeyword(text, 'stylist') || matchesKeyword(text, 'coach') || matchesKeyword(text, 'doctor') || matchesKeyword(text, 'therapist')) {
      signals.add('image:team');
    }

    if (matchesKeyword(text, 'before after') || matchesKeyword(text, 'result') || matchesKeyword(text, 'transformation') || matchesKeyword(text, 'fade') || matchesKeyword(text, 'treatment result')) {
      signals.add('image:results');
    }
  }

  return [...signals].sort();
}

function buildOfferSignals(record: BusinessMasterRecord) {
  const signals = new Set<string>();
  const serviceModes = record.brief.offer.serviceModes ?? [];
  const offerText = normalizeText(
    [
      ...(record.brief.offer.featuredItems ?? []).flatMap((item) => [item.title, item.summary, item.accent]),
      ...(record.brief.offer.services ?? []).flatMap((item) => [item.title, item.summary, item.priceLabel, item.accent]),
    ].join(' '),
  );

  if ((record.brief.offer.featuredItems?.length ?? 0) > 0) {
    signals.add('offer:featured-items');
  }

  if ((record.brief.offer.services?.length ?? 0) > 0) {
    signals.add('offer:structured-services');
  }

  for (const mode of serviceModes) {
    const normalizedMode = normalizeText(mode);
    if (!normalizedMode) continue;

    signals.add(`offer:${normalizedMode}`);
  }

  if (matchesKeyword(offerText, 'menu') || matchesKeyword(offerText, 'dish') || matchesKeyword(offerText, 'meal') || matchesKeyword(offerText, 'plate') || matchesKeyword(offerText, 'dosa')) {
    signals.add('offer:menu');
  }

  if (matchesKeyword(offerText, 'product') || matchesKeyword(offerText, 'collection') || matchesKeyword(offerText, 'retail')) {
    signals.add('offer:products');
  }

  if (matchesKeyword(offerText, 'haircut') || matchesKeyword(offerText, 'beard') || matchesKeyword(offerText, 'trim') || matchesKeyword(offerText, 'facial')) {
    signals.add('offer:grooming');
  }

  if (matchesKeyword(offerText, 'class') || matchesKeyword(offerText, 'membership') || matchesKeyword(offerText, 'training') || matchesKeyword(offerText, 'coaching')) {
    signals.add('offer:fitness-programs');
  }

  if (matchesKeyword(offerText, 'consultation') || matchesKeyword(offerText, 'assessment') || matchesKeyword(offerText, 'treatment') || matchesKeyword(offerText, 'therapy')) {
    signals.add('offer:consultation');
  }

  return [...signals].sort();
}

function buildTrustSignals(record: BusinessMasterRecord) {
  const signals = new Set<string>();
  const trustText = normalizeText(
    [
      record.brief.identity.primaryCategory,
      ...(record.brief.identity.secondaryCategories ?? []),
      ...(record.brief.trust.proofPoints ?? []),
      ...(record.brief.trust.reviewHighlights ?? []),
    ].join(' '),
  );

  if (record.brief.trust.ratingValue && record.brief.trust.reviewCount) {
    signals.add('trust:rating-reviews');
  }

  if ((record.brief.trust.testimonials?.length ?? 0) > 0) {
    signals.add('trust:testimonials');
  }

  if ((record.brief.trust.proofPoints?.length ?? 0) > 0) {
    signals.add('trust:proof-points');
  }

  if ((record.brief.trust.credibilityRisks?.length ?? 0) > 0) {
    signals.add('trust:credibility-risks');
  }

  if (matchesKeyword(trustText, 'licensed') || matchesKeyword(trustText, 'certified') || matchesKeyword(trustText, 'doctor') || matchesKeyword(trustText, 'dentist') || matchesKeyword(trustText, 'physio') || matchesKeyword(trustText, 'registered')) {
    signals.add('trust:credentials');
  }

  if (matchesKeyword(trustText, 'years') || matchesKeyword(trustText, 'established') || matchesKeyword(trustText, 'since')) {
    signals.add('trust:years-in-business');
  }

  return [...signals].sort();
}

function buildSignals(record: BusinessMasterRecord): SectorSignals {
  const renderActionAvailability = getRenderActionAvailability(record);
  const availableRenderActions = RENDER_ACTION_KEYS.filter((key) => renderActionAvailability[key]);
  const primaryCategory = record.brief.identity.primaryCategory ?? null;
  const secondaryCategories = record.brief.identity.secondaryCategories ?? [];
  const serviceModes = record.brief.offer.serviceModes ?? [];
  const categoryText = normalizeText([primaryCategory, ...secondaryCategories].join(' '));
  const serviceModeText = normalizeText(serviceModes.join(' '));
  const offerText = normalizeText(
    [
      ...(record.brief.offer.featuredItems ?? []).flatMap((item) => [item.title, item.summary, item.accent]),
      ...(record.brief.offer.services ?? []).flatMap((item) => [item.title, item.summary, item.priceLabel, item.accent]),
      ...(record.brief.offer.faqItems ?? []).flatMap((item) => [item.question, item.answer]),
    ].join(' '),
  );
  const imageSignals = buildImageSignals(record);
  const offerSignals = buildOfferSignals(record);
  const trustSignals = buildTrustSignals(record);

  return {
    niche: record.brief.identity.niche ?? null,
    primaryCategory,
    secondaryCategories,
    serviceModes,
    offerSignals,
    availableRenderActions,
    availableSectorActions: [],
    imageSignals,
    trustSignals,
    missingPaths: record.missingData.items.map((item) => item.path),
    categoryText,
    serviceModeText,
    offerText,
  };
}

function resolveSectorAction(
  actionKey: SectorActionKey,
  record: BusinessMasterRecord,
  renderActionAvailability: Record<ConversionActionKey, boolean>,
): SectorRecommendedCta {
  const direct = (renderActionKey: ConversionActionKey, reason: string): SectorRecommendedCta => ({
    actionKey,
    renderActionKey,
    label: ACTION_LABELS[actionKey],
    availability: 'available',
    reason,
  });

  const degraded = (renderActionKey: ConversionActionKey, reason: string): SectorRecommendedCta => ({
    actionKey,
    renderActionKey,
    label: ACTION_LABELS[actionKey],
    availability: 'degraded',
    reason,
  });

  const unavailable = (reason: string): SectorRecommendedCta => ({
    actionKey,
    renderActionKey: null,
    label: ACTION_LABELS[actionKey],
    availability: 'unavailable',
    reason,
  });

  switch (actionKey) {
    case 'get-directions':
      return renderActionAvailability['get-directions']
        ? direct('get-directions', 'A verified maps route exists.')
        : unavailable('No verified maps route exists yet.');
    case 'order-online':
      if (renderActionAvailability['order-online']) {
        return direct('order-online', 'A verified order URL exists.');
      }
      if (renderActionAvailability['view-menu']) {
        return degraded('view-menu', 'There is no verified order flow, so the safest fallback is menu exploration.');
      }
      if (renderActionAvailability.call) {
        return degraded('call', 'Ordering is not verified online, but phone contact exists.');
      }
      if (renderActionAvailability['get-directions']) {
        return degraded('get-directions', 'Ordering is not verified online, so the next truthful step is an in-person visit.');
      }
      return unavailable('No verified order path or practical fallback exists.');
    case 'call':
      return renderActionAvailability.call
        ? direct('call', 'A verified phone number exists.')
        : unavailable('No verified phone number exists yet.');
    case 'view-menu':
      if (renderActionAvailability['view-menu']) {
        const reason = record.brief.contact.menuUrl
          ? 'A verified menu route exists.'
          : 'The current page has enough structured offer content to support an in-page menu route.';
        return direct('view-menu', reason);
      }
      if (renderActionAvailability['visit-website']) {
        return degraded('visit-website', 'No direct menu route exists, but the website can carry offer discovery.');
      }
      return unavailable('No menu route or fallback offer path exists.');
    case 'visit-website':
      return renderActionAvailability['visit-website']
        ? direct('visit-website', 'A verified website exists.')
        : unavailable('No verified website exists yet.');
    case 'email':
      return renderActionAvailability.email
        ? direct('email', 'A verified email exists.')
        : unavailable('No verified email exists yet.');
    case 'whatsapp':
      return renderActionAvailability.whatsapp
        ? direct('whatsapp', 'A verified WhatsApp route exists.')
        : unavailable('No verified WhatsApp route exists yet.');
    case 'book-appointment':
      if (renderActionAvailability['visit-website']) {
        return degraded('visit-website', 'The system does not model a dedicated booking URL yet, but the website can host appointment flow.');
      }
      if (renderActionAvailability.call) {
        return degraded('call', 'No booking URL is verified, so phone is the best fallback.');
      }
      if (renderActionAvailability.email) {
        return degraded('email', 'No booking URL is verified, but email can support appointment requests.');
      }
      return unavailable('No booking path or practical contact fallback exists.');
    case 'browse-products':
      if (renderActionAvailability['visit-website']) {
        return degraded('visit-website', 'Website is the safest current route for product browsing.');
      }
      if (renderActionAvailability['get-directions']) {
        return degraded('get-directions', 'No online catalog is verified, so in-store browsing is the clearest fallback.');
      }
      if (renderActionAvailability.call) {
        return degraded('call', 'No browseable storefront exists, but phone contact is available.');
      }
      return unavailable('No product browsing route is verified.');
    case 'request-consultation':
      if (renderActionAvailability.email) {
        return degraded('email', 'Email is the cleanest current consultation route.');
      }
      if (renderActionAvailability.whatsapp) {
        return degraded('whatsapp', 'WhatsApp is the cleanest current consultation route.');
      }
      if (renderActionAvailability.call) {
        return degraded('call', 'Phone is the clearest current consultation route.');
      }
      if (renderActionAvailability['visit-website']) {
        return degraded('visit-website', 'Website is available even though consultation routing is not modeled directly.');
      }
      return unavailable('No consultation path or practical fallback exists.');
    default:
      return unavailable('No resolution rule exists for this action.');
  }
}

function buildActionResolutionMap(record: BusinessMasterRecord) {
  const renderActionAvailability = getRenderActionAvailability(record);

  return Object.fromEntries(
    SECTOR_ACTION_KEYS.map((actionKey) => [
      actionKey,
      resolveSectorAction(actionKey, record, renderActionAvailability),
    ]),
  ) as Record<SectorActionKey, SectorRecommendedCta>;
}

function scoreSector(
  rule: SectorRuleSet,
  signals: SectorSignals,
  actionResolutions: Record<SectorActionKey, SectorRecommendedCta>,
): SectorCandidateScore {
  let score = rule.sectorType === 'local-service' ? 1 : 0;
  const matchedSignals: string[] = [];
  const concerns: string[] = [];

  if (signals.niche && rule.nicheSignals?.includes(signals.niche as BusinessNiche)) {
    score += 10;
    matchedSignals.push(`niche:${signals.niche}`);
  }

  const categoryMatches = matchKeywords(signals.categoryText, rule.categoryKeywords);
  if (categoryMatches.length > 0) {
    score += Math.min(12, categoryMatches.length * 3);
    matchedSignals.push(...categoryMatches.map((keyword) => `category:${keyword}`));
  }

  const serviceModeMatches = matchKeywords(signals.serviceModeText, rule.serviceModeKeywords ?? []);
  if (serviceModeMatches.length > 0) {
    score += Math.min(4, serviceModeMatches.length * 2);
    matchedSignals.push(...serviceModeMatches.map((keyword) => `service-mode:${keyword}`));
  }

  const offerMatches = matchKeywords(signals.offerText, rule.offerKeywords ?? []);
  if (offerMatches.length > 0) {
    score += Math.min(8, offerMatches.length * 2);
    matchedSignals.push(...offerMatches.map((keyword) => `offer:${keyword}`));
  }

  const imageMatches = (rule.imageSignals ?? []).filter((signal) => signals.imageSignals.includes(signal));
  if (imageMatches.length > 0) {
    score += imageMatches.length;
    matchedSignals.push(...imageMatches);
  }

  if (rule.recommendedTrustSystems.includes('rating-reviews') && signals.trustSignals.includes('trust:rating-reviews')) {
    score += 1;
    matchedSignals.push('trust:rating-reviews');
  }

  const preferredAction =
    rule.primaryCtaPriority.find((actionKey) => actionResolutions[actionKey].availability === 'available') ??
    rule.primaryCtaPriority.find((actionKey) => actionResolutions[actionKey].availability === 'degraded');

  if (preferredAction) {
    score += 2;
    matchedSignals.push(`cta:${preferredAction}`);
  } else {
    concerns.push('No preferred CTA route is currently available.');
  }

  if (categoryMatches.length === 0 && offerMatches.length === 0 && imageMatches.length === 0 && !preferredAction) {
    concerns.push('This sector has very little evidence in the current brief.');
  }

  return {
    sectorType: rule.sectorType,
    score,
    matchedSignals,
    concerns,
  };
}

function selectSector(candidates: SectorCandidateScore[]) {
  const sorted = [...candidates].sort((left, right) => right.score - left.score);
  const top = sorted[0];
  const runnerUp = sorted[1];
  const delta = top.score - (runnerUp?.score ?? 0);

  let sectorType = top.sectorType;
  let fallbackUsed = false;
  let confidence: SectorConfidence = 'low';

  if (top.score < 4) {
    sectorType = 'local-service';
    fallbackUsed = top.sectorType !== 'local-service';
  }

  if (top.score >= 16 && delta >= 5) {
    confidence = 'high';
  } else if (top.score >= 9 && delta >= 3) {
    confidence = 'medium';
  }

  return {
    sectorType,
    fallbackUsed,
    confidence,
    top,
    runnerUp,
    sorted,
  };
}

function resolveRecommendedPrimaryCta(
  rule: SectorRuleSet,
  actionResolutions: Record<SectorActionKey, SectorRecommendedCta>,
) {
  const firstAvailable = rule.primaryCtaPriority.find(
    (actionKey) => actionResolutions[actionKey].availability === 'available',
  );

  if (firstAvailable) {
    return actionResolutions[firstAvailable];
  }

  const firstDegraded = rule.primaryCtaPriority.find(
    (actionKey) => actionResolutions[actionKey].availability === 'degraded',
  );

  return firstDegraded ? actionResolutions[firstDegraded] : actionResolutions[rule.primaryCtaPriority[0]];
}

function resolveRecommendedSecondaryCtas(
  rule: SectorRuleSet,
  primaryCta: SectorRecommendedCta,
  actionResolutions: Record<SectorActionKey, SectorRecommendedCta>,
) {
  const selected: SectorRecommendedCta[] = [];
  const orderedKeys = [
    ...rule.secondaryCtaPriority.filter((actionKey) => actionResolutions[actionKey].availability === 'available'),
    ...rule.secondaryCtaPriority.filter((actionKey) => actionResolutions[actionKey].availability === 'degraded'),
  ];

  for (const actionKey of orderedKeys) {
    const resolved = actionResolutions[actionKey];
    if (!resolved || resolved.availability === 'unavailable') continue;
    if (resolved.actionKey === primaryCta.actionKey) continue;
    if (selected.some((entry) => entry.actionKey === resolved.actionKey)) continue;
    if (
      resolved.renderActionKey &&
      selected.some((entry) => entry.renderActionKey && entry.renderActionKey === resolved.renderActionKey)
    ) {
      continue;
    }

    selected.push(resolved);

    if (selected.length === 3) {
      break;
    }
  }

  return selected;
}

function resolveAppliedDegradations(
  rule: SectorRuleSet,
  signals: SectorSignals,
  actionResolutions: Record<SectorActionKey, SectorRecommendedCta>,
): AppliedDegradation[] {
  return rule.degradationRules.flatMap((degradationRule) => {
    const triggeredBy = new Set<string>();

    for (const path of degradationRule.whenMissingPaths ?? []) {
      if (signals.missingPaths.includes(path)) {
        triggeredBy.add(path);
      }
    }

    for (const actionKey of degradationRule.whenUnavailableActions ?? []) {
      if (actionResolutions[actionKey].availability === 'unavailable') {
        triggeredBy.add(`action:${actionKey}`);
      }
    }

    for (const signal of degradationRule.whenMissingSignals ?? []) {
      const hasSignal =
        signals.imageSignals.includes(signal) ||
        signals.trustSignals.includes(signal) ||
        signals.offerSignals.includes(signal);

      if (!hasSignal) {
        triggeredBy.add(`signal:${signal}`);
      }
    }

    if (triggeredBy.size === 0) {
      return [];
    }

    return [
      {
        ruleId: degradationRule.id,
        triggeredBy: [...triggeredBy],
        guidance: degradationRule.guidance,
        fallbackActions: (degradationRule.fallbackActions ?? []).filter(
          (actionKey) => actionResolutions[actionKey].availability !== 'unavailable',
        ),
      },
    ];
  });
}

function buildReasoning(
  selection: ReturnType<typeof selectSector>,
  rule: SectorRuleSet,
  primaryCta: SectorRecommendedCta,
) {
  const reasoning = [
    `Selected ${rule.label} with score ${selection.top.score}.`,
  ];

  if (selection.top.matchedSignals.length > 0) {
    reasoning.push(`Matched signals: ${selection.top.matchedSignals.join(', ')}.`);
  }

  if (selection.runnerUp && selection.runnerUp.score > 0) {
    reasoning.push(
      `Runner-up was ${SECTOR_RULES[selection.runnerUp.sectorType].label} at ${selection.runnerUp.score}.`,
    );
  }

  if (selection.fallbackUsed) {
    reasoning.push('Confidence was too weak for a more specific sector, so the engine fell back to Local Service.');
  } else if (selection.confidence === 'low' && selection.runnerUp) {
    reasoning.push('Signals are still somewhat mixed, so this sector should be treated as a low-confidence classification.');
  }

  reasoning.push(
    `Primary CTA resolves to ${primaryCta.label} with ${primaryCta.availability} availability.`,
  );

  return reasoning;
}

export function analyzeBusinessSector(record: BusinessMasterRecord): SectorProfileFile {
  const signals = buildSignals(record);
  const actionResolutions = buildActionResolutionMap(record);
  signals.availableSectorActions = SECTOR_ACTION_KEYS.filter(
    (actionKey) => actionResolutions[actionKey].availability !== 'unavailable',
  );

  const candidateScores = SECTOR_RULE_ORDER.map((sectorType) =>
    scoreSector(SECTOR_RULES[sectorType], signals, actionResolutions),
  );

  const selection = selectSector(candidateScores);
  const rule = SECTOR_RULES[selection.sectorType];
  const primaryCta = resolveRecommendedPrimaryCta(rule, actionResolutions);
  const secondaryCtas = resolveRecommendedSecondaryCtas(rule, primaryCta, actionResolutions);
  const appliedDegradations = resolveAppliedDegradations(rule, signals, actionResolutions);

  return {
    schemaVersion: 1,
    fileKind: 'sector-profile',
    businessSlug: record.brief.identity.slug,
    updatedAt: new Date().toISOString(),
    sectorType: selection.sectorType,
    sectorConfidence: selection.confidence,
    sectorScore: selection.top.score,
    fallbackUsed: selection.fallbackUsed,
    reasoning: buildReasoning(selection, rule, primaryCta),
    candidateScores: [...selection.sorted],
    signals: {
      niche: signals.niche,
      primaryCategory: signals.primaryCategory,
      secondaryCategories: signals.secondaryCategories,
      serviceModes: signals.serviceModes,
      offerSignals: signals.offerSignals,
      availableRenderActions: signals.availableRenderActions,
      availableSectorActions: signals.availableSectorActions,
      imageSignals: signals.imageSignals,
      trustSignals: signals.trustSignals,
      missingPaths: signals.missingPaths,
    },
    rules: {
      label: rule.label,
      description: rule.description,
      conversionFocus: rule.conversionFocus,
      primaryCtaPriority: [...rule.primaryCtaPriority],
      secondaryCtaPriority: [...rule.secondaryCtaPriority],
      recommendedHeroType: rule.recommendedHeroType,
      recommendedSections: [...rule.recommendedSections],
      recommendedTrustSystems: [...rule.recommendedTrustSystems],
      recommendedGallerySystems: [...rule.recommendedGallerySystems],
      recommendedTone: [...rule.recommendedTone],
      degradationRules: [...rule.degradationRules],
      schemaHints: {
        preferredSchemaTypes: [...rule.schemaHints.preferredSchemaTypes],
        prioritySignals: [...rule.schemaHints.prioritySignals],
        keywordPatterns: [...rule.schemaHints.keywordPatterns],
        doNotInvent: [...rule.schemaHints.doNotInvent],
      },
    },
    recommendedPrimaryCta: primaryCta,
    recommendedSecondaryCtas: secondaryCtas,
    appliedDegradations,
  };
}

export function validateSectorProfile(profile: SectorProfileFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (profile.candidateScores.length === 0) {
    issues.push({
      path: 'candidateScores',
      severity: 'error',
      message: 'Sector profile must include at least one candidate score.',
    });
  }

  if (profile.recommendedPrimaryCta.availability === 'unavailable') {
    issues.push({
      path: 'recommendedPrimaryCta',
      severity: 'error',
      message: 'Primary CTA cannot be unavailable.',
    });
  }

  const chosenCandidate = profile.candidateScores.find((candidate) => candidate.sectorType === profile.sectorType);
  if (!chosenCandidate) {
    issues.push({
      path: 'sectorType',
      severity: 'error',
      message: 'Chosen sector type must exist in candidate scores.',
    });
  }

  const duplicateSecondary = new Set<string>();
  for (const cta of profile.recommendedSecondaryCtas) {
    if (duplicateSecondary.has(cta.actionKey)) {
      issues.push({
        path: `recommendedSecondaryCtas.${cta.actionKey}`,
        severity: 'warning',
        message: `Secondary CTA "${cta.actionKey}" is duplicated.`,
      });
      continue;
    }

    duplicateSecondary.add(cta.actionKey);
  }

  return issues;
}

export function assertValidSectorProfile(profile: SectorProfileFile) {
  const issues = validateSectorProfile(profile);
  const errors = issues.filter((issue) => issue.severity === 'error');

  if (errors.length === 0) {
    return profile;
  }

  throw new Error(
    ['Sector profile validation failed:', ...errors.map((issue) => `- ${issue.path}: ${issue.message}`)].join('\n'),
  );
}
