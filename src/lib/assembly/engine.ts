import { resolveContentActionHref } from '../business/master-record.ts';
import type { BusinessBrief, FeaturedItem, ImageAsset } from '../../types/business';
import type { BusinessMasterRecord, ContentPriority, ContentSectionId, ConversionActionKey } from '../../types/business-record';
import type { CopyProfileFile } from '../../types/copy-engine';
import type { SectorProfileFile } from '../../types/sector-engine';
import type { VisualProfileFile } from '../../types/visual-engine';
import type {
  AssemblyActionPlacement,
  AssemblyActionPlacementMap,
  AssemblyDegradation,
  AssemblyFooterLink,
  AssemblyPopularCard,
  AssemblyProfileFile,
  AssemblyRenderImage,
  AssemblyResolvedAction,
  AssemblySectionDecision,
} from '../../types/assembly-engine';

interface PresetRouteSummary {
  slug: string;
  businessSlug: string;
  isDefault?: boolean;
}

interface AnalyzeBusinessAssemblyOptions {
  business: BusinessBrief;
  record: BusinessMasterRecord;
  sectorProfile: SectorProfileFile;
  visualProfile: VisualProfileFile;
  copyProfile: CopyProfileFile;
  presets: PresetRouteSummary[];
}

const SECTION_ANCHORS: Record<ContentSectionId, string> = {
  hero: '#top',
  'popular-items': '#popular-items',
  services: '#menu',
  credibility: '#reviews',
  about: '#service-options',
  gallery: '#gallery',
  faq: '#faq',
  cta: '#location',
  footer: '#footer',
};

const CTA_BLOCK_ORDER: Record<AssemblyActionPlacement, ConversionActionKey[]> = {
  hero: ['get-directions', 'view-menu', 'call', 'visit-website', 'email', 'whatsapp', 'order-online'],
  'final-cta': ['get-directions', 'call', 'view-menu', 'visit-website', 'email', 'whatsapp', 'order-online'],
};

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function getSectionPlan(record: BusinessMasterRecord, id: ContentSectionId) {
  return record.contentPlan.recommendedSections?.find((section) => section.id === id) ?? null;
}

function getSectionPriority(record: BusinessMasterRecord, id: ContentSectionId): ContentPriority {
  return getSectionPlan(record, id)?.priority ?? 'medium';
}

function getSectionReason(record: BusinessMasterRecord, id: ContentSectionId, fallback: string) {
  return getSectionPlan(record, id)?.reason ?? fallback;
}

function toRenderImage(asset: ImageAsset, quality: AssemblyRenderImage['quality'], reason: string): AssemblyRenderImage {
  return {
    ...asset,
    quality,
    reason,
  };
}

function buildImageLookups(record: BusinessMasterRecord, business: BusinessBrief) {
  const imageAssetLookup = new Map(business.imageAssets.map((asset) => [asset.id, asset]));
  const imageMapLookup = new Map(record.imageMap.assets.map((asset) => [asset.id, asset]));

  return { imageAssetLookup, imageMapLookup };
}

function pickImageById(
  imageId: string | null | undefined,
  lookups: ReturnType<typeof buildImageLookups>,
  reason: string,
): AssemblyRenderImage | null {
  if (!imageId) return null;

  const asset = lookups.imageAssetLookup.get(imageId);
  const imageMapAsset = lookups.imageMapLookup.get(imageId);

  if (!asset || !imageMapAsset) return null;

  return toRenderImage(asset, imageMapAsset.quality, reason);
}

function buildAvailableActions(
  record: BusinessMasterRecord,
  sectorProfile: SectorProfileFile,
  copyProfile: CopyProfileFile,
): AssemblyResolvedAction[] {
  const actions = new Map<string, AssemblyResolvedAction>();

  const registerAction = (
    key: string,
    label: string,
    source: AssemblyResolvedAction['source'],
    reason: string,
    renderActionKey?: ConversionActionKey | null,
  ) => {
    const resolvedHref = renderActionKey ? resolveContentActionHref(record, renderActionKey) : null;
    if (!resolvedHref) return;

    const existing = actions.get(key);
    const sourceRank: Record<AssemblyResolvedAction['source'], number> = {
      'content-plan': 3,
      'sector-profile': 2,
      fallback: 1,
    };

    if (existing && sourceRank[existing.source] >= sourceRank[source]) {
      return;
    }

    actions.set(key, {
      key,
      renderActionKey: renderActionKey ?? null,
      label,
      href: resolvedHref,
      availability: source === 'fallback' ? 'fallback' : 'available',
      source,
      reason,
    });
  };

  registerAction(
    record.contentPlan.primaryCta.key,
    copyProfile.ctaRules.primary.label || record.contentPlan.primaryCta.label,
    'content-plan',
    record.contentPlan.primaryCta.reason,
    record.contentPlan.primaryCta.key,
  );

  for (const cta of record.contentPlan.secondaryCtas ?? []) {
    const copyMatch = copyProfile.ctaRules.secondary.find((item) => item.actionKey === cta.key);
    registerAction(cta.key, copyMatch?.label ?? cta.label, 'content-plan', cta.reason, cta.key);
  }

  registerAction(
    sectorProfile.recommendedPrimaryCta.actionKey,
    copyProfile.ctaRules.primary.label || sectorProfile.recommendedPrimaryCta.label,
    sectorProfile.recommendedPrimaryCta.availability === 'available' ? 'sector-profile' : 'fallback',
    sectorProfile.recommendedPrimaryCta.reason,
    sectorProfile.recommendedPrimaryCta.renderActionKey ?? null,
  );

  for (const cta of sectorProfile.recommendedSecondaryCtas) {
    const copyMatch = copyProfile.ctaRules.secondary.find((item) => item.actionKey === cta.renderActionKey);
    registerAction(
      cta.actionKey,
      copyMatch?.label ?? cta.label,
      cta.availability === 'available' ? 'sector-profile' : 'fallback',
      cta.reason,
      cta.renderActionKey ?? null,
    );
  }

  for (const fallback of record.contentPlan.fallbackRules ?? []) {
    const href = resolveContentActionHref(record, fallback.useActionKey);
    if (!href) continue;

    registerAction(
      fallback.useActionKey,
      fallback.useActionKey === 'get-directions'
        ? 'Get Directions'
        : fallback.useActionKey === 'view-menu'
          ? 'View Menu'
          : fallback.useActionKey === 'call'
            ? 'Call'
            : fallback.useActionKey,
      'fallback',
      fallback.reason,
      fallback.useActionKey,
    );
  }

  return [...actions.values()];
}

function pickActionForPlacement(
  placement: AssemblyActionPlacement,
  availableActions: AssemblyResolvedAction[],
  primaryAction: AssemblyResolvedAction | null,
): AssemblyActionPlacementMap {
  const preferredOrder = CTA_BLOCK_ORDER[placement];
  const hidden = availableActions.filter((action) => action !== primaryAction);
  const secondary =
    hidden
      .slice()
      .sort(
        (left, right) => preferredOrder.indexOf((left.renderActionKey ?? left.key) as ConversionActionKey) -
          preferredOrder.indexOf((right.renderActionKey ?? right.key) as ConversionActionKey),
      )[0] ?? null;

  return {
    primary: primaryAction,
    secondary,
    hidden: hidden.filter((action) => action !== secondary),
    reason:
      placement === 'hero'
        ? 'Lead with the strongest truthful action and keep one quieter backup near the top.'
        : 'Close with the strongest truthful action and one practical follow-up.',
  };
}

function createSectionDecision(
  id: ContentSectionId,
  show: boolean,
  reason: string,
  triggeredBy: string[],
  priority: ContentPriority,
  mode: AssemblySectionDecision['mode'] = show ? 'full' : 'hidden',
): AssemblySectionDecision {
  return {
    id,
    anchor: SECTION_ANCHORS[id],
    show,
    mode,
    priority,
    reason,
    triggeredBy,
  };
}

function createPopularCards(
  business: BusinessBrief,
  selectedImages: AssemblyRenderImage[],
): AssemblyPopularCard[] {
  const featuredItems = business.featuredItems.length > 0 ? business.featuredItems : [];
  const imageLookup = new Map(selectedImages.map((image) => [image.id, image]));

  if (featuredItems.length > 0) {
    return featuredItems.slice(0, 3).map((item) => ({
      eyebrow: item.accent ?? 'Popular pick',
      title: item.title,
      body: item.summary,
      image: findImageForFeaturedItem(item, imageLookup),
      reason: 'Featured items are confirmed in the brief and chosen early for fast scanning.',
    }));
  }

  return business.services.slice(0, 3).map((item, index) => ({
    eyebrow: item.accent ?? `Pick 0${index + 1}`,
    title: item.priceLabel ?? item.title,
    body: item.summary,
    image: selectedImages[index] ?? null,
    reason: 'Service highlights are used because featured item detail is thin.',
  }));
}

function findImageForFeaturedItem(
  item: FeaturedItem,
  imageLookup: Map<string, AssemblyRenderImage>,
): AssemblyRenderImage | null {
  if (!item.imageSrc) return null;
  const match = [...imageLookup.values()].find((image) => image.src === item.imageSrc || image.alt === item.imageAlt);
  return match ?? null;
}

function buildFooterLinks(sectionDecisions: AssemblySectionDecision[]): AssemblyFooterLink[] {
  const links: Array<[ContentSectionId, string]> = [
    ['hero', 'Top'],
    ['services', 'Menu'],
    ['credibility', 'Reviews'],
    ['about', 'Service Options'],
    ['gallery', 'Gallery'],
    ['cta', 'Location'],
  ];
  const decisionLookup = new Map(sectionDecisions.map((decision) => [decision.id, decision]));

  return links.map(([id, label]) => {
    const decision = decisionLookup.get(id);

    return {
      label,
      href: SECTION_ANCHORS[id],
      enabled: Boolean(decision?.show),
      reason: decision?.reason ?? 'Section is not part of the current assembly.',
    };
  });
}

function toNaturalList(items: string[]) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function normalizeTrustSignal(value: string) {
  const trimmed = value.trim().replace(/[.]+$/u, '');
  if (!trimmed) return trimmed;

  return `${trimmed[0].toLowerCase()}${trimmed.slice(1)}`;
}

function getLocationLead(business: BusinessBrief) {
  return business.address?.split(',')[0]?.trim() || business.city;
}

function buildAssemblyDegradations(
  business: BusinessBrief,
  sectorProfile: SectorProfileFile,
  visualProfile: VisualProfileFile,
  copyProfile: CopyProfileFile,
  galleryImages: AssemblyRenderImage[],
): AssemblyDegradation[] {
  const sector = sectorProfile.appliedDegradations.map<AssemblyDegradation>((rule) => ({
    id: rule.ruleId,
    source: 'sector',
    triggeredBy: rule.triggeredBy,
    guidance: rule.guidance,
    adjustments: rule.fallbackActions,
  }));

  const visual = visualProfile.appliedFallbacks.map<AssemblyDegradation>((rule) => ({
    id: rule.ruleId,
    source: 'visual',
    triggeredBy: rule.triggeredBy,
    guidance: rule.guidance,
    adjustments: rule.adjustments,
  }));

  const copy = copyProfile.degradationCopyRules.map<AssemblyDegradation>((rule) => ({
    id: rule.ruleId,
    source: 'copy',
    triggeredBy: rule.triggeredBy,
    guidance: rule.guidance,
    adjustments: rule.adjustments,
  }));

  const assembly: AssemblyDegradation[] = [];

  if (!business.menuUrl) {
    assembly.push({
      id: 'assembly-on-page-menu',
      source: 'assembly',
      triggeredBy: ['contact.menuUrl'],
      guidance: 'Keep the menu action anchored to on-page highlights and services when no verified external menu exists.',
      adjustments: ['link View Menu to #menu', 'promote popular items before deeper sections'],
    });
  }

  if (business.realReviews.length === 0) {
    assembly.push({
      id: 'assembly-theme-trust-only',
      source: 'assembly',
      triggeredBy: ['trust.testimonials'],
      guidance: 'Use rating and review themes instead of quoted testimonials when no direct quotes are verified.',
      adjustments: ['rating panel first', 'theme list instead of quote cards'],
    });
  }

  if (galleryImages.length < 4) {
    assembly.push({
      id: 'assembly-compact-gallery',
      source: 'assembly',
      triggeredBy: ['image-selection:gallery-count'],
      guidance: 'Tighten the gallery when approved image variety is limited.',
      adjustments: ['show fewer frames', 'keep the layout dish-led'],
    });
  }

  if (business.openingHours.length === 0) {
    assembly.push({
      id: 'assembly-hours-hidden',
      source: 'assembly',
      triggeredBy: ['location.openingHours'],
      guidance: 'Do not surface opening hours until they are verified.',
      adjustments: ['remove hours labels', 'prefer directions and call'],
    });
  }

  return [...sector, ...visual, ...copy, ...assembly];
}

function getPresetRoutePolicy(businessSlug: string, presets: PresetRouteSummary[]) {
  const businessPresets = presets.filter((preset) => preset.businessSlug === businessSlug);
  const defaultPreset = businessPresets.find((preset) => preset.isDefault) ?? null;

  return {
    defaultPresetSlug: defaultPreset?.slug ?? null,
    routePolicy: {
      primaryPath: '/',
      demoPathPrefix: '/demo/',
      indexablePresetSlugs: businessPresets.filter((preset) => preset.isDefault).map((preset) => preset.slug),
      noindexPresetSlugs: businessPresets.filter((preset) => !preset.isDefault).map((preset) => preset.slug),
    },
  };
}

export function analyzeBusinessAssembly({
  business,
  record,
  sectorProfile,
  visualProfile,
  copyProfile,
  presets,
}: AnalyzeBusinessAssemblyOptions): AssemblyProfileFile {
  const routePolicy = getPresetRoutePolicy(business.slug, presets);
  const lookups = buildImageLookups(record, business);
  const selectedHeroMainId =
    record.imageMap.selection?.heroMainAssetId ??
    record.imageMap.assets.find((asset) => asset.roles?.includes('hero'))?.id ??
    business.primaryImage?.id ??
    null;
  const heroMain = pickImageById(
    selectedHeroMainId,
    lookups,
    'Selected as the best opening image from the current approved asset set.',
  );
  const selectedDishIds = record.imageMap.selection?.dishAssetIds ?? [];
  const heroSupport = pickImageById(
    selectedDishIds[0] ?? record.imageMap.selection?.heroAlternateAssetIds?.[0] ?? business.galleryAssets[0]?.id ?? null,
    lookups,
    'Used as the single supporting food detail beside the hero.',
  );
  const popularImages = selectedDishIds
    .map((id) => pickImageById(id, lookups, 'Chosen for highlights because it supports a confirmed featured item or menu cue.'))
    .filter((item): item is AssemblyRenderImage => Boolean(item));
  const baseGalleryIds = record.imageMap.selection?.galleryAssetIds ?? [];
  const ambienceIds = record.imageMap.selection?.ambienceAssetIds ?? [];
  const galleryCandidateIds = unique([
    ...baseGalleryIds,
    ...(baseGalleryIds.length >= 3 ? [] : ambienceIds),
  ]).filter((id, _index, items) => !(id === selectedHeroMainId && items.length > 1));
  const galleryLimit = galleryCandidateIds.length < 4 && selectedDishIds.length > 0 ? 2 : visualProfile.family.gallery.maxImages;
  const galleryImages = galleryCandidateIds
    .map((id) => pickImageById(id, lookups, 'Approved for the gallery because it adds variety without redundancy.'))
    .filter((item): item is AssemblyRenderImage => Boolean(item))
    .slice(0, galleryLimit);
  const fallbackImage = pickImageById(
    record.imageMap.selection?.fallbackAssetId ?? business.galleryAssets[0]?.id ?? null,
    lookups,
    'Reserved as the safest visual fallback if a stronger slot is unavailable.',
  );

  const availableActions = buildAvailableActions(record, sectorProfile, copyProfile);
  const primaryAction =
    availableActions.find((action) => action.key === record.contentPlan.primaryCta.key) ??
    availableActions.find((action) => action.key === sectorProfile.recommendedPrimaryCta.actionKey) ??
    availableActions[0] ??
    null;
  const heroActions = pickActionForPlacement('hero', availableActions, primaryAction);
  const finalCtaActions = pickActionForPlacement('final-cta', availableActions, primaryAction);

  const trustSignals = (business.reviewHighlights.length > 0 ? business.reviewHighlights : business.proofPoints).slice(0, 4);
  const normalizedTrustSignals = trustSignals.map(normalizeTrustSignal).filter(Boolean);
  const visitDetails = [business.display.location, business.phone, business.serviceModes.join(' / ')].filter(
    (detail): detail is string => Boolean(detail),
  );
  const aboutHasOperationalDepth =
    business.openingHours.length > 0 ||
    Boolean(business.website || business.email) ||
    business.socialLinks.length > 0 ||
    (record.brief.contact.externalPlatforms?.length ?? 0) > 0;
  const showAbout = (business.serviceModes.length > 0 || Boolean(business.address)) && (aboutHasOperationalDepth || !business.address || !primaryAction);
  const ratingValue =
    typeof business.ratingValue === 'number' ? business.ratingValue.toFixed(1) : String(business.services.length).padStart(2, '0');
  const ratingContext =
    typeof business.reviewCount === 'number'
      ? `Based on ${business.reviewCount} reviews.`
      : 'Built around the strongest local trust signals available.';
  const trustBody =
    typeof business.reviewCount === 'number'
      ? normalizedTrustSignals.length > 0
        ? `${ratingValue} from ${business.reviewCount} reviews. People repeatedly mention ${toNaturalList(
            normalizedTrustSignals.slice(0, 3),
          )}.`
        : `${ratingValue} from ${business.reviewCount} reviews.`
      : 'A short trust read based on the clearest local signals available.';

  const popularCards = createPopularCards(business, popularImages);
  const showPopularItems = popularCards.length > 0;
  const sectionDecisions: AssemblySectionDecision[] = [
    createSectionDecision(
      'hero',
      true,
      getSectionReason(record, 'hero', 'The hero always anchors the landing with the clearest local offer and CTA.'),
      ['content-plan:hero', `sector:${sectorProfile.sectorType}`],
      getSectionPriority(record, 'hero'),
    ),
    createSectionDecision(
      'popular-items',
      showPopularItems,
      showPopularItems
        ? getSectionReason(record, 'popular-items', 'Early highlights help the user scan confirmed dishes fast.')
        : 'No reliable highlight set is available, so the landing skips the early popular-items band.',
      showPopularItems ? ['content-plan:popular-items', 'offer:featured-items'] : ['offer:featured-items'],
      getSectionPriority(record, 'popular-items'),
    ),
    createSectionDecision(
      'services',
      business.services.length > 0,
      business.services.length > 0
        ? getSectionReason(record, 'services', 'Structured offer items are available, so the menu section stays visible.')
        : 'The structured offer is too thin for a services block.',
      business.services.length > 0 ? ['content-plan:services', 'offer:services'] : ['offer:services'],
      getSectionPriority(record, 'services'),
    ),
    createSectionDecision(
      'credibility',
      trustSignals.length > 0 || Boolean(business.ratingValue && business.reviewCount),
      getSectionReason(record, 'credibility', 'Trust stays visible because verified ratings or repeated review themes exist.'),
      ['content-plan:credibility', 'trust:rating-reviews'],
      getSectionPriority(record, 'credibility'),
    ),
    createSectionDecision(
      'about',
      showAbout,
      showAbout
        ? getSectionReason(record, 'about', 'Service modes and visit context add something distinct beyond the main CTA.')
        : 'The current brief does not add enough operational depth to justify a separate service-options block.',
      showAbout ? ['service-modes', 'location', 'operations-depth'] : ['service-modes', 'location', 'cta:primary'],
      getSectionPriority(record, 'about'),
    ),
    createSectionDecision(
      'gallery',
      galleryImages.length > 0,
      galleryImages.length > 0
        ? getSectionReason(record, 'gallery', 'Approved real images are available, so the gallery can reinforce appetite and trust.')
        : 'The image set is too thin for a standalone gallery.',
      galleryImages.length > 0 ? ['image-map:gallery', `layout:${visualProfile.family.gallery.layout}`] : ['image-map:gallery'],
      getSectionPriority(record, 'gallery'),
      galleryImages.length > 0 && galleryImages.length < 4 ? 'compact' : galleryImages.length > 0 ? 'full' : 'hidden',
    ),
    createSectionDecision(
      'faq',
      business.faqItems.length >= 2,
      business.faqItems.length >= 2
        ? getSectionReason(record, 'faq', 'The FAQ answers practical first-visit questions and earns its place.')
        : 'The FAQ does not have enough useful answers to stay visible.',
      business.faqItems.length >= 2 ? ['faq:utility'] : ['faq:utility'],
      getSectionPriority(record, 'faq'),
    ),
    createSectionDecision(
      'cta',
      Boolean(primaryAction),
      primaryAction
        ? getSectionReason(record, 'cta', 'Close with the strongest truthful next step and practical contact details.')
        : 'No trustworthy action is available, so the final CTA is suppressed.',
      primaryAction ? ['cta:primary', primaryAction.key] : ['cta:primary'],
      getSectionPriority(record, 'cta'),
    ),
    createSectionDecision(
      'footer',
      true,
      getSectionReason(record, 'footer', 'The footer should reinforce location and one clean trust summary.'),
      ['footer'],
      getSectionPriority(record, 'footer'),
    ),
  ];

  const galleryMode = galleryImages.length > 0 && galleryImages.length < 4 ? 'compact' : 'standard';
  const footerProof =
    business.serviceModes.length > 0 ? business.serviceModes.slice(0, 3) : business.reviewHighlights.slice(0, 3);

  return {
    schemaVersion: 1,
    fileKind: 'assembly-profile',
    businessSlug: business.slug,
    updatedAt: new Date().toISOString(),
    page: routePolicy,
    context: {
      sectorType: sectorProfile.sectorType,
      visualFamily: visualProfile.visualFamily,
      recommendedTone: copyProfile.recommendedTone.primary,
      conversionGoal: record.contentPlan.primaryGoal,
    },
    visibility: {
      sections: sectionDecisions,
    },
    ctaMap: {
      availableActions,
      hero: heroActions,
      finalCta: finalCtaActions,
    },
    images: {
      heroMain,
      heroSupport,
      popularItems: popularImages,
      gallery: galleryImages,
      fallback: fallbackImage,
    },
    content: {
      heroSupport: {
        eyebrow: popularCards[0]?.eyebrow ?? 'First pick',
        title: popularCards[0]?.title ?? business.businessName,
        body: popularCards[0]?.body ?? business.heroSignature,
      },
      popularItems: {
        title: 'Start with the plates people notice first.',
        body: business.menuUrl
          ? 'A short read of the dishes that help you decide quickly.'
          : 'A quick food-first scan before you head over or call.',
        cards: popularCards,
      },
      trust: {
        mode: business.realReviews.length > 0 ? 'testimonial-led' : business.reviewHighlights.length > 0 ? 'rating-and-themes' : 'proof-points',
        title: 'A strong local rating, backed by what people mention most.',
        body: trustBody,
        ratingValue,
        ratingContext,
        signals: trustSignals,
        visitDetails,
      },
      gallery: {
        title: galleryMode === 'compact' ? 'A tighter look at a few more plates.' : 'What the food actually looks like.',
        body:
          galleryMode === 'compact'
            ? 'Trimmed down to the images that still add something new.'
            : 'Real dishes, chosen to make the food feel immediate.',
        noteTitle: visualProfile.appliedFallbacks.some((rule) => rule.ruleId.includes('no-exterior'))
          ? 'Food-first gallery'
          : 'At the table',
        noteBody:
          visualProfile.appliedFallbacks.some((rule) => rule.ruleId.includes('no-exterior'))
            ? 'No storefront image is verified yet, so the gallery stays tightly focused on the food.'
            : business.photographyStyle,
        mode: galleryMode,
      },
      location: {
        eyebrow: 'Location & contact',
        title: `Find ${business.businessName} on ${getLocationLead(business)}.`,
        body:
          business.openingHours.length > 0
            ? 'Directions, phone, and opening hours are all here when you are ready to stop in or call ahead.'
            : 'Get directions, call ahead, and keep the practical details in one place.',
        visitLabel: 'Visit',
        visitValue: business.display.location,
        supportLabel: 'Service modes',
        supportValue: business.serviceModes.length > 0 ? business.serviceModes.join(' / ') : business.primaryCategory ?? 'Call for details',
        supportNote: business.orderUrl ? 'Order online available.' : 'Call ahead if you want to confirm pickup or delivery details.',
      },
      footerSummary:
        business.openingHours.length > 0
          ? `${business.primaryCategory ?? 'Local business'} in ${business.city}, with verified service details and a clear next step.`
          : `${business.primaryCategory ?? 'Local business'} in ${business.city}, with directions, phone, and the clearest first picks.`,
      footerProof,
    },
    navigation: {
      footerLinks: buildFooterLinks(sectionDecisions),
    },
    degradations: buildAssemblyDegradations(business, sectorProfile, visualProfile, copyProfile, galleryImages),
    diagnostics: {
      hiddenSections: sectionDecisions.filter((section) => !section.show).map((section) => section.id),
      suppressedClaims: unique(copyProfile.contentConstraints.forbiddenClaims),
      ghostsAvoided: [
        'No CTA is rendered without a real href.',
        'No hidden section keeps a live footer link.',
        'No menu URL is implied when only on-page highlights exist.',
        'No testimonial quote UI appears when direct quotes are absent.',
      ],
    },
  };
}

export function assertValidAssemblyProfile(profile: AssemblyProfileFile) {
  if (profile.fileKind !== 'assembly-profile') {
    throw new Error('Assembly profile must use fileKind "assembly-profile".');
  }

  if (!profile.businessSlug) {
    throw new Error('Assembly profile must include businessSlug.');
  }

  if (!profile.visibility.sections.some((section) => section.id === 'hero' && section.show)) {
    throw new Error('Assembly profile must keep the hero visible.');
  }

  if (profile.ctaMap.hero.primary && !profile.ctaMap.hero.primary.href) {
    throw new Error('Hero primary CTA must resolve to a usable href.');
  }

  return profile;
}
