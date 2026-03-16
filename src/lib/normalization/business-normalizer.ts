import type {
  BusinessBriefFile,
  BusinessRawFile,
  ContentPlanFile,
  ConversionActionKey,
  ExternalPlatformLink,
  MissingDataFile,
  RawFeaturedItem,
  RawOfferCategory,
} from '../../types/business-record';
import type {
  FaqItem,
  OpeningHoursItem,
  ReviewItem,
  ServiceItem,
} from '../../types/business';
import type {
  LoadedBusinessInputContext,
  NormalizationResult,
  ReconciledField,
  ReconciliationReportFile,
} from '../../types/business-normalization';
import {
  actionGoalFromKey,
  actionKeyFromDesiredPrimaryCta,
  buildBusinessSources,
  buildDefaultHeroSignature,
  buildDefaultSeoDescription,
  buildDefaultSeoTitle,
  buildDefaultShortDescription,
  buildDefaultTagline,
  buildFallbackFeaturedItems,
  buildFallbackServicesFromMenu,
  buildMissingDataItems,
  buildPlannedCta,
  buildProofPoints,
  buildSectionPlan,
  CTA_LABELS,
  fieldStateForCandidate,
  getImageSourceFolder,
  getManualFieldState,
  getSampleLabel,
  getSourceLabel,
  makeCandidate,
  manifestWarningsAsValidationIssues,
  pickFirstNonEmpty,
  resolveField,
  resolvePrimaryCta,
  seedConfirmsPath,
  SOURCE_PRIORITY,
  summarizeStates,
  uniqueStrings,
} from './reconcile.ts';

export function normalizeBusinessInput(context: LoadedBusinessInputContext): NormalizationResult {
  const manual = context.manualProfile;
  const seed = context.seed;
  const confirmedData = seed?.confirmedData ?? [];
  const now = new Date().toISOString();

  const explicit = (pathKey: string) => getManualFieldState(manual, pathKey);
  const manualCandidate = <T>(pathKey: string, value: T | null | undefined) =>
    makeCandidate('manual-profile', value, fieldStateForCandidate(explicit(pathKey)));
  const seedCandidate = <T>(pathKey: string, value: T | null | undefined) =>
    makeCandidate('intake-seed', value, seedConfirmsPath(confirmedData, pathKey) ? 'verified' : 'inferred');
  const resolve = <T>(pathKey: string, emptyReason: string, candidates: Array<ReturnType<typeof makeCandidate<T>>>) =>
    resolveField<T>({
      path: pathKey,
      explicitState: explicit(pathKey),
      emptyReason,
      candidates,
    });

  const businessName = resolve('identity.businessName', 'Business name is required but was not found in the source set.', [
    manualCandidate('identity.businessName', manual?.identity?.businessName),
    seedCandidate('identity.businessName', seed?.businessName),
  ]);
  const slug = resolve('identity.slug', 'Business slug is required but was not found in the source set.', [
    manualCandidate('identity.slug', manual?.identity?.slug),
    seedCandidate('identity.slug', seed?.slug ?? context.slug),
  ]);
  const niche = resolve('identity.niche', 'Business niche is required but was not found in the source set.', [
    manualCandidate('identity.niche', manual?.identity?.niche),
    seedCandidate('identity.niche', seed?.niche),
  ]);
  const primaryCategory = resolve('identity.primaryCategory', 'Primary category is not available in the source set.', [
    manualCandidate('identity.primaryCategory', manual?.identity?.primaryCategory),
    seedCandidate('identity.primaryCategory', seed?.primaryCategory),
  ]);
  const secondaryCategories = resolve('identity.secondaryCategories', 'No secondary categories are available yet.', [
    manualCandidate('identity.secondaryCategories', manual?.identity?.secondaryCategories),
    seedCandidate('identity.secondaryCategories', seed?.secondaryCategories),
  ]);
  const city = resolve('location.city', 'City is required but was not found in the source set.', [
    manualCandidate('location.city', manual?.identity?.city),
    seedCandidate('location.city', seed?.city),
  ]);
  const country = resolve('location.country', 'Country is required but was not found in the source set.', [
    manualCandidate('location.country', manual?.identity?.country),
    seedCandidate('location.country', seed?.country),
  ]);
  const district = resolve('location.district', 'District is not stored in the current source set.', [
    manualCandidate('location.district', manual?.identity?.district),
  ]);
  const addressLine = resolve('location.addressLine', 'Street address is not stored in the current source set.', [
    manualCandidate('location.addressLine', manual?.identity?.addressLine),
  ]);
  const plusCode = resolve('location.plusCode', 'Plus code is not stored in the current source set.', [
    manualCandidate('location.plusCode', manual?.identity?.plusCode),
  ]);
  const coordinates = resolve<BusinessRawFile['identity']['coordinates']>(
    'location.coordinates',
    'Exact coordinates are not stored in the current source set.',
    [manualCandidate('location.coordinates', manual?.identity?.coordinates)],
  );
  const phone = resolve('contact.phone', 'Phone number is not stored in the current source set.', [
    manualCandidate('contact.phone', manual?.contact?.phone),
    seedCandidate('contact.phone', null),
  ]);
  const whatsapp = resolve('contact.whatsapp', 'No WhatsApp route has been verified yet.', [
    manualCandidate('contact.whatsapp', manual?.contact?.whatsapp),
  ]);
  const email = resolve('contact.email', 'No verified email address is stored in the source set.', [
    manualCandidate('contact.email', manual?.contact?.email),
  ]);
  const website = resolve('contact.website', 'No verified first-party website is stored in the source set.', [
    manualCandidate('contact.website', manual?.contact?.website),
  ]);
  const orderUrl = resolve('contact.orderUrl', 'No verified ordering URL is stored in the source set.', [
    manualCandidate('contact.orderUrl', manual?.contact?.orderUrl),
  ]);
  const menuUrl = resolve('contact.menuUrl', 'No verified external menu URL is stored in the source set.', [
    manualCandidate('contact.menuUrl', manual?.contact?.menuUrl),
  ]);
  const mapsUrl = resolve('contact.mapsUrl', 'No maps URL is stored in the source set.', [
    manualCandidate('contact.mapsUrl', manual?.contact?.mapsUrl),
    makeCandidate('maps-link-file', context.mapsLink, 'verified'),
    seedCandidate('contact.mapsUrl', seed?.mapsLink),
  ]);
  const socialLinks = resolve<string[]>('contact.socialLinks', 'No social links are stored in the source set.', [
    manualCandidate('contact.socialLinks', manual?.contact?.socialLinks),
  ]);
  const externalPlatforms = resolve<ExternalPlatformLink[]>(
    'contact.externalPlatforms',
    'No external platform links are stored in the source set.',
    [manualCandidate('contact.externalPlatforms', manual?.contact?.externalPlatforms)],
  );
  const openingHours = resolve<OpeningHoursItem[]>(
    'location.openingHours',
    'Opening hours are not stored in the source set.',
    [manualCandidate('location.openingHours', manual?.operations?.openingHours)],
  );
  const serviceModes = resolve<string[]>('offer.serviceModes', 'Service modes are not yet stored in the source set.', [
    manualCandidate('offer.serviceModes', manual?.offer?.serviceModes),
  ]);
  const categories = resolve<RawOfferCategory[]>('offer.categories', 'Offer categories are not yet stored in the source set.', [
    manualCandidate('offer.categories', manual?.offer?.categories),
    makeCandidate(
      'support-menu-summary',
      context.menuSummary?.categories.map((entry) => ({
        title: entry.categoryTitle,
        summary: `${entry.categoryTitle} are present in the current source set.`,
      })),
      'inferred',
    ),
  ]);
  const featuredItems = resolve<RawFeaturedItem[]>(
    'offer.featuredItems',
    'Featured items are not yet stored in the source set.',
    [
      manualCandidate('offer.featuredItems', manual?.offer?.featuredItems),
      makeCandidate('support-menu-summary', buildFallbackFeaturedItems(context.menuSummary), 'inferred'),
    ],
  );
  const services = resolve<ServiceItem[]>('offer.services', 'Service or menu grouping cards are not yet stored in the source set.', [
    manualCandidate('offer.services', manual?.offer?.services),
    makeCandidate('support-menu-summary', buildFallbackServicesFromMenu(context.menuSummary), 'inferred'),
  ]);

  const faqItems = resolve<FaqItem[]>('offer.faqItems', 'FAQ items are not yet stored in the source set.', [
    manualCandidate('offer.faqItems', manual?.offer?.faqItems),
  ]);
  const ratingValue = resolve<number>('trust.rating.value', 'Rating value is not stored in the source set.', [
    manualCandidate('trust.rating.value', manual?.trust?.ratingValue),
    makeCandidate(
      'support-review-summary',
      context.reviewSummary?.ratingValue,
      seedConfirmsPath(confirmedData, 'trust.rating.value') ? 'verified' : 'inferred',
    ),
  ]);
  const reviewCount = resolve<number>('trust.rating.reviewCount', 'Review count is not stored in the source set.', [
    manualCandidate('trust.rating.reviewCount', manual?.trust?.reviewCount),
    makeCandidate(
      'support-review-summary',
      context.reviewSummary?.reviewCount,
      seedConfirmsPath(confirmedData, 'trust.rating.reviewCount') ? 'verified' : 'inferred',
    ),
  ]);
  const reviewThemes = resolve<string[]>('trust.reviewThemes', 'Review themes are not stored in the source set.', [
    manualCandidate('trust.reviewThemes', manual?.trust?.reviewThemes),
    makeCandidate('support-review-summary', context.reviewSummary?.themes, 'inferred'),
  ]);
  const proofPoints = resolve<string[]>('trust.proofPoints', 'Proof points are not stored in the source set.', [
    manualCandidate('trust.proofPoints', manual?.trust?.proofPoints),
    makeCandidate(
      'inference',
      buildProofPoints(
        ratingValue.value ?? null,
        reviewCount.value ?? null,
        reviewThemes.value ?? [],
        serviceModes.value ?? [],
      ),
      'inferred',
    ),
  ]);
  const testimonials = resolve<ReviewItem[]>('trust.testimonials', 'No curated testimonial quotes are stored yet.', [
    manualCandidate('trust.testimonials', manual?.trust?.testimonials),
  ]);
  const credibilityRisks = resolve<string[]>('trust.credibilityRisks', 'No credibility risks are stored in the source set.', [
    manualCandidate('trust.credibilityRisks', manual?.trust?.credibilityRisks),
    makeCandidate('intake-notes', context.intakeNotes, 'inferred'),
  ]);
  const tagline = resolve('brand.tagline', 'Brand tagline is not yet prepared.', [
    manualCandidate('brand.tagline', manual?.brand?.tagline),
    makeCandidate(
      'inference',
      buildDefaultTagline(businessName.value ?? context.slug, primaryCategory.value ?? null, city.value ?? ''),
      'inferred',
    ),
  ]);
  const shortDescription = resolve('brand.shortDescription', 'Short description is not yet prepared.', [
    manualCandidate('brand.shortDescription', manual?.brand?.shortDescription),
    makeCandidate(
      'inference',
      buildDefaultShortDescription(
        businessName.value ?? context.slug,
        city.value ?? '',
        serviceModes.value ?? [],
        primaryCategory.value ?? null,
      ),
      'inferred',
    ),
  ]);
  const heroSignature = resolve('brand.heroSignature', 'Hero signature is not yet prepared.', [
    manualCandidate('brand.heroSignature', manual?.brand?.heroSignature),
    makeCandidate(
      'inference',
      buildDefaultHeroSignature(primaryCategory.value ?? null, featuredItems.value ?? [], city.value ?? ''),
      'inferred',
    ),
  ]);
  const brandHints = resolve<string[]>('brand.brandHints', 'Brand hints are not yet prepared.', [
    manualCandidate('brand.brandHints', manual?.brand?.brandHints),
    makeCandidate('inference', [primaryCategory.value ?? businessName.value ?? context.slug], 'inferred'),
  ]);
  const brandColors = resolve<string[]>('brand.brandColors', 'Brand colors are not yet prepared.', [
    manualCandidate('brand.brandColors', manual?.brand?.brandColors),
  ]);
  const toneHints = resolve<string[]>('brand.toneHints', 'Tone hints are not yet prepared.', [
    manualCandidate('brand.toneHints', manual?.brand?.toneHints),
    seedCandidate('brand.toneHints', seed?.desiredTone),
  ]);
  const visualMood = resolve('brand.visualMood', 'Visual mood is not yet prepared.', [
    manualCandidate('brand.visualMood', manual?.brand?.visualMood),
    makeCandidate('inference', `${businessName.value ?? context.slug} with a clear local feel.`, 'inferred'),
  ]);
  const desiredLuxuryLevel = resolve('brand.desiredLuxuryLevel', 'Desired luxury level is not yet prepared.', [
    manualCandidate('brand.desiredLuxuryLevel', manual?.brand?.desiredLuxuryLevel),
  ]);
  const visualIntensity = resolve('brand.visualIntensity', 'Visual intensity is not yet prepared.', [
    manualCandidate('brand.visualIntensity', manual?.brand?.visualIntensity),
  ]);
  const photographyStyle = resolve('brand.photographyStyle', 'Photography style is not yet prepared.', [
    manualCandidate('brand.photographyStyle', manual?.brand?.photographyStyle),
    makeCandidate('image-map', 'Use the current approved food photography as the baseline treatment.', 'inferred'),
  ]);
  const atmosphereKeywords = resolve<string[]>('brand.atmosphereKeywords', 'Atmosphere keywords are not yet prepared.', [
    manualCandidate('brand.atmosphereKeywords', manual?.brand?.atmosphereKeywords),
    makeCandidate('inference', [city.value, primaryCategory.value].filter(Boolean) as string[], 'inferred'),
  ]);
  const preferredContrast = resolve('brand.preferredContrast', 'Preferred contrast is not yet prepared.', [
    manualCandidate('brand.preferredContrast', manual?.brand?.preferredContrast),
  ]);
  const sectionDensityPreference = resolve('brand.sectionDensityPreference', 'Section density preference is not yet prepared.', [
    manualCandidate('brand.sectionDensityPreference', manual?.brand?.sectionDensityPreference),
  ]);
  const materialFinish = resolve('brand.materialFinish', 'Material finish is not yet prepared.', [
    manualCandidate('brand.materialFinish', manual?.brand?.materialFinish),
  ]);
  const imageTreatment = resolve('brand.imageTreatment', 'Image treatment is not yet prepared.', [
    manualCandidate('brand.imageTreatment', manual?.brand?.imageTreatment),
  ]);
  const seoTitle = resolve('seo.title', 'SEO title is not yet prepared.', [
    manualCandidate('seo.title', manual?.seo?.title),
    makeCandidate(
      'inference',
      buildDefaultSeoTitle(businessName.value ?? context.slug, primaryCategory.value ?? null, city.value ?? ''),
      'inferred',
    ),
  ]);
  const seoDescription = resolve('seo.description', 'SEO description is not yet prepared.', [
    manualCandidate('seo.description', manual?.seo?.description),
    makeCandidate(
      'inference',
      buildDefaultSeoDescription(
        businessName.value ?? context.slug,
        primaryCategory.value ?? null,
        city.value ?? '',
        serviceModes.value ?? [],
        featuredItems.value ?? [],
      ),
      'inferred',
    ),
  ]);
  const areaServed = resolve<string[]>('seo.areaServed', 'Area served is not yet prepared.', [
    manualCandidate('seo.areaServed', manual?.seo?.areaServed),
    seedCandidate('seo.areaServed', city.value ? [city.value] : []),
  ]);
  const geoPrecision = resolve('seo.geoPrecision', 'Geo precision is not yet prepared.', [
    manualCandidate('seo.geoPrecision', manual?.seo?.geoPrecision),
  ]);
  const serviceType = resolve('seo.serviceType', 'Service type is not yet prepared.', [
    manualCandidate('seo.serviceType', manual?.seo?.serviceType),
    seedCandidate('seo.serviceType', seed?.primaryCategory),
  ]);
  const priceRange = resolve('seo.priceRange', 'Price range is not yet prepared.', [
    manualCandidate('seo.priceRange', manual?.seo?.priceRange),
  ]);
  const keywordHints = resolve<string[]>('seo.keywordHints', 'Keyword hints are not yet prepared.', [
    manualCandidate('seo.keywordHints', manual?.seo?.keywordHints),
    makeCandidate(
      'inference',
      [primaryCategory.value, businessName.value, city.value].filter(Boolean).map((item) => item!.toLowerCase()),
      'inferred',
    ),
  ]);
  const assetIds = resolve<string[]>('assets.assetIds', 'No assets are currently mapped.', [
    makeCandidate(
      'image-map',
      context.imageMap.assets.map((asset) => asset.id),
      'verified',
    ),
  ]);

  const fields: ReconciledField[] = [
    businessName,
    slug,
    niche,
    primaryCategory,
    secondaryCategories,
    city,
    country,
    district,
    addressLine,
    plusCode,
    coordinates,
    phone,
    whatsapp,
    email,
    website,
    orderUrl,
    menuUrl,
    mapsUrl,
    socialLinks,
    externalPlatforms,
    openingHours,
    serviceModes,
    categories,
    featuredItems,
    services,
    faqItems,
    ratingValue,
    reviewCount,
    reviewThemes,
    proofPoints,
    testimonials,
    credibilityRisks,
    tagline,
    shortDescription,
    heroSignature,
    brandHints,
    brandColors,
    toneHints,
    visualMood,
    desiredLuxuryLevel,
    visualIntensity,
    photographyStyle,
    atmosphereKeywords,
    preferredContrast,
    sectionDensityPreference,
    materialFinish,
    imageTreatment,
    seoTitle,
    seoDescription,
    areaServed,
    geoPrecision,
    serviceType,
    priceRange,
    keywordHints,
    assetIds,
  ];

  const resolvedBusinessName = businessName.value ?? context.slug;
  const resolvedSlug = slug.value ?? context.slug;
  const resolvedPrimaryCategory = primaryCategory.value ?? null;
  const resolvedCity = city.value ?? '';
  const resolvedCountry = country.value ?? '';
  const resolvedServiceModes = serviceModes.value ?? [];
  const resolvedFeaturedItems = featuredItems.value ?? [];
  const resolvedReviewThemes = reviewThemes.value ?? [];
  const resolvedProofPoints = proofPoints.value ?? [];

  const availableActions = new Set<ConversionActionKey>(['view-menu']);
  if (mapsUrl.value) availableActions.add('get-directions');
  if (orderUrl.value) availableActions.add('order-online');
  if (phone.value) availableActions.add('call');
  if (website.value) availableActions.add('visit-website');
  if (email.value) availableActions.add('email');
  if (whatsapp.value) availableActions.add('whatsapp');

  const desiredPrimaryAction = actionKeyFromDesiredPrimaryCta(seed?.desiredPrimaryCta);
  const primaryAction = resolvePrimaryCta(availableActions, desiredPrimaryAction);
  const secondaryActions = [
    primaryAction === 'view-menu' ? null : 'view-menu',
    primaryAction === 'call' || !phone.value ? null : 'call',
    primaryAction === 'get-directions' || !mapsUrl.value ? null : 'get-directions',
    primaryAction === 'visit-website' || !website.value ? null : 'visit-website',
  ].filter((item): item is ConversionActionKey => Boolean(item));

  const raw: BusinessRawFile = {
    schemaVersion: 1,
    fileKind: 'business-raw',
    businessSlug: resolvedSlug,
    updatedAt: now,
    sources: buildBusinessSources(context),
    identity: {
      businessName: resolvedBusinessName,
      slug: resolvedSlug,
      niche: (niche.value ?? 'restaurant') as BusinessRawFile['identity']['niche'],
      primaryCategory: resolvedPrimaryCategory,
      secondaryCategories: secondaryCategories.value ?? [],
      city: resolvedCity,
      country: resolvedCountry,
      district: district.value ?? null,
      addressLine: addressLine.value ?? null,
      plusCode: plusCode.value ?? null,
      coordinates: coordinates.value ?? null,
    },
    contact: {
      phone: phone.value ?? null,
      whatsapp: whatsapp.value ?? null,
      email: email.value ?? null,
      website: website.value ?? null,
      orderUrl: orderUrl.value ?? null,
      menuUrl: menuUrl.value ?? null,
      mapsUrl: mapsUrl.value ?? null,
      socialLinks: socialLinks.value ?? [],
      externalPlatforms: externalPlatforms.value ?? [],
    },
    operations: {
      openingHours: openingHours.value ?? [],
    },
    offer: {
      serviceModes: resolvedServiceModes,
      categories: categories.value ?? [],
      featuredItems: resolvedFeaturedItems,
      services: services.value ?? [],
    },
    trust: {
      rating: {
        value: ratingValue.value ?? null,
        reviewCount: reviewCount.value ?? null,
        sourceLabel: pickFirstNonEmpty(
          ratingValue.chosenSourceId ? getSourceLabel(ratingValue.chosenSourceId) : null,
          reviewCount.chosenSourceId ? getSourceLabel(reviewCount.chosenSourceId) : null,
        ),
      },
      reviewThemes: resolvedReviewThemes,
      proofPoints: resolvedProofPoints,
      testimonials: testimonials.value ?? [],
      credibilityRisks: credibilityRisks.value ?? [],
    },
    visual: {
      brandHints: brandHints.value ?? [],
      brandColors: brandColors.value ?? [],
      toneHints: toneHints.value ?? [],
      visualMood: visualMood.value ?? null,
      desiredLuxuryLevel: desiredLuxuryLevel.value ?? null,
      visualIntensity: visualIntensity.value ?? null,
      photographyStyle: photographyStyle.value ?? null,
      preferredContrast: preferredContrast.value ?? null,
      sectionDensityPreference: sectionDensityPreference.value ?? null,
      materialNotes: materialFinish.value
        ? materialFinish.value.replace(/\s+and\s+/u, ', ').split(/\s*,\s*/u).filter(Boolean)
        : [],
    },
    seo: {
      areaServed: areaServed.value ?? [],
      geoPrecision: geoPrecision.value ?? undefined,
      serviceType: serviceType.value ?? null,
      keywordHints: keywordHints.value ?? [],
      titleHint: seoTitle.value ?? null,
      descriptionHint: seoDescription.value ?? null,
    },
    assets: {
      assetIds: assetIds.value ?? [],
      sourceFolder: getImageSourceFolder(context.imageMap),
      notes: [
        `Resolved from ${getSourceLabel('image-map')} and the current runtime asset set.`,
        context.imageMap.notes?.[0] ?? 'No additional image-map note stored.',
      ],
    },
    notes: uniqueStrings([
      ...(manual?.notes ?? []),
      ...(context.intakeNotes ?? []),
      context.manifest.expectedInputs.find((item) => item.id === 'html-source' && item.status === 'missing')
        ? 'No raw HTML exports are present yet, so structured extraction remains limited.'
        : null,
    ]),
    fieldStatus: Object.fromEntries(
      fields.map((field) => [
        field.path,
        {
          state: field.state,
          sourceIds: field.sourceIds,
          notes: field.reason,
        },
      ]),
    ),
  };

  const brief: BusinessBriefFile = {
    schemaVersion: 1,
    fileKind: 'business-brief',
    businessSlug: resolvedSlug,
    updatedAt: now,
    identity: {
      businessName: resolvedBusinessName,
      slug: resolvedSlug,
      niche: raw.identity.niche,
      isMockSample: false,
      sampleLabel: getSampleLabel(raw.identity.niche),
      primaryCategory: resolvedPrimaryCategory,
      secondaryCategories: raw.identity.secondaryCategories ?? [],
    },
    location: {
      city: resolvedCity,
      country: resolvedCountry,
      district: raw.identity.district ?? null,
      addressLine: raw.identity.addressLine ?? null,
      coordinates: raw.identity.coordinates ?? null,
      openingHours: raw.operations.openingHours ?? [],
    },
    contact: {
      phone: raw.contact.phone ?? null,
      whatsapp: raw.contact.whatsapp ?? null,
      email: raw.contact.email ?? null,
      website: raw.contact.website ?? null,
      orderUrl: raw.contact.orderUrl ?? null,
      menuUrl: raw.contact.menuUrl ?? null,
      mapsUrl: raw.contact.mapsUrl ?? null,
      socialLinks: raw.contact.socialLinks ?? [],
      externalPlatforms: raw.contact.externalPlatforms ?? [],
    },
    offer: {
      serviceModes: raw.offer.serviceModes ?? [],
      featuredItems: raw.offer.featuredItems ?? [],
      services: raw.offer.services ?? [],
      faqItems: faqItems.value ?? [],
    },
    trust: {
      ratingValue: raw.trust.rating?.value ?? null,
      reviewCount: raw.trust.rating?.reviewCount ?? null,
      reviewHighlights: resolvedReviewThemes,
      proofPoints: resolvedProofPoints,
      testimonials: raw.trust.testimonials ?? [],
      credibilityRisks: raw.trust.credibilityRisks ?? [],
    },
    brand: {
      tagline:
        tagline.value ?? buildDefaultTagline(resolvedBusinessName, resolvedPrimaryCategory, resolvedCity),
      shortDescription:
        shortDescription.value ??
        buildDefaultShortDescription(resolvedBusinessName, resolvedCity, resolvedServiceModes, resolvedPrimaryCategory),
      heroSignature:
        heroSignature.value ??
        buildDefaultHeroSignature(resolvedPrimaryCategory, resolvedFeaturedItems, resolvedCity),
      brandHints: brandHints.value ?? [],
      brandColors: brandColors.value ?? [],
      toneHints: toneHints.value ?? [],
      visualMood: visualMood.value ?? `${resolvedBusinessName} with a clear local feel.`,
      desiredLuxuryLevel: desiredLuxuryLevel.value ?? null,
      visualIntensity: visualIntensity.value ?? null,
      photographyStyle: photographyStyle.value ?? 'Use the currently approved photography as the baseline treatment.',
      atmosphereKeywords: atmosphereKeywords.value ?? [],
      preferredContrast: preferredContrast.value ?? null,
      sectionDensityPreference: sectionDensityPreference.value ?? null,
      materialFinish: materialFinish.value ?? '',
      imageTreatment: imageTreatment.value ?? '',
    },
    seo: {
      title:
        seoTitle.value ?? buildDefaultSeoTitle(resolvedBusinessName, resolvedPrimaryCategory, resolvedCity),
      description:
        seoDescription.value ??
        buildDefaultSeoDescription(
          resolvedBusinessName,
          resolvedPrimaryCategory,
          resolvedCity,
          resolvedServiceModes,
          resolvedFeaturedItems,
        ),
      areaServed: areaServed.value ?? [],
      geoPrecision: geoPrecision.value ?? undefined,
      serviceType: serviceType.value ?? null,
      priceRange: priceRange.value ?? null,
      keywordHints: keywordHints.value ?? [],
    },
  };

  const contentPlan: ContentPlanFile = {
    schemaVersion: 1,
    fileKind: 'content-plan',
    businessSlug: resolvedSlug,
    updatedAt: now,
    primaryGoal: actionGoalFromKey(primaryAction),
    conversionFocus:
      primaryAction === 'order-online'
        ? 'Lead with the verified order path and keep visit/contact as support routes.'
        : primaryAction === 'get-directions'
          ? 'Lead with directions because location is verified and stronger than any unconfirmed digital route.'
          : primaryAction === 'call'
            ? 'Lead with phone because it is a verified, practical action for the current source set.'
            : 'Lead with the clearest next step that is already verified in the current source set.',
    tone: toneHints.value ?? seed?.desiredTone ?? [],
    primaryCta: buildPlannedCta(
      primaryAction,
      primaryAction === 'get-directions'
        ? 'Directions are the strongest truthful action in the current source set.'
        : primaryAction === 'order-online'
          ? 'A verified order route is available and should lead conversion.'
          : primaryAction === 'call'
            ? 'Phone is verified and ready as a practical direct contact route.'
            : `Use ${CTA_LABELS[primaryAction]} because it is currently the strongest available verified action.`,
    ),
    secondaryCtas: secondaryActions.slice(0, 2).map((key) =>
      buildPlannedCta(
        key,
        key === 'view-menu'
          ? 'Menu access remains useful even when the source set is still light on external links.'
          : key === 'call'
            ? 'Phone supports practical follow-up and pickup questions.'
            : key === 'get-directions'
              ? 'Directions support location-led conversion as a fallback.'
              : `Keep ${CTA_LABELS[key]} available as a lower-friction backup route.`,
      ),
    ),
    fallbackRules: [
      {
        when: 'A verified order link is missing',
        useActionKey: mapsUrl.value ? 'get-directions' : phone.value ? 'call' : 'view-menu',
        reason: 'Do not fabricate an order path when the source set does not support it.',
      },
      {
        when: 'A first-party website is missing',
        useActionKey: 'view-menu',
        reason: 'Keep the next step inside the landing page when no verified website exists.',
      },
    ],
    recommendedSections: [
      buildSectionPlan('hero', true, 'high', 'The hero should immediately state the offer and local context.'),
      buildSectionPlan('popular-items', resolvedFeaturedItems.length > 0, 'high', 'Featured items are available and should surface early.'),
      buildSectionPlan('services', (services.value?.length ?? 0) > 0 || (categories.value?.length ?? 0) > 0, 'medium', 'The offer has enough structure for a clean scan route.'),
      buildSectionPlan('credibility', Boolean(raw.trust.rating?.value || resolvedProofPoints.length > 0), 'high', 'Rating, proof points, or both are available as trust anchors.'),
      buildSectionPlan('about', Boolean(brief.brand.shortDescription || resolvedServiceModes.length > 0), 'medium', 'Practical positioning and service modes help explain the business quickly.'),
      buildSectionPlan('gallery', context.imageMap.assets.filter((asset) => !asset.discard && asset.reviewStatus !== 'discard').length > 0, 'medium', 'Approved real images are available and should reinforce truthfulness.'),
      buildSectionPlan('faq', (brief.offer.faqItems?.length ?? 0) > 0, 'medium', 'FAQ can reduce first-visit friction when supported by actual answers.'),
      buildSectionPlan('cta', true, 'high', 'The page should close with the strongest truthful action.'),
      buildSectionPlan('footer', true, 'low', 'Footer reinforces contact and local trust signals.'),
    ],
    messaging: {
      heroFocus: uniqueStrings([resolvedPrimaryCategory, resolvedFeaturedItems[0]?.title ?? null, resolvedCity || null]).join(', '),
      offerFocus: resolvedFeaturedItems[0]?.title ?? services.value?.[0]?.title ?? resolvedPrimaryCategory ?? 'Lead with the clearest part of the offer that is already confirmed.',
      trustFocus:
        raw.trust.rating?.value && raw.trust.rating?.reviewCount
          ? `${raw.trust.rating.value} rating, ${raw.trust.rating.reviewCount} reviews, and repeated praise for ${resolvedReviewThemes
              .slice(0, 2)
              .join(' and ')
              .toLowerCase()}.`
          : 'Use the trust signals that are actually verified in the source set.',
      galleryFocus: 'Use approved real images and keep decorative filler out.',
      locationFocus:
        mapsUrl.value && raw.identity.addressLine
          ? `${raw.identity.addressLine}${
              raw.identity.district &&
              !raw.identity.addressLine.toLowerCase().includes(raw.identity.district.toLowerCase())
                ? `, ${raw.identity.district}`
                : ''
            }.`
          : 'Keep location treatment honest until more local data is confirmed.',
    },
    contentPriorities: uniqueStrings([
      resolvedFeaturedItems[0]?.title ?? null,
      resolvedServiceModes[0] ?? null,
      resolvedCity || null,
      raw.trust.rating?.reviewCount ? `${raw.trust.rating.reviewCount} reviews` : null,
      resolvedReviewThemes[0] ?? null,
    ]),
  };

  const missingDataItems = buildMissingDataItems(fields);
  const summary = summarizeStates(fields);
  const missingData: MissingDataFile = {
    schemaVersion: 1,
    fileKind: 'missing-data',
    businessSlug: resolvedSlug,
    updatedAt: now,
    summary: {
      verified: summary.verified,
      inferred: missingDataItems.filter((item) => item.state === 'inferred').length,
      missing: missingDataItems.filter((item) => item.state === 'missing').length,
      conflict: missingDataItems.filter((item) => item.state === 'conflict').length,
      pending: missingDataItems.filter((item) => item.state === 'pending').length,
    },
    items: missingDataItems,
  };

  const reconciliationReport: ReconciliationReportFile = {
    schemaVersion: 1,
    fileKind: 'reconciliation-report',
    businessSlug: resolvedSlug,
    updatedAt: now,
    sourcePriority: [...SOURCE_PRIORITY],
    fields,
    summary,
    validations: manifestWarningsAsValidationIssues(context),
    notes: uniqueStrings([
      context.manifest.expectedInputs.find((item) => item.id === 'html-source' && item.status === 'missing')
        ? 'Normalization can run without HTML, but extraction remains limited until HTML exports arrive.'
        : null,
      context.imageMap.notes?.[0] ?? null,
      manual?.notes?.[0] ?? null,
    ]),
  };

  return {
    raw,
    brief,
    missingData,
    contentPlan,
    reconciliationReport,
  };
}
