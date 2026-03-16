import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { validateBusinessMasterRecord } from '../business/master-record.ts';
import { siteConfig } from '../seo/site.ts';
import type { AssemblyProfileFile, AssemblyResolvedAction } from '../../types/assembly-engine';
import type { BusinessMasterRecord, ContentSectionId, MissingDataItem } from '../../types/business-record';
import type { CopyBlockId, CopyProfileFile } from '../../types/copy-engine';
import type {
  QaCategory,
  QaCheckResult,
  QaManualReviewItem,
  QaReportFile,
  QaRouteSnapshot,
  QaSeverity,
} from '../../types/qa-engine';

interface RunProductQaOptions {
  projectRoot: string;
  buildRoot: string;
  publicRoot: string;
  businessSlug: string;
  record: BusinessMasterRecord;
  assemblyProfile: AssemblyProfileFile;
  copyProfile: CopyProfileFile;
  demoPresetSlugs: string[];
  knownBusinesses?: Array<{
    slug: string;
    businessName: string;
  }>;
}

type HtmlMeta = {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robots: string | null;
  h1Count: number;
  imageCount: number;
  detailsCount: number;
  jsonLdCount: number;
  hasSkipLink: boolean;
  imgAltValues: string[];
  anchorLabels: string[];
  plainText: string;
};

const GENERIC_CTA_LABELS = new Set(['learn more', 'read more', 'discover', 'explore', 'click here', 'see more']);
const LEGACY_BRAND_PATTERNS = [/barber-pro/i, /\bbarbershop\b/i, /\bsalon\b/i];
const MISSING_PATHS_TO_DEGRADATIONS: Record<string, string[]> = {
  'contact.orderUrl': ['order', 'copy-no-order-url'],
  'contact.menuUrl': ['menu', 'copy-no-menu-url'],
  'location.openingHours': ['hours', 'copy-no-hours', 'assembly-hours-hidden'],
  'trust.testimonials': ['testimonial', 'copy-no-testimonials', 'theme-trust-only'],
};

function isUsefulHref(href: string | null | undefined) {
  if (!href) return false;
  const trimmed = href.trim();
  return trimmed !== '' && trimmed !== '#';
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function toLowerText(value: string | null | undefined) {
  return normalizeWhitespace(value ?? '').toLowerCase();
}

function digitsOnly(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

function readTextIfExists(filePath: string) {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
}

function stripHtml(html: string) {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function extractFirstMatch(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1] ? normalizeWhitespace(match[1]) : null;
}

function extractAttributeValue(tag: string, attribute: string) {
  const patterns = [
    new RegExp(`${attribute}\\s*=\\s*"([^"]*)"`, 'i'),
    new RegExp(`${attribute}\\s*=\\s*'([^']*)'`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = tag.match(pattern);
    if (match?.[1] !== undefined) {
      return normalizeWhitespace(match[1]);
    }
  }

  return '';
}

function analyzeHtml(html: string): HtmlMeta {
  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const anchorLabels = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  return {
    title: extractFirstMatch(html, /<title>([\s\S]*?)<\/title>/i),
    metaDescription: extractFirstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i,
    ),
    canonical: extractFirstMatch(
      html,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([\s\S]*?)["'][^>]*>/i,
    ),
    robots: extractFirstMatch(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i),
    h1Count: [...html.matchAll(/<h1\b/gi)].length,
    imageCount: imgTags.length,
    detailsCount: [...html.matchAll(/<details\b/gi)].length,
    jsonLdCount: [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["']/gi)].length,
    hasSkipLink: /Skip to content/i.test(html),
    imgAltValues: imgTags.map((tag) => extractAttributeValue(tag, 'alt')),
    anchorLabels,
    plainText: stripHtml(html),
  };
}

function buildRouteSnapshot(route: string, filePath: string): QaRouteSnapshot {
  const html = readTextIfExists(filePath);

  if (!html) {
    return {
      route,
      filePath,
      exists: false,
      h1Count: 0,
      imageCount: 0,
      detailsCount: 0,
    };
  }

  const meta = analyzeHtml(html);

  return {
    route,
    filePath,
    exists: true,
    title: meta.title,
    metaDescription: meta.metaDescription,
    canonical: meta.canonical,
    robots: meta.robots,
    h1Count: meta.h1Count,
    imageCount: meta.imageCount,
    detailsCount: meta.detailsCount,
  };
}

function toDistPath(buildRoot: string, route: string) {
  if (route === '/') return path.join(buildRoot, 'index.html');
  if (route === '/404.html') return path.join(buildRoot, '404.html');
  if (route === '/robots.txt') return path.join(buildRoot, 'robots.txt');

  const relative = route.replace(/^\/+/, '').replace(/\/+$/, '');
  return path.join(buildRoot, relative, 'index.html');
}

function createPass(
  id: string,
  category: QaCategory,
  title: string,
  summary: string,
  options: Pick<QaCheckResult, 'details' | 'paths' | 'route'> = {},
): QaCheckResult {
  return {
    id,
    category,
    status: 'pass',
    severity: 'none',
    title,
    summary,
    details: options.details,
    paths: options.paths,
    route: options.route ?? null,
  };
}

function createIssue(
  id: string,
  category: QaCategory,
  severity: Exclude<QaSeverity, 'none'>,
  title: string,
  summary: string,
  options: Pick<QaCheckResult, 'details' | 'paths' | 'route'> = {},
): QaCheckResult {
  return {
    id,
    category,
    status: 'issue',
    severity,
    title,
    summary,
    details: options.details,
    paths: options.paths,
    route: options.route ?? null,
  };
}

function getVisibleSection(profile: AssemblyProfileFile, sectionId: ContentSectionId) {
  return profile.visibility.sections.find((section) => section.id === sectionId) ?? null;
}

function getCopyBlockRule(profile: CopyProfileFile, blockId: CopyBlockId) {
  return profile.contentRules.blockRules.find((rule) => rule.blockId === blockId) ?? null;
}

function includesDegradationFor(profile: AssemblyProfileFile, item: MissingDataItem) {
  const patterns = MISSING_PATHS_TO_DEGRADATIONS[item.path];
  if (!patterns) return true;

  return profile.degradations.some((degradation) => {
    const haystack = `${degradation.id} ${degradation.guidance} ${degradation.triggeredBy.join(' ')}`.toLowerCase();
    return patterns.some((pattern) => haystack.includes(pattern.toLowerCase()));
  });
}

function collectVisibleActionLabels(actions: AssemblyResolvedAction[]) {
  return actions.map((action) => action.label);
}

function collectSectionCounts(profile: AssemblyProfileFile) {
  const visibleSections = profile.visibility.sections.filter((section) => section.show).map((section) => section.id);
  const heroCtas = [profile.ctaMap.hero.primary, profile.ctaMap.hero.secondary].filter(
    (action): action is AssemblyResolvedAction => Boolean(action),
  );
  const finalCtas = [profile.ctaMap.finalCta.primary, profile.ctaMap.finalCta.secondary].filter(
    (action): action is AssemblyResolvedAction => Boolean(action),
  );

  return { visibleSections, heroCtas, finalCtas };
}

function findForbiddenRenderedPatterns(record: BusinessMasterRecord, htmlText: string) {
  const failures: string[] = [];
  const lowerHtml = htmlText.toLowerCase();

  if (!record.brief.contact.orderUrl && /\border online\b|\bcheckout\b|\bdelivery now\b/i.test(lowerHtml)) {
    failures.push('Rendered copy suggests online ordering even though orderUrl is missing.');
  }

  if (!record.brief.contact.menuUrl && /\bfull menu\b/i.test(lowerHtml)) {
    failures.push('Rendered copy suggests a verified full external menu even though menuUrl is missing.');
  }

  if (!record.brief.location.openingHours?.length && /\bopen now\b|\bopen daily\b|\blate night\b/i.test(lowerHtml)) {
    failures.push('Rendered copy implies verified opening hours even though hours are missing.');
  }

  if (!record.brief.trust.testimonials?.length && /"|&ldquo;|&rdquo;/.test(lowerHtml)) {
    failures.push('Rendered copy appears quote-led even though testimonial quotes are missing.');
  }

  return failures;
}

function findInvalidAltValues(values: string[]) {
  return values.filter((value) => {
    const normalized = toLowerText(value);
    return normalized === '' || normalized === 'image' || normalized === 'photo' || normalized === 'placeholder';
  });
}

function hasLegacyBrandingLeak(value: string | null | undefined) {
  return LEGACY_BRAND_PATTERNS.some((pattern) => pattern.test(value ?? ''));
}

function getFaqAnswerLimits(copyProfile: CopyProfileFile) {
  const rule = getCopyBlockRule(copyProfile, 'faq');
  return {
    maxWords: rule?.length.maxWords ?? 26,
    maxChars: rule?.length.maxChars ?? 180,
    maxItems: rule?.length.maxItems ?? 3,
  };
}

function formatCheckLine(check: QaCheckResult) {
  const label = check.status === 'pass' ? 'PASS' : check.severity.toUpperCase();
  return `- [${label}] ${check.title}: ${check.summary}`;
}

export function formatQaReportMarkdown(report: QaReportFile) {
  const errors = report.checks.filter((check) => check.status === 'issue' && check.severity === 'error');
  const warnings = report.checks.filter((check) => check.status === 'issue' && check.severity === 'warning');
  const polish = report.checks.filter((check) => check.status === 'issue' && check.severity === 'polish');
  const passes = report.checks.filter((check) => check.status === 'pass');

  const lines = [
    '# Product QA Report',
    '',
    `- Business: ${report.businessSlug}`,
    `- Generated: ${report.generatedAt}`,
    `- Checks run: ${report.summary.checksRun}`,
    `- Passed: ${report.summary.passed}`,
    `- Errors: ${report.summary.errors}`,
    `- Warnings: ${report.summary.warnings}`,
    `- Polish: ${report.summary.polish}`,
    `- Manual review: ${report.summary.manualReview}`,
    '',
    '## Errors',
    ...(errors.length > 0 ? errors.map(formatCheckLine) : ['- None']),
    '',
    '## Warnings',
    ...(warnings.length > 0 ? warnings.map(formatCheckLine) : ['- None']),
    '',
    '## Polish',
    ...(polish.length > 0 ? polish.map(formatCheckLine) : ['- None']),
    '',
    '## Passes',
    ...passes.map(formatCheckLine),
    '',
    '## Manual Review',
    ...(report.manualReview.length > 0
      ? report.manualReview.map(
          (item) => `- [${item.severity.toUpperCase()}] ${item.title}: ${item.summary} Reason: ${item.reason}`,
        )
      : ['- None']),
    '',
  ];

  return `${lines.join('\n')}\n`;
}

export function runProductQa({
  projectRoot,
  buildRoot,
  publicRoot,
  businessSlug,
  record,
  assemblyProfile,
  copyProfile,
  demoPresetSlugs,
  knownBusinesses = [],
}: RunProductQaOptions): QaReportFile {
  const checks: QaCheckResult[] = [];
  const manualReview: QaManualReviewItem[] = [];
  const services = record.brief.offer.services ?? [];
  const faqItems = record.brief.offer.faqItems ?? [];
  const homeFilePath = toDistPath(buildRoot, '/');
  const homeHtml = readTextIfExists(homeFilePath);
  const routeTargets = [
    { route: '/', filePath: homeFilePath },
    ...demoPresetSlugs.map((slug) => ({
      route: `/demo/${slug}/`,
      filePath: toDistPath(buildRoot, `/demo/${slug}/`),
    })),
    { route: '/404.html', filePath: toDistPath(buildRoot, '/404.html') },
  ];

  const routeSnapshots = routeTargets.map((target) => buildRouteSnapshot(target.route, target.filePath));
  const { visibleSections, heroCtas, finalCtas } = collectSectionCounts(assemblyProfile);

  const requiredNormalizedFiles = [
    'business-raw.json',
    'business-brief.json',
    'missing-data.json',
    'content-plan.json',
    'image-map.json',
    'copy-profile.json',
    'assembly-profile.json',
    'sector-profile.json',
    'visual-profile.json',
  ].map((fileName) => path.join(projectRoot, 'business-input', businessSlug, 'normalized', fileName));

  const missingNormalized = requiredNormalizedFiles.filter((filePath) => !existsSync(filePath));
  checks.push(
    missingNormalized.length === 0
      ? createPass(
          'structure:normalized-files',
          'structure',
          'Normalized business files are present',
          'All expected normalized JSON files exist for the current business.',
          { paths: requiredNormalizedFiles },
        )
      : createIssue(
          'structure:normalized-files',
          'structure',
          'error',
          'Normalized business files are missing',
          'One or more normalized JSON files are missing, so the business cannot be validated reliably.',
          { paths: missingNormalized },
        ),
  );

  const masterRecordIssues = validateBusinessMasterRecord(record);
  const conflictItems = record.missingData.items.filter((item) => item.state === 'conflict');
  checks.push(
    masterRecordIssues.length === 0 && conflictItems.length === 0
      ? createPass(
          'structure:record-consistency',
          'structure',
          'Master record is internally coherent',
          'The current business record has no validation issues and no unresolved conflict items.',
        )
      : createIssue(
          'structure:record-consistency',
          'structure',
          masterRecordIssues.some((issue) => issue.severity === 'error') ? 'error' : 'warning',
          'Master record still has coherence risks',
          'The business record still carries validation warnings, errors, or unresolved conflict items.',
          {
            details: [
              ...masterRecordIssues.map((issue) => `${issue.path}: ${issue.message}`),
              ...conflictItems.map((item) => `${item.path}: ${item.reason}`),
            ],
          },
        ),
  );

  const missingRoutes = routeSnapshots.filter((route) => !route.exists);
  checks.push(
    missingRoutes.length === 0
      ? createPass(
          'structure:routes',
          'structure',
          'Built routes exist',
          `Verified ${routeSnapshots.length} expected built routes including home, demos, and 404.`,
          { paths: routeSnapshots.map((route) => route.filePath) },
        )
      : createIssue(
          'structure:routes',
          'structure',
          'error',
          'Expected built routes are missing',
          'Some expected built pages are missing from dist, so preview and deploy would be incomplete.',
          {
            details: missingRoutes.map((route) => route.route),
            paths: missingRoutes.map((route) => route.filePath),
          },
        ),
  );

  const robotsPath = toDistPath(buildRoot, '/robots.txt');
  checks.push(
    existsSync(robotsPath)
      ? createPass(
          'structure:robots',
          'structure',
          'robots.txt exists',
          'The build includes robots.txt for crawler guidance.',
          { paths: [robotsPath] },
        )
      : createIssue(
          'structure:robots',
          'structure',
          'warning',
          'robots.txt is missing',
          'The build is missing robots.txt, which weakens deployment hygiene.',
          { paths: [robotsPath] },
        ),
  );

  const selectedAssetIds = new Set([
    assemblyProfile.images.heroMain?.id,
    assemblyProfile.images.heroSupport?.id,
    ...assemblyProfile.images.popularItems.map((image) => image.id),
    ...assemblyProfile.images.gallery.map((image) => image.id),
    assemblyProfile.images.fallback?.id,
  ].filter((value): value is string => Boolean(value)));
  const assetLookup = new Map(record.imageMap.assets.map((asset) => [asset.id, asset]));
  const missingAssetRefs = [...selectedAssetIds].filter((id) => !assetLookup.has(id));

  checks.push(
    missingAssetRefs.length === 0
      ? createPass(
          'assets:image-map-refs',
          'assets',
          'Assembly image references are valid',
          'Every image used by the assembly profile exists in image-map.json.',
        )
      : createIssue(
          'assets:image-map-refs',
          'assets',
          'error',
          'Assembly references unknown images',
          'At least one image referenced by the assembly profile does not exist in image-map.json.',
          { details: missingAssetRefs },
        ),
  );

  const missingAssetFiles: string[] = [];
  for (const assetId of selectedAssetIds) {
    const asset = assetLookup.get(assetId);
    if (!asset) continue;

    const relativePath = asset.publicPath.replace(/^\/+/, '').replace(/\//g, path.sep);
    const publicFilePath = path.join(publicRoot, relativePath);
    const distFilePath = path.join(buildRoot, relativePath);

    if (!existsSync(publicFilePath)) missingAssetFiles.push(publicFilePath);
    if (!existsSync(distFilePath)) missingAssetFiles.push(distFilePath);
  }

  checks.push(
    missingAssetFiles.length === 0
      ? createPass(
          'assets:files-exist',
          'assets',
          'Selected image files exist in public and dist',
          'Every selected asset resolves both in source assets and in the built output.',
        )
      : createIssue(
          'assets:files-exist',
          'assets',
          'error',
          'Selected image files are missing',
          'One or more selected image files are missing from public or dist.',
          { paths: missingAssetFiles },
        ),
  );

  const altIssues = record.imageMap.assets
    .filter((asset) => asset.reviewStatus !== 'discard')
    .filter((asset) => findInvalidAltValues([asset.suggestedAlt]).length > 0)
    .map((asset) => asset.id);
  checks.push(
    altIssues.length === 0
      ? createPass(
          'assets:alt-text',
          'assets',
          'Mapped images have non-empty alt text',
          'All approved and backup images carry non-empty mapped alt text.',
        )
      : createIssue(
          'assets:alt-text',
          'assets',
          'warning',
          'Some mapped images have weak alt text',
          'At least one mapped image uses empty or generic alt text.',
          { details: altIssues },
        ),
  );

  const duplicateCount = record.imageMap.summary?.duplicateAssets ?? 0;
  checks.push(
    duplicateCount === 0
      ? createPass(
          'assets:duplicates',
          'assets',
          'No duplicate image symptoms detected',
          'The current image-map does not report duplicate assets.',
        )
      : createIssue(
          'assets:duplicates',
          'assets',
          'warning',
          'Duplicate image symptoms detected',
          'The image-map reports duplicate or near-duplicate assets that may reduce gallery variety.',
          { details: [`duplicateAssets: ${duplicateCount}`] },
        ),
  );

  const heroPrimary = assemblyProfile.ctaMap.hero.primary;
  checks.push(
    heroPrimary && isUsefulHref(heroPrimary.href)
      ? createPass(
          'assembly:hero-primary-cta',
          'assembly',
          'Hero has a primary CTA',
          `${heroPrimary.label} resolves to a usable action.`,
        )
      : createIssue(
          'assembly:hero-primary-cta',
          'assembly',
          'error',
          'Hero primary CTA is missing or unusable',
          'The hero must keep one clear primary action with a usable href.',
        ),
  );

  const maxVisibleCtas = copyProfile.contentConstraints.maxVisibleCtas;
  checks.push(
    heroCtas.length <= maxVisibleCtas && finalCtas.length <= maxVisibleCtas
      ? createPass(
          'assembly:cta-count',
          'assembly',
          'CTA count stays within the configured limit',
          `Hero shows ${heroCtas.length} CTA(s) and final CTA shows ${finalCtas.length}; both stay within the max of ${maxVisibleCtas}.`,
        )
      : createIssue(
          'assembly:cta-count',
          'assembly',
          'warning',
          'Too many visible CTAs at the same level',
          'One of the main action blocks exceeds the configured CTA limit and risks decision fatigue.',
          {
            details: [
              `hero: ${collectVisibleActionLabels(heroCtas).join(', ') || 'none'}`,
              `final: ${collectVisibleActionLabels(finalCtas).join(', ') || 'none'}`,
            ],
          },
        ),
  );

  const invalidVisibleActions = [assemblyProfile.ctaMap.hero, assemblyProfile.ctaMap.finalCta]
    .flatMap((placement) => [placement.primary, placement.secondary])
    .filter((action): action is AssemblyResolvedAction => Boolean(action))
    .filter((action) => !isUsefulHref(action.href));
  checks.push(
    invalidVisibleActions.length === 0
      ? createPass(
          'assembly:cta-hrefs',
          'assembly',
          'Visible CTAs resolve cleanly',
          'Every visible CTA in hero and final CTA has a usable href.',
        )
      : createIssue(
          'assembly:cta-hrefs',
          'assembly',
          'error',
          'Some visible CTAs are not actionable',
          'A visible CTA resolves to an empty or placeholder href.',
          { details: invalidVisibleActions.map((action) => `${action.label}: ${action.href}`) },
        ),
  );

  const sectionIssues: QaCheckResult[] = [];
  const popularSection = getVisibleSection(assemblyProfile, 'popular-items');
  if (popularSection?.show && assemblyProfile.content.popularItems.cards.length === 0) {
    sectionIssues.push(
      createIssue(
        'assembly:popular-empty',
        'assembly',
        'error',
        'Popular items is visible without cards',
        'The highlights band is visible even though it has no cards to show.',
      ),
    );
  } else if (popularSection?.show && assemblyProfile.content.popularItems.cards.length < 2) {
    sectionIssues.push(
      createIssue(
        'assembly:popular-thin',
        'assembly',
        'warning',
        'Popular items is very thin',
        'The highlights band only has one card, so it may feel under-edited.',
      ),
    );
  }

  const servicesSection = getVisibleSection(assemblyProfile, 'services');
  if (servicesSection?.show && services.length === 0) {
    sectionIssues.push(
      createIssue(
        'assembly:services-empty',
        'assembly',
        'error',
        'Services/menu block is visible without structured offer data',
        'The services block should hide if no structured offer items are available.',
      ),
    );
  }

  const gallerySection = getVisibleSection(assemblyProfile, 'gallery');
  if (gallerySection?.show && assemblyProfile.images.gallery.length === 0) {
    sectionIssues.push(
      createIssue(
        'assembly:gallery-empty',
        'assembly',
        'error',
        'Gallery is visible without images',
        'The gallery should not render if no gallery images are available.',
      ),
    );
  } else if (gallerySection?.show && assemblyProfile.images.gallery.length < 3) {
    const isIntentionalCompactGallery =
      gallerySection.mode === 'compact' &&
      assemblyProfile.degradations.some((item) => item.id === 'assembly-compact-gallery');

    sectionIssues.push(
      createIssue(
        'assembly:gallery-thin',
        'experience',
        isIntentionalCompactGallery ? 'polish' : 'warning',
        'Gallery is visible with limited variety',
        isIntentionalCompactGallery
          ? 'The gallery is intentionally compact because the current approved image set is limited.'
          : 'The gallery has fewer than three images, so it may feel repetitive or underpowered.',
      ),
    );
  }

  const faqSection = getVisibleSection(assemblyProfile, 'faq');
  const faqLimits = getFaqAnswerLimits(copyProfile);
  if (faqSection?.show && faqItems.length < 2) {
    sectionIssues.push(
      createIssue(
        'assembly:faq-thin',
        'assembly',
        'warning',
        'FAQ is visible with too little utility',
        'The FAQ is visible even though it has fewer than two useful answers.',
      ),
    );
  }

  const longFaqAnswers = faqItems
    .map((item, index) => ({
      index,
      words: item.answer.split(/\s+/).filter(Boolean).length,
      chars: item.answer.length,
    }))
    .filter((item) => item.words > faqLimits.maxWords || item.chars > faqLimits.maxChars);
  if (faqSection?.show && longFaqAnswers.length > 0) {
    sectionIssues.push(
      createIssue(
        'experience:faq-length',
        'experience',
        'polish',
        'Some FAQ answers are longer than the configured limit',
        'The FAQ is functional, but one or more answers are longer than the copy system recommends.',
        {
          details: longFaqAnswers.map(
            (item) => `FAQ ${item.index + 1}: ${item.words} words, ${item.chars} chars`,
          ),
        },
      ),
    );
  }

  checks.push(
    sectionIssues.length === 0
      ? createPass(
          'assembly:visible-sections',
          'assembly',
          'Visible sections have enough data',
          'Every visible section clears the minimum data threshold set by the assembly layer.',
        )
      : createIssue(
          'assembly:visible-sections',
          'assembly',
          sectionIssues.some((issue) => issue.severity === 'error')
            ? 'error'
            : sectionIssues.some((issue) => issue.severity === 'warning')
              ? 'warning'
              : 'polish',
          'Some visible sections are thin or under-supported',
          'One or more visible sections look too thin for their current visibility decision.',
          { details: sectionIssues.map((issue) => issue.summary) },
        ),
  );
  checks.push(...sectionIssues);

  const footerLinkIssues = assemblyProfile.navigation.footerLinks.filter((link) => {
    const section = assemblyProfile.visibility.sections.find((item) => item.anchor === link.href);
    return link.enabled && !section?.show;
  });
  checks.push(
    footerLinkIssues.length === 0
      ? createPass(
          'assembly:footer-links',
          'assembly',
          'Footer links respect section visibility',
          'No enabled footer link points to a hidden section.',
        )
      : createIssue(
          'assembly:footer-links',
          'assembly',
          'error',
          'Footer links point to hidden sections',
          'At least one enabled footer link targets a section that should be hidden.',
          { details: footerLinkIssues.map((item) => item.label) },
        ),
  );

  const unresolvedCriticalDegradations = record.missingData.items
    .filter((item) => ['missing', 'pending', 'conflict'].includes(item.state))
    .filter((item) => item.path in MISSING_PATHS_TO_DEGRADATIONS)
    .filter((item) => !includesDegradationFor(assemblyProfile, item));
  checks.push(
    unresolvedCriticalDegradations.length === 0
      ? createPass(
          'assembly:critical-degradations',
          'assembly',
          'Critical missing data has a degradation rule',
          'Critical missing paths in the current brief are acknowledged by the assembly degradation layer.',
        )
      : createIssue(
          'assembly:critical-degradations',
          'assembly',
          'warning',
          'Some critical missing data lacks a visible degradation',
          'A critical missing path is known but not clearly handled in the assembly degradation layer.',
          {
            details: unresolvedCriticalDegradations.map((item) => `${item.path}: ${item.reason}`),
          },
        ),
  );

  const copySeverityMap: Record<'error' | 'warning' | 'hint', Exclude<QaSeverity, 'none'>> = {
    error: 'error',
    warning: 'warning',
    hint: 'polish',
  };
  const copyIssues = copyProfile.validation.issues.map((issue, index) =>
    createIssue(
      `copy:validation-${index + 1}`,
      'copy',
      copySeverityMap[issue.severity],
      `Copy validation issue in ${issue.blockId}`,
      issue.message,
      { details: issue.sampleLabel ? [issue.sampleLabel] : undefined },
    ),
  );
  checks.push(
    copyIssues.length === 0
      ? createPass(
          'copy:validation-summary',
          'copy',
          'Copy profile checks are clean',
          'The current copy profile did not raise any automatic validation issues.',
        )
      : createIssue(
          'copy:validation-summary',
          'copy',
          copyIssues.some((issue) => issue.severity === 'error')
            ? 'error'
            : copyIssues.some((issue) => issue.severity === 'warning')
              ? 'warning'
              : 'polish',
          'Copy profile surfaced issues',
          'The copy engine detected issues or hints that should be reviewed before release.',
          { details: copyIssues.map((issue) => issue.summary) },
        ),
  );
  checks.push(...copyIssues);

  const renderedCopyFailures = findForbiddenRenderedPatterns(record, homeHtml ? stripHtml(homeHtml) : '');
  checks.push(
    renderedCopyFailures.length === 0
      ? createPass(
          'copy:forbidden-claims',
          'copy',
          'Rendered copy avoids forbidden claims',
          'The built home page does not appear to expose prohibited order, menu, hours, or testimonial claims.',
          { route: '/' },
        )
      : createIssue(
          'copy:forbidden-claims',
          'copy',
          'error',
          'Rendered copy leaks prohibited claims',
          'The built home page includes language that conflicts with current data availability.',
          { route: '/', details: renderedCopyFailures },
        ),
  );

  const repeatedPhrases = copyProfile.validation.repeatedPhrases;
  checks.push(
    repeatedPhrases.length === 0
      ? createPass(
          'copy:repetition',
          'copy',
          'No repeated phrase symptoms detected',
          'The copy engine did not flag repeated phrase patterns.',
        )
      : createIssue(
          'copy:repetition',
          'copy',
          'polish',
          'Copy repetition hints are still present',
          'The copy engine still sees repeated phrase patterns that are worth a final edit pass.',
          { details: repeatedPhrases },
        ),
  );

  const genericAnchorLabels = routeTargets.flatMap((target) => {
    const html = readTextIfExists(target.filePath);
    if (!html) return [];
    const meta = analyzeHtml(html);
    return meta.anchorLabels
      .filter((label) => GENERIC_CTA_LABELS.has(toLowerText(label)))
      .map((label) => `${target.route}: ${label}`);
  });
  checks.push(
    genericAnchorLabels.length === 0
      ? createPass(
          'accessibility:generic-links',
          'accessibility',
          'Action labels stay specific',
          'The built pages do not rely on generic link labels like "Learn more".',
        )
      : createIssue(
          'accessibility:generic-links',
          'accessibility',
          'warning',
          'Some action labels are too generic',
          'One or more anchors use vague labels that reduce clarity.',
          { details: genericAnchorLabels },
        ),
  );

  const titleMetaIssues = routeTargets.flatMap((target) => {
    const html = readTextIfExists(target.filePath);
    if (!html) return [];
    const meta = analyzeHtml(html);
    const issues: string[] = [];
    if (!meta.title) issues.push(`${target.route}: missing <title>`);
    if (!meta.metaDescription) issues.push(`${target.route}: missing meta description`);
    if (!meta.canonical) issues.push(`${target.route}: missing canonical`);
    return issues;
  });
  checks.push(
    titleMetaIssues.length === 0
      ? createPass(
          'seo:meta-basics',
          'seo',
          'Title, description, and canonical are present',
          'Every checked route includes the basic visible SEO tags.',
        )
      : createIssue(
          'seo:meta-basics',
          'seo',
          'error',
          'Some basic SEO tags are missing',
          'At least one checked route is missing a title, meta description, or canonical.',
          { details: titleMetaIssues },
        ),
  );

  const headingIssues = routeTargets.flatMap((target) => {
    const html = readTextIfExists(target.filePath);
    if (!html) return [];
    const meta = analyzeHtml(html);
    return meta.h1Count === 1 ? [] : [`${target.route}: found ${meta.h1Count} h1 tags`];
  });
  checks.push(
    headingIssues.length === 0
      ? createPass(
          'seo:headings',
          'seo',
          'Heading structure has one H1 per checked page',
          'The checked built pages each expose exactly one H1.',
        )
      : createIssue(
          'seo:headings',
          'seo',
          'error',
          'Heading structure is broken on at least one page',
          'A checked page has zero or multiple H1 elements.',
          { details: headingIssues },
        ),
  );

  const schemaIssues = routeTargets
    .filter((target) => target.route !== '/404.html')
    .flatMap((target) => {
      const html = readTextIfExists(target.filePath);
      if (!html) return [];
      const meta = analyzeHtml(html);
      return meta.jsonLdCount > 0 ? [] : [`${target.route}: missing JSON-LD`];
    });
  checks.push(
    schemaIssues.length === 0
      ? createPass(
          'seo:schema',
          'seo',
          'Structured data is present on primary pages',
          'Home and demo pages include JSON-LD output.',
        )
      : createIssue(
          'seo:schema',
          'seo',
          'warning',
          'Structured data is missing on some primary pages',
          'At least one primary page is missing JSON-LD output.',
          { details: schemaIssues },
        ),
  );

  const robotsIssues: string[] = [];
  const homeSnapshot = routeSnapshots.find((route) => route.route === '/');
  if (homeSnapshot?.robots?.toLowerCase().includes('noindex')) {
    robotsIssues.push('Home page is marked noindex.');
  }
  for (const slug of demoPresetSlugs) {
    const route = routeSnapshots.find((item) => item.route === `/demo/${slug}/`);
    if (!route?.robots?.toLowerCase().includes('noindex')) {
      robotsIssues.push(`/demo/${slug}/ is missing noindex.`);
    }
  }
  const notFoundSnapshot = routeSnapshots.find((route) => route.route === '/404.html');
  if (!notFoundSnapshot?.robots?.toLowerCase().includes('noindex')) {
    robotsIssues.push('/404.html is missing noindex.');
  }
  checks.push(
    robotsIssues.length === 0
      ? createPass(
          'seo:robots',
          'seo',
          'Robots directives match route intent',
          'Home stays indexable, while demos and 404 stay noindex.',
        )
      : createIssue(
          'seo:robots',
          'seo',
          'error',
          'Robots directives do not match route intent',
          'At least one checked page has the wrong indexability directive.',
          { details: robotsIssues },
        ),
  );

  const napIssues: string[] = [];
  const homePlainText = homeHtml ? stripHtml(homeHtml) : '';
  if (homeHtml) {
    if (!homePlainText.includes(record.brief.identity.businessName)) {
      napIssues.push('Business name is missing from the built home page.');
    }

    if (record.brief.location.addressLine && !homePlainText.includes(record.brief.location.addressLine)) {
      napIssues.push('Address is missing from the built home page.');
    }

    const phoneDigits = digitsOnly(record.brief.contact.phone);
    const homeDigits = digitsOnly(homePlainText);
    if (phoneDigits && !homeDigits.includes(phoneDigits.slice(-7))) {
      napIssues.push('Phone number is missing from the built home page.');
    }
  }

  checks.push(
    napIssues.length === 0
      ? createPass(
          'seo:nap',
          'seo',
          'Visible NAP stays coherent on the home page',
          'The home page includes the current business name, address, and phone cues.',
          { route: '/' },
        )
      : createIssue(
          'seo:nap',
          'seo',
          'warning',
          'Visible NAP is incomplete on the home page',
          'One or more basic local trust details are missing from the built home page.',
          { route: '/', details: napIssues },
        ),
  );

  const foreignBusinessLeaks = knownBusinesses
    .filter((entry) => entry.slug !== businessSlug)
    .filter((entry) => {
      const normalizedName = toLowerText(entry.businessName);
      return normalizedName.length > 0 && toLowerText(homePlainText).includes(normalizedName);
    })
    .map((entry) => `${entry.businessName} (${entry.slug})`);

  checks.push(
    foreignBusinessLeaks.length === 0
      ? createPass(
          'seo:business-scope',
          'seo',
          'Home page stays scoped to the active business',
          'The built home page does not appear to leak another registered business name.',
          { route: '/' },
        )
      : createIssue(
          'seo:business-scope',
          'seo',
          'error',
          'Home page leaks another business identity',
          'The built home page appears to mention another registered business, which is a real multi-web contamination risk.',
          { route: '/', details: foreignBusinessLeaks },
        ),
  );

  checks.push(
    hasLegacyBrandingLeak(siteConfig.siteUrl)
      ? createIssue(
          'seo:legacy-site-url',
          'seo',
          'warning',
          'Site URL still uses legacy branding',
          'The configured canonical site URL still points to a legacy Firebase hostname, which is a real release-level cleanup item.',
          { paths: [path.join(projectRoot, 'src', 'lib', 'seo', 'site.ts')] },
        )
      : createPass(
          'seo:legacy-site-url',
          'seo',
          'Site URL branding looks clean',
          'The configured canonical site URL does not show obvious legacy branding.',
        ),
  );

  const imageAltIssues = routeTargets.flatMap((target) => {
    const html = readTextIfExists(target.filePath);
    if (!html) return [];
    const meta = analyzeHtml(html);
    return findInvalidAltValues(meta.imgAltValues).map((value) => `${target.route}: ${value || '(empty alt)'}`);
  });
  checks.push(
    imageAltIssues.length === 0
      ? createPass(
          'accessibility:image-alt',
          'accessibility',
          'Built images have non-empty alt text',
          'The checked built pages do not expose empty or generic img alt text.',
        )
      : createIssue(
          'accessibility:image-alt',
          'accessibility',
          'warning',
          'Some built images have weak alt text',
          'At least one built image uses empty or generic alt text.',
          { details: imageAltIssues },
        ),
  );

  const skipLinkIssues = routeTargets
    .filter((target) => {
      const html = readTextIfExists(target.filePath);
      return html ? !analyzeHtml(html).hasSkipLink : true;
    })
    .map((target) => target.route);
  checks.push(
    skipLinkIssues.length === 0
      ? createPass(
          'accessibility:skip-link',
          'accessibility',
          'Skip link is present on checked pages',
          'Each checked page includes the Skip to content link.',
        )
      : createIssue(
          'accessibility:skip-link',
          'accessibility',
          'error',
          'Skip link is missing on some pages',
          'At least one checked page is missing the Skip to content link.',
          { details: skipLinkIssues },
        ),
  );

  const faqDetailsCheck =
    faqSection?.show && homeHtml
      ? analyzeHtml(homeHtml).detailsCount >= Math.min(faqItems.length, faqLimits.maxItems)
      : true;
  checks.push(
    faqDetailsCheck
      ? createPass(
          'accessibility:faq-details',
          'accessibility',
          'FAQ affordance is real',
          faqSection?.show
            ? 'The visible FAQ renders as real details elements.'
            : 'FAQ is hidden, so no interactive affordance is exposed.',
          { route: '/' },
        )
      : createIssue(
          'accessibility:faq-details',
          'accessibility',
          'error',
          'FAQ affordance looks broken',
          'The FAQ is visible in assembly but the built page does not expose real details elements.',
          { route: '/' },
        ),
  );

  const weakImageCount = record.imageMap.assets.filter((asset) => asset.quality === 'weak').length;
  checks.push(
    weakImageCount <= 1
      ? createPass(
          'experience:image-quality',
          'experience',
          'Weak-image load is limited',
          `Only ${weakImageCount} image(s) are marked weak in the current image set.`,
        )
      : createIssue(
          'experience:image-quality',
          'experience',
          'warning',
          'Several weak images are still in the mapped set',
          'The current image set still contains multiple weak images, which can lower perceived polish.',
          { details: [`weakAssets: ${weakImageCount}`] },
        ),
  );

  checks.push(
    heroCtas.length <= 2
      ? createPass(
          'experience:hero-fatigue',
          'experience',
          'Hero action load stays focused',
          'The hero keeps one clear primary action and one secondary path at most.',
        )
      : createIssue(
          'experience:hero-fatigue',
          'experience',
          'warning',
          'Hero still shows too many actions',
          'The hero shows more than two visible actions and risks decision fatigue.',
        ),
  );

  const emptyCopyBlocks = [
    ['hero-support', assemblyProfile.content.heroSupport.body],
    ['gallery-support', assemblyProfile.content.gallery.body],
    ['location-contact', assemblyProfile.content.location.body],
    ['footer', assemblyProfile.content.footerSummary],
  ].filter(([, value]) => !normalizeWhitespace(String(value)).length);
  checks.push(
    emptyCopyBlocks.length === 0
      ? createPass(
          'experience:empty-copy',
          'experience',
          'Render-ready blocks do not expose empty support copy',
          'The assembly profile keeps core support copy populated for visible blocks.',
        )
      : createIssue(
          'experience:empty-copy',
          'experience',
          'warning',
          'Some render-ready support blocks are empty',
          'One or more assembly content fields are empty, which risks visibly hollow sections.',
          {
            details: emptyCopyBlocks.map(([blockId]) => String(blockId)),
          },
        ),
  );

  manualReview.push({
    id: 'manual:contrast-mobile',
    severity: 'warning',
    title: 'Review contrast and touch comfort on a real mobile device',
    summary: 'The automated layer cannot fully verify contrast, tap comfort, or real scroll rhythm.',
    reason: 'Visual contrast and mobile comfort still need a human eye and a real device.',
    relatedChecks: ['accessibility:skip-link', 'experience:hero-fatigue'],
  });

  if (weakImageCount > 0 || assemblyProfile.images.gallery.length < 4) {
    manualReview.push({
      id: 'manual:image-crops',
      severity: 'polish',
      title: 'Review hero and gallery crops',
      summary: 'The current asset mix includes either weak reserves or a compact gallery.',
      reason: 'Crop quality and perceived richness still need a visual review beyond heuristics.',
      relatedChecks: ['experience:image-quality', 'assembly:visible-sections'],
    });
  }

  if (repeatedPhrases.length > 0) {
    manualReview.push({
      id: 'manual:copy-polish',
      severity: 'polish',
      title: 'Review repeated phrase hints in visible copy',
      summary: 'The copy engine still flags minor repetition patterns.',
      reason: 'These are soft issues that benefit from editorial judgment, not blind automation.',
      relatedChecks: ['copy:repetition'],
    });
  }

  const errors = checks.filter((check) => check.status === 'issue' && check.severity === 'error').length;
  const warnings = checks.filter((check) => check.status === 'issue' && check.severity === 'warning').length;
  const polish = checks.filter((check) => check.status === 'issue' && check.severity === 'polish').length;
  const passed = checks.filter((check) => check.status === 'pass').length;

  return {
    schemaVersion: 1,
    fileKind: 'qa-report',
    businessSlug,
    generatedAt: new Date().toISOString(),
    summary: {
      checksRun: checks.length,
      passed,
      errors,
      warnings,
      polish,
      manualReview: manualReview.length,
    },
    context: {
      siteUrl: siteConfig.siteUrl,
      routeSnapshots,
      visibleSections,
      heroCtas: collectVisibleActionLabels(heroCtas),
      finalCtas: collectVisibleActionLabels(finalCtas),
      imageSummary: {
        totalAssets: record.imageMap.summary?.totalAssets ?? record.imageMap.assets.length,
        selectedAssets:
          record.imageMap.summary?.selectedAssets ??
          record.imageMap.assets.filter((asset) => asset.reviewStatus === 'approved').length,
        weakAssets: record.imageMap.summary?.weakAssets ?? weakImageCount,
        duplicateAssets: record.imageMap.summary?.duplicateAssets ?? 0,
      },
    },
    checks,
    manualReview,
  };
}
