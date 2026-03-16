import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import type { BusinessRawFile } from '../../types/business-record';
import type {
  GeneratedImageMapAsset,
  GeneratedImageMapFile,
  ImagePipelineCategory,
  ImagePipelineClassificationProfile,
  ImagePipelineContext,
  ImagePipelineDuplicateKind,
  ImagePipelineMeta,
  ImagePipelineMetricsProfile,
  ImagePipelineScoreProfile,
  ImagePipelineSelectionRole,
} from '../../types/image-pipeline';

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']);
const POWERSHELL_METRIC_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp']);
const GENERATED_OUTPUT_PATTERN =
  /^(hero-main|hero-alt-\d+|dish-\d+|gallery-\d+|interior-\d+|exterior-\d+|staff-\d+|logo-\d+|fallback-\d+)\.[a-z0-9]+$/i;
const GENERIC_NAME_TOKENS = new Set([
  'image',
  'img',
  'photo',
  'pic',
  'picture',
  'copy',
  'final',
  'edit',
  'edited',
  'new',
  'file',
  'unnamed',
  'dsc',
  'scan',
  'whatsapp',
  'screenshot',
]);

const CLASSIFICATION_KEYWORDS: Record<ImagePipelineCategory, string[]> = {
  'hero-candidate': ['hero', 'cover', 'main', 'poster', 'lead'],
  'food-close-up': ['dish', 'food', 'plate', 'meal', 'bowl', 'dosa', 'naan', 'curry', 'noodle', 'masala', 'thali'],
  'product-close-up': ['product', 'item', 'shelf', 'packaging'],
  'signature-dish': ['signature', 'special', 'chef', 'favourite'],
  dessert: ['dessert', 'sweet', 'cake', 'pastry', 'gulab', 'jamun', 'icecream', 'ice'],
  drinks: ['drink', 'coffee', 'tea', 'latte', 'juice', 'cocktail', 'smoothie', 'beer', 'wine'],
  gallery: ['gallery', 'spread', 'table', 'platter'],
  ambience: ['ambience', 'ambiance', 'mood', 'table', 'spread'],
  interior: ['interior', 'inside', 'dining', 'room', 'space', 'seating'],
  exterior: ['exterior', 'outside', 'front', 'frontage', 'storefront', 'facade', 'entrance'],
  'counter-service': ['counter', 'service', 'kitchen', 'bar'],
  staff: ['staff', 'team', 'chef', 'people', 'person', 'owner'],
  logo: ['logo', 'brand', 'mark', 'wordmark'],
  fallback: ['fallback', 'backup', 'reserve', 'placeholder'],
  weak: ['blur', 'blurry', 'dark', 'small'],
  discard: ['reject', 'discard', 'bad'],
  duplicate: ['duplicate', 'copy'],
  'near-duplicate': ['alt'],
  unknown: [],
};

type RawImageCandidate = {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  extension: string;
  buffer: Buffer;
  fileSizeBytes: number;
  stableId: string;
};

type PowerShellMetricResult = {
  path: string;
  width?: number;
  height?: number;
  averageBrightness?: number;
  contrastDeviation?: number;
  edgeStrength?: number;
  colorfulness?: number;
  perceptualHash?: string;
  sampleCount?: number;
  format?: string;
  error?: string;
};

type ScoredImageCandidate = {
  candidate: RawImageCandidate;
  width: number | null;
  height: number | null;
  ratio: GeneratedImageMapAsset['ratio'];
  metrics: ImagePipelineMetricsProfile;
  classification: ImagePipelineClassificationProfile;
  score: ImagePipelineScoreProfile;
  duplicateOf: string | null;
  duplicateKind: ImagePipelineDuplicateKind | null;
  exportStatus: 'selected' | 'reserved' | 'discarded';
  selectionRole: ImagePipelineSelectionRole | null;
  selectionRank: number | null;
  exportFilename: string | null;
  publicPath: string | null;
  discard: boolean;
};

type ImageRole = NonNullable<GeneratedImageMapAsset['roles']>[number];

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeStem(fileName: string) {
  return path
    .parse(fileName)
    .name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokenizeFeaturedItem(value: string) {
  return tokenize(value).filter((token) => token.length >= 3);
}

function jaccardSimilarity(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const intersection = [...leftSet].filter((item) => rightSet.has(item)).length;
  const union = new Set([...leftSet, ...rightSet]).size;
  return union === 0 ? 0 : intersection / union;
}

function hammingDistance(left?: string | null, right?: string | null) {
  if (!left || !right || left.length !== right.length) {
    return Number.POSITIVE_INFINITY;
  }

  let distance = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) distance += 1;
  }

  return distance;
}

function sha1(buffer: Buffer) {
  return createHash('sha1').update(buffer).digest('hex');
}

function buildImageRatio(width: number | null, height: number | null): GeneratedImageMapAsset['ratio'] {
  if (!width || !height) return 'portrait';

  const ratio = width / height;
  if (ratio >= 1.8) return 'ultrawide';
  if (ratio >= 1.05) return 'landscape';
  if (ratio >= 0.95) return 'square';
  return 'portrait';
}

function parseSvgDimensions(source: string) {
  const widthMatch = source.match(/\bwidth=["']?([\d.]+)(px)?["']?/i);
  const heightMatch = source.match(/\bheight=["']?([\d.]+)(px)?["']?/i);

  if (widthMatch && heightMatch) {
    return {
      width: Number(widthMatch[1]),
      height: Number(heightMatch[1]),
    };
  }

  const viewBoxMatch = source.match(/\bviewBox=["']?([\d.\s-]+)["']?/i);
  if (!viewBoxMatch) return null;

  const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some((item) => Number.isNaN(item))) return null;

  return {
    width: parts[2],
    height: parts[3],
  };
}

function readImageDimensions(buffer: Buffer, extension: string) {
  if (extension === '.png' && buffer.length >= 24) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if ((extension === '.jpg' || extension === '.jpeg') && buffer.length >= 4) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      const blockLength = buffer.readUInt16BE(offset + 2);
      const isSofMarker =
        marker === 0xc0 ||
        marker === 0xc1 ||
        marker === 0xc2 ||
        marker === 0xc3 ||
        marker === 0xc5 ||
        marker === 0xc6 ||
        marker === 0xc7 ||
        marker === 0xc9 ||
        marker === 0xca ||
        marker === 0xcb ||
        marker === 0xcd ||
        marker === 0xce ||
        marker === 0xcf;

      if (isSofMarker && offset + 8 < buffer.length) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        };
      }

      if (!blockLength) break;
      offset += 2 + blockLength;
    }
  }

  if (extension === '.gif' && buffer.length >= 10) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  if (extension === '.webp' && buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF') {
    const chunkType = buffer.toString('ascii', 12, 16);

    if (chunkType === 'VP8X') {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }

    if (chunkType === 'VP8 ') {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
      };
    }

    if (chunkType === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }

  if (extension === '.svg') {
    const dimensions = parseSvgDimensions(buffer.toString('utf8'));
    if (dimensions) {
      return dimensions;
    }
  }

  return null;
}

function findMetricsScriptPath(projectRoot: string) {
  return path.join(projectRoot, 'scripts', 'get-image-metrics.ps1');
}

function loadPowerShellMetrics(projectRoot: string, filePaths: string[]) {
  if (process.platform !== 'win32' || filePaths.length === 0) {
    return new Map<string, PowerShellMetricResult>();
  }

  const scriptPath = findMetricsScriptPath(projectRoot);
  if (!existsSync(scriptPath)) {
    return new Map<string, PowerShellMetricResult>();
  }

  try {
    const output = execFileSync(
      'powershell',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...filePaths],
      {
        cwd: projectRoot,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      },
    ).trim();

    if (!output) {
      return new Map<string, PowerShellMetricResult>();
    }

    const parsed = JSON.parse(output) as PowerShellMetricResult | PowerShellMetricResult[];
    const results = Array.isArray(parsed) ? parsed : [parsed];
    return new Map(results.filter((item) => item.path).map((item) => [item.path, item]));
  } catch {
    return new Map<string, PowerShellMetricResult>();
  }
}

function listRawImages(rawImageFolder: string, existingMap?: GeneratedImageMapFile | null) {
  if (!existsSync(rawImageFolder)) {
    throw new Error(`Raw image folder not found: ${rawImageFolder}`);
  }

  const existingIds = new Map<string, string>();
  for (const asset of existingMap?.assets ?? []) {
    if (asset.originalFilename) {
      existingIds.set(asset.originalFilename.toLowerCase(), asset.id);
    }
  }

  const files = readdirSync(rawImageFolder, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  const generatedIds = new Set<string>();
  let genericCounter = 0;

  return files.flatMap((fileName) => {
    const extension = path.extname(fileName).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      return [];
    }

    const absolutePath = path.join(rawImageFolder, fileName);
    const buffer = readFileSync(absolutePath);
    const relativePath = path.posix.join('images', fileName);
    const explicitId = existingIds.get(fileName.toLowerCase());
    const normalizedStem = normalizeStem(fileName);
    const meaningfulTokens = tokenize(normalizedStem).filter((token) => !GENERIC_NAME_TOKENS.has(token));

    let stableId = explicitId ?? normalizedStem;
    if (!explicitId && (stableId === '' || meaningfulTokens.length === 0)) {
      genericCounter += 1;
      stableId = `image-${genericCounter}`;
    }

    while (generatedIds.has(stableId)) {
      genericCounter += 1;
      stableId = `${stableId}-${genericCounter}`;
    }

    generatedIds.add(stableId);

    return [
      {
        absolutePath,
        relativePath,
        fileName,
        extension,
        buffer,
        fileSizeBytes: statSync(absolutePath).size,
        stableId,
      } satisfies RawImageCandidate,
    ];
  });
}

function scoreRange(value: number | null | undefined, ideal: number, tolerance: number, minScore = 15) {
  if (value === null || value === undefined) return 55;
  const distance = Math.abs(value - ideal);
  const normalized = clamp(100 - (distance / tolerance) * 100, minScore, 100);
  return round(normalized);
}

function determinePrimaryCategory(tokens: string[], context: ImagePipelineContext, candidate: RawImageCandidate) {
  if (candidate.extension === '.svg' || tokens.some((token) => CLASSIFICATION_KEYWORDS.logo.includes(token))) {
    return 'logo' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS.fallback.includes(token))) {
    return 'fallback' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS.exterior.includes(token))) {
    return 'exterior' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS.interior.includes(token))) {
    return 'interior' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS.staff.includes(token))) {
    return 'staff' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS['counter-service'].includes(token))) {
    return 'counter-service' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS['hero-candidate'].includes(token))) {
    return 'hero-candidate' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS.dessert.includes(token))) {
    return 'dessert' as const;
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS.drinks.includes(token))) {
    return 'drinks' as const;
  }

  if (context.niche === 'restaurant') {
    const foodTokens = [
      ...CLASSIFICATION_KEYWORDS['food-close-up'],
      ...CLASSIFICATION_KEYWORDS.gallery,
      ...tokenize(context.primaryCategory ?? ''),
    ];

    if (tokens.some((token) => foodTokens.includes(token))) {
      return 'food-close-up' as const;
    }
  }

  if (tokens.some((token) => CLASSIFICATION_KEYWORDS.gallery.includes(token))) {
    return 'gallery' as const;
  }

  return 'unknown' as const;
}

function classifyCandidate(candidate: RawImageCandidate, context: ImagePipelineContext): ImagePipelineClassificationProfile {
  const tokens = tokenize(normalizeStem(candidate.fileName));
  const reasons: string[] = [];
  const secondaryCategories = new Set<ImagePipelineCategory>();
  const primaryCategory = determinePrimaryCategory(tokens, context, candidate);

  if (primaryCategory !== 'unknown') {
    reasons.push(`Filename signals map cleanly to "${primaryCategory}".`);
  } else {
    reasons.push('Filename is not descriptive enough for a more specific role.');
  }

  let matchedFeaturedItemTitle: string | null = null;
  let matchedFeaturedItemId: string | null = null;
  let featuredItemScore = 0;

  for (const item of context.featuredItems) {
    const itemTokens = tokenizeFeaturedItem(item.title);
    const overlap = jaccardSimilarity(tokens, itemTokens);
    if (overlap > featuredItemScore) {
      featuredItemScore = overlap;
      matchedFeaturedItemTitle = item.title;
      matchedFeaturedItemId = item.imageAssetId ?? null;
    }
  }

  if (featuredItemScore >= 0.35) {
    secondaryCategories.add('signature-dish');
    reasons.push(`Filename overlaps with featured item "${matchedFeaturedItemTitle}".`);
  }

  if (primaryCategory === 'hero-candidate') {
    secondaryCategories.add('gallery');
    if (context.niche === 'restaurant') secondaryCategories.add('ambience');
  }

  if (primaryCategory === 'food-close-up') {
    secondaryCategories.add('gallery');
  }

  if (primaryCategory === 'interior') {
    secondaryCategories.add('ambience');
    secondaryCategories.add('gallery');
  }

  if (primaryCategory === 'exterior') {
    secondaryCategories.add('gallery');
  }

  if (primaryCategory === 'dessert' || primaryCategory === 'drinks') {
    secondaryCategories.add('gallery');
    secondaryCategories.add('food-close-up');
  }

  if (primaryCategory === 'unknown' && context.niche === 'restaurant') {
    secondaryCategories.add('gallery');
    reasons.push('Restaurant fallback keeps unknown files as gallery candidates until proven weak.');
  }

  const confidence =
    primaryCategory === 'unknown'
      ? featuredItemScore >= 0.35
        ? 'medium'
        : 'low'
      : featuredItemScore >= 0.35 || primaryCategory === 'hero-candidate' || primaryCategory === 'exterior'
        ? 'high'
        : 'medium';

  const resolvedPrimary =
    primaryCategory === 'food-close-up' && featuredItemScore >= 0.45 ? ('signature-dish' as const) : primaryCategory;

  if (resolvedPrimary === 'signature-dish') {
    reasons.push('Promoted to signature-dish because the file strongly matches a known featured item.');
  }

  return {
    primaryCategory: resolvedPrimary,
    secondaryCategories: [...secondaryCategories],
    confidence,
    matchedFeaturedItemId,
    matchedFeaturedItemTitle,
    reasons,
  };
}

function buildMetrics(candidate: RawImageCandidate, powerShellMetrics: Map<string, PowerShellMetricResult>) {
  const metric = powerShellMetrics.get(candidate.absolutePath);
  const dimensions = readImageDimensions(candidate.buffer, candidate.extension);

  return {
    width: metric?.width ?? dimensions?.width ?? null,
    height: metric?.height ?? dimensions?.height ?? null,
    metrics: {
      format: candidate.extension.replace('.', ''),
      fileSizeBytes: candidate.fileSizeBytes,
      metricSource: metric && !metric.error ? 'powershell' : 'basic',
      averageBrightness: metric?.averageBrightness ?? null,
      contrastDeviation: metric?.contrastDeviation ?? null,
      edgeStrength: metric?.edgeStrength ?? null,
      colorfulness: metric?.colorfulness ?? null,
      perceptualHash: metric?.perceptualHash ?? null,
      sampleCount: metric?.sampleCount ?? null,
    } satisfies ImagePipelineMetricsProfile,
  };
}

function buildUtilityScore(classification: ImagePipelineClassificationProfile, context: ImagePipelineContext) {
  const baseByCategory: Record<ImagePipelineCategory, number> = {
    'hero-candidate': 96,
    'food-close-up': 84,
    'product-close-up': 74,
    'signature-dish': 92,
    dessert: 75,
    drinks: 72,
    gallery: 68,
    ambience: 70,
    interior: 66,
    exterior: context.niche === 'restaurant' ? 72 : 78,
    'counter-service': 58,
    staff: 54,
    logo: 48,
    fallback: 36,
    weak: 25,
    discard: 10,
    duplicate: 5,
    'near-duplicate': 18,
    unknown: 52,
  };

  let utility = baseByCategory[classification.primaryCategory];
  if (classification.matchedFeaturedItemTitle) utility += 6;
  if (
    context.visualFamily === 'food-warm-editorial' &&
    ['hero-candidate', 'signature-dish', 'food-close-up', 'dessert'].includes(classification.primaryCategory)
  ) {
    utility += 4;
  }
  if (context.sectorType === 'restaurant' && classification.primaryCategory === 'exterior') {
    utility -= 4;
  }

  return clamp(round(utility));
}

function buildHeroPotential(
  classification: ImagePipelineClassificationProfile,
  metrics: ImagePipelineMetricsProfile,
  ratio: GeneratedImageMapAsset['ratio'],
  context: ImagePipelineContext,
) {
  let score = 40;

  if (classification.primaryCategory === 'hero-candidate') score += 30;
  if (classification.primaryCategory === 'signature-dish') score += 20;
  if (classification.primaryCategory === 'food-close-up') score += 14;
  if (classification.secondaryCategories.includes('ambience')) score += 8;
  if (classification.primaryCategory === 'exterior') score += 6;

  if (context.visualFamily === 'food-warm-editorial') {
    if (ratio === 'portrait') score += 8;
    if ((metrics.colorfulness ?? 0) >= 60) score += 6;
  } else if (ratio === 'landscape' || ratio === 'ultrawide') {
    score += 8;
  }

  if ((metrics.edgeStrength ?? 0) >= 80) score += 6;
  if ((metrics.averageBrightness ?? 120) >= 75 && (metrics.averageBrightness ?? 120) <= 185) score += 6;

  return clamp(round(score));
}

function buildScore(
  classification: ImagePipelineClassificationProfile,
  metrics: ImagePipelineMetricsProfile,
  width: number | null,
  height: number | null,
  ratio: GeneratedImageMapAsset['ratio'],
  context: ImagePipelineContext,
): ImagePipelineScoreProfile {
  const minDimension = width && height ? Math.min(width, height) : 0;
  const resolution =
    minDimension >= 1400 ? 100 : minDimension >= 1000 ? 84 : minDimension >= 800 ? 68 : minDimension >= 640 ? 56 : 34;
  const lighting = scoreRange(metrics.averageBrightness, 128, 110);
  const contrast = scoreRange(metrics.contrastDeviation, 58, 45);
  const sharpness = scoreRange(metrics.edgeStrength, 92, 70);
  const colorfulness = scoreRange(metrics.colorfulness, context.niche === 'restaurant' ? 72 : 55, 55);
  const utility = buildUtilityScore(classification, context);
  const uniqueness = 100;
  const heroPotential = buildHeroPotential(classification, metrics, ratio, context);
  const total = round(
    resolution * 0.14 +
      lighting * 0.14 +
      contrast * 0.1 +
      sharpness * 0.14 +
      colorfulness * 0.08 +
      utility * 0.24 +
      uniqueness * 0.08 +
      heroPotential * 0.08,
  );

  return {
    total,
    resolution,
    lighting,
    contrast,
    sharpness,
    colorfulness,
    utility,
    uniqueness,
    heroPotential,
    reasons: [
      `${resolution >= 68 ? 'Good' : 'Limited'} resolution for current web use.`,
      `${lighting >= 65 ? 'Balanced' : 'Less ideal'} brightness for first-screen use.`,
      `${sharpness >= 65 ? 'Decent' : 'Weak'} edge detail by heuristic sampling.`,
      `Utility is driven by "${classification.primaryCategory}" for a ${context.niche} business.`,
    ],
  };
}

function applyDuplicatePenalties(entries: ScoredImageCandidate[]) {
  const byHash = new Map<string, ScoredImageCandidate[]>();

  for (const entry of entries) {
    const hash = sha1(entry.candidate.buffer);
    const list = byHash.get(hash) ?? [];
    list.push(entry);
    byHash.set(hash, list);
  }

  for (const group of byHash.values()) {
    if (group.length < 2) continue;

    group.sort((left, right) => right.score.total - left.score.total);
    const canonical = group[0];
    for (const duplicate of group.slice(1)) {
      duplicate.duplicateOf = canonical.candidate.stableId;
      duplicate.duplicateKind = 'exact';
      duplicate.score.uniqueness = 0;
      duplicate.score.total = round(Math.max(duplicate.score.total - 55, 0));
    }
  }

  for (let index = 0; index < entries.length; index += 1) {
    const left = entries[index];
    if (left.duplicateKind === 'exact') continue;

    for (let next = index + 1; next < entries.length; next += 1) {
      const right = entries[next];
      if (right.duplicateKind === 'exact') continue;

      const sameCategory =
        left.classification.primaryCategory === right.classification.primaryCategory ||
        (left.classification.matchedFeaturedItemTitle &&
          left.classification.matchedFeaturedItemTitle === right.classification.matchedFeaturedItemTitle);
      const distance = hammingDistance(left.metrics.perceptualHash, right.metrics.perceptualHash);
      if (!sameCategory || distance > 10) continue;

      const [canonical, alternate] = left.score.total >= right.score.total ? [left, right] : [right, left];
      if (!alternate.duplicateKind) {
        alternate.duplicateOf = canonical.candidate.stableId;
        alternate.duplicateKind = 'near';
        alternate.score.uniqueness = 56;
        alternate.score.total = round(Math.max(alternate.score.total - 18, 0));
      }
    }
  }
}

function chooseHero(entries: ScoredImageCandidate[]) {
  const heroCandidates = entries
    .filter((entry) => !entry.discard && entry.duplicateKind !== 'exact')
    .sort((left, right) => right.score.heroPotential - left.score.heroPotential || right.score.total - left.score.total);

  return {
    heroMain: heroCandidates[0] ?? null,
    heroAlternates: heroCandidates.slice(1, 3),
  };
}

function chooseFeaturedDishes(entries: ScoredImageCandidate[], context: ImagePipelineContext) {
  const selected = new Set<string>();
  const results: ScoredImageCandidate[] = [];

  for (const item of context.featuredItems) {
    const match = entries
      .filter(
        (entry) =>
          !entry.discard &&
          entry.duplicateKind !== 'exact' &&
          entry.classification.matchedFeaturedItemTitle === item.title &&
          !selected.has(entry.candidate.stableId),
      )
      .sort((left, right) => right.score.total - left.score.total)[0];

    if (match) {
      selected.add(match.candidate.stableId);
      results.push(match);
    }
  }

  for (const fallback of entries
    .filter(
      (entry) =>
        !entry.discard &&
        entry.duplicateKind !== 'exact' &&
        ['signature-dish', 'food-close-up', 'dessert', 'drinks'].includes(entry.classification.primaryCategory) &&
        !selected.has(entry.candidate.stableId),
    )
    .sort((left, right) => right.score.total - left.score.total)) {
    if (results.length >= 4) break;
    selected.add(fallback.candidate.stableId);
    results.push(fallback);
  }

  return results;
}

function chooseGallery(entries: ScoredImageCandidate[], excludedIds: Set<string>) {
  const selected: ScoredImageCandidate[] = [];
  const seenHashes = new Set<string>();

  for (const entry of entries
    .filter((item) => !item.discard && item.duplicateKind !== 'exact' && item.classification.primaryCategory !== 'fallback')
    .sort((left, right) => right.score.total - left.score.total)) {
    if (selected.length >= 5) break;
    if (excludedIds.has(entry.candidate.stableId)) continue;

    const hash = entry.metrics.perceptualHash ?? entry.candidate.stableId;
    if (seenHashes.has(hash)) continue;

    selected.push(entry);
    seenHashes.add(hash);
  }

  return selected;
}

function chooseFallback(entries: ScoredImageCandidate[]) {
  return (
    entries.find((entry) => entry.classification.primaryCategory === 'fallback' && entry.duplicateKind !== 'exact') ??
    entries
      .filter((entry) => !entry.discard && entry.duplicateKind !== 'exact')
      .sort((left, right) => right.score.total - left.score.total)
      .at(-1) ??
    null
  );
}

function assignSelections(entries: ScoredImageCandidate[], context: ImagePipelineContext) {
  const { heroMain, heroAlternates } = chooseHero(entries);
  const dishAssets = chooseFeaturedDishes(entries, context);
  const exclusionSet = new Set([heroMain?.candidate.stableId, ...dishAssets.map((item) => item.candidate.stableId)]);
  const galleryAssets = chooseGallery(entries, exclusionSet);
  const ambienceAssets = entries.filter((entry) =>
    ['hero-candidate', 'interior'].includes(entry.classification.primaryCategory) ||
    entry.classification.secondaryCategories.includes('ambience'),
  );
  const exteriorAssets = entries.filter((entry) => entry.classification.primaryCategory === 'exterior');
  const fallbackAsset = chooseFallback(entries);

  if (heroMain) {
    heroMain.exportStatus = 'selected';
    heroMain.selectionRole = 'hero-main';
    heroMain.selectionRank = 1;
  }

  heroAlternates.forEach((entry, index) => {
    if (entry.selectionRole) return;
    entry.exportStatus = 'reserved';
    entry.selectionRole = 'hero-alt';
    entry.selectionRank = index + 1;
  });

  dishAssets.forEach((entry, index) => {
    entry.exportStatus = 'selected';
    entry.selectionRole = 'dish';
    entry.selectionRank = index + 1;
  });

  galleryAssets.forEach((entry, index) => {
    if (entry.selectionRole) return;
    entry.exportStatus = 'selected';
    entry.selectionRole = 'gallery';
    entry.selectionRank = index + 1;
  });

  ambienceAssets.forEach((entry, index) => {
    if (entry.selectionRole) return;
    entry.exportStatus = 'reserved';
    entry.selectionRole = 'ambience';
    entry.selectionRank = index + 1;
  });

  exteriorAssets.forEach((entry, index) => {
    if (entry.selectionRole) return;
    entry.exportStatus = 'selected';
    entry.selectionRole = 'exterior';
    entry.selectionRank = index + 1;
  });

  if (fallbackAsset && !fallbackAsset.selectionRole) {
    fallbackAsset.exportStatus = 'reserved';
    fallbackAsset.selectionRole = 'fallback';
    fallbackAsset.selectionRank = 1;
  }

  for (const entry of entries) {
    if (entry.duplicateKind === 'exact' || entry.score.total < 42) {
      entry.exportStatus = 'discarded';
      entry.selectionRole = 'discard';
      entry.selectionRank = null;
      entry.discard = true;
      continue;
    }

    if (!entry.selectionRole) {
      entry.exportStatus = 'reserved';
      entry.selectionRole = 'reserve';
      entry.selectionRank = null;
    }
  }

  return {
    heroMain,
    heroAlternates,
    dishAssets,
    galleryAssets,
    ambienceAssets,
    exteriorAssets,
    fallbackAsset,
  };
}

function assignExportFilenames(entries: ScoredImageCandidate[], context: ImagePipelineContext) {
  const counters = {
    dish: 0,
    gallery: 0,
    interior: 0,
    exterior: 0,
    staff: 0,
    logo: 0,
    fallback: 0,
  };

  for (const entry of entries) {
    if (entry.exportStatus === 'discarded') continue;

    const extension = entry.candidate.extension === '.jpeg' ? '.jpg' : entry.candidate.extension;
    let fileBase = 'gallery-1';

    switch (entry.selectionRole) {
      case 'hero-main':
        fileBase = 'hero-main';
        break;
      case 'dish':
        counters.dish += 1;
        fileBase = `dish-${counters.dish}`;
        break;
      case 'gallery':
      case 'hero-alt':
      case 'reserve':
        counters.gallery += 1;
        fileBase = `gallery-${counters.gallery}`;
        break;
      case 'ambience':
      case 'interior':
        counters.interior += 1;
        fileBase = `interior-${counters.interior}`;
        break;
      case 'exterior':
        counters.exterior += 1;
        fileBase = `exterior-${counters.exterior}`;
        break;
      case 'staff':
        counters.staff += 1;
        fileBase = `staff-${counters.staff}`;
        break;
      case 'logo':
        counters.logo += 1;
        fileBase = `logo-${counters.logo}`;
        break;
      case 'fallback':
        counters.fallback += 1;
        fileBase = `fallback-${counters.fallback}`;
        break;
      default:
        break;
    }

    entry.exportFilename = `${fileBase}${extension}`;
    entry.publicPath = `${context.outputPublicBase}/${entry.exportFilename}`;
  }
}

function cleanGeneratedOutputDirectory(outputDirectory: string, keepNames: Set<string>) {
  if (!existsSync(outputDirectory)) return;

  for (const entry of readdirSync(outputDirectory, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!GENERATED_OUTPUT_PATTERN.test(entry.name)) continue;
    if (keepNames.has(entry.name)) continue;

    unlinkSync(path.join(outputDirectory, entry.name));
  }
}

function exportImages(entries: ScoredImageCandidate[], outputDirectory: string) {
  mkdirSync(outputDirectory, { recursive: true });
  const keepNames = new Set(entries.map((entry) => entry.exportFilename).filter(Boolean) as string[]);
  cleanGeneratedOutputDirectory(outputDirectory, keepNames);

  for (const entry of entries) {
    if (!entry.exportFilename) continue;
    copyFileSync(entry.candidate.absolutePath, path.join(outputDirectory, entry.exportFilename));
  }
}

function buildRoles(classification: ImagePipelineClassificationProfile, selectionRole: ImagePipelineSelectionRole | null) {
  const roles = new Set<ImageRole>();

  switch (classification.primaryCategory) {
    case 'hero-candidate':
      roles.add('hero');
      roles.add('gallery');
      roles.add('ambience');
      break;
    case 'signature-dish':
    case 'food-close-up':
    case 'dessert':
    case 'drinks':
      roles.add('dish');
      roles.add('gallery');
      roles.add('detail');
      break;
    case 'interior':
      roles.add('interior');
      roles.add('ambience');
      roles.add('gallery');
      break;
    case 'exterior':
      roles.add('exterior');
      roles.add('gallery');
      break;
    case 'staff':
      roles.add('social');
      break;
    case 'fallback':
      roles.add('fallback');
      break;
    default:
      roles.add('gallery');
      break;
  }

  if (selectionRole === 'hero-main' || selectionRole === 'hero-alt') roles.add('hero');
  if (selectionRole === 'fallback') roles.add('fallback');
  if (selectionRole === 'discard') roles.add('discard');

  return [...roles];
}

function buildKind(selectionRole: ImagePipelineSelectionRole | null, classification: ImagePipelineClassificationProfile) {
  if (selectionRole === 'hero-main') return 'hero' as const;
  if (classification.primaryCategory === 'logo') return 'texture' as const;
  if (['signature-dish', 'food-close-up', 'dessert', 'drinks', 'fallback'].includes(classification.primaryCategory)) {
    return 'detail' as const;
  }
  return 'gallery' as const;
}

function buildQuality(totalScore: number, classification: ImagePipelineClassificationProfile, exportStatus: ScoredImageCandidate['exportStatus']) {
  if (exportStatus === 'discarded') return 'discard' as const;
  if (classification.primaryCategory === 'fallback' && totalScore < 60) return 'weak' as const;
  if (totalScore >= 82) return 'strong' as const;
  if (totalScore >= 63) return 'usable' as const;
  if (totalScore >= 45) return 'weak' as const;
  return 'discard' as const;
}

function buildReviewStatus(exportStatus: ScoredImageCandidate['exportStatus'], quality: GeneratedImageMapAsset['quality']) {
  if (exportStatus === 'discarded' || quality === 'discard') return 'discard' as const;
  if (exportStatus === 'reserved' || quality === 'weak') return 'backup' as const;
  return 'approved' as const;
}

const GENERIC_ASSET_LABEL_TOKENS = new Set([
  ...GENERIC_NAME_TOKENS,
  'hero',
  'main',
  'gallery',
  'dish',
  'fallback',
  'reserve',
  'backup',
  'support',
  'detail',
  'interior',
  'exterior',
  'plate',
  'food',
  'close',
  'up',
  'view',
  'shot',
]);

function titleCaseTokens(tokens: string[]) {
  return tokens.map((token) => `${token[0]?.toUpperCase() ?? ''}${token.slice(1)}`).join(' ');
}

function buildFilenameLabel(fileName: string) {
  const tokens = tokenize(normalizeStem(fileName)).filter(
    (token) => !GENERIC_ASSET_LABEL_TOKENS.has(token) && !/^\d+$/u.test(token),
  );

  if (tokens.length === 0) return null;

  return titleCaseTokens(tokens);
}

function buildSubject(classification: ImagePipelineClassificationProfile, candidate: RawImageCandidate) {
  if (classification.matchedFeaturedItemTitle) return classification.matchedFeaturedItemTitle;

  const filenameLabel = buildFilenameLabel(candidate.fileName);
  if (filenameLabel) return filenameLabel;

  switch (classification.primaryCategory) {
    case 'hero-candidate':
      return 'Table spread';
    case 'dessert':
      return 'Dessert highlight';
    case 'drinks':
      return 'Drink highlight';
    case 'interior':
      return 'Interior view';
    case 'exterior':
      return 'Storefront';
    case 'staff':
      return 'Staff portrait';
    case 'fallback':
      return 'Fallback reserve image';
    case 'food-close-up':
    case 'signature-dish':
      return 'Featured food';
    default:
      return 'Gallery support image';
  }
}

function buildTreatment(classification: ImagePipelineClassificationProfile, candidate: RawImageCandidate) {
  if (classification.matchedFeaturedItemTitle) {
    return slugify(classification.matchedFeaturedItemTitle).replace(/-/g, ' ');
  }

  const filenameLabel = buildFilenameLabel(candidate.fileName);
  if (filenameLabel) {
    return filenameLabel.toLowerCase();
  }

  switch (classification.primaryCategory) {
    case 'hero-candidate':
      return 'hero spread';
    case 'dessert':
      return 'dessert highlight';
    case 'drinks':
      return 'drink highlight';
    case 'interior':
      return 'interior support';
    case 'exterior':
      return 'exterior support';
    case 'fallback':
      return 'fallback reserve';
    default:
      return classification.primaryCategory.replace(/-/g, ' ');
  }
}

function buildAltText(
  classification: ImagePipelineClassificationProfile,
  subject: string,
  context: ImagePipelineContext,
  candidate: RawImageCandidate,
) {
  if (classification.matchedFeaturedItemTitle) {
    return `${classification.matchedFeaturedItemTitle} served at ${context.businessName}.`;
  }

  const filenameLabel = buildFilenameLabel(candidate.fileName);
  if (filenameLabel) {
    return `${filenameLabel} at ${context.businessName}.`;
  }

  switch (classification.primaryCategory) {
    case 'hero-candidate':
      return `A table spread at ${context.businessName}.`;
    case 'dessert':
      return `A dessert served at ${context.businessName}.`;
    case 'drinks':
      return `A drink served at ${context.businessName}.`;
    case 'interior':
      return `Interior details at ${context.businessName}.`;
    case 'exterior':
      return `The exterior of ${context.businessName}.`;
    case 'staff':
      return `A staff image from ${context.businessName}.`;
    case 'food-close-up':
    case 'signature-dish':
      return `A plated dish at ${context.businessName}.`;
    default:
      return `${subject} at ${context.businessName}.`;
  }
}

function buildDesiredCrops(
  selectionRole: ImagePipelineSelectionRole | null,
  ratio: GeneratedImageMapAsset['ratio'],
): Array<'portrait' | 'landscape' | 'square' | 'social'> {
  if (selectionRole === 'hero-main') return ['portrait', 'landscape', 'square'];
  if (selectionRole === 'gallery' || selectionRole === 'ambience' || selectionRole === 'exterior') {
    return ratio === 'portrait' ? ['portrait', 'square'] : ['landscape', 'square'];
  }
  if (selectionRole === 'dish' || selectionRole === 'fallback') return ['portrait', 'square'];
  return ratio === 'landscape' ? ['landscape', 'square'] : ['portrait', 'square'];
}

function buildAssetNote(entry: ScoredImageCandidate) {
  const noteParts = [...entry.score.reasons];
  if (entry.duplicateKind === 'near') noteParts.push(`Marked as a near-duplicate of ${entry.duplicateOf}.`);
  if (entry.duplicateKind === 'exact') noteParts.push(`Marked as an exact duplicate of ${entry.duplicateOf}.`);
  if (entry.selectionRole === 'fallback') noteParts.push('Kept as a fallback reserve because it still helps if the main set shrinks.');
  if (entry.selectionRole === 'hero-main') noteParts.push('Selected as the main hero image.');
  return noteParts.join(' ');
}

function buildNotes(entries: ScoredImageCandidate[], context: ImagePipelineContext) {
  const notes = [
    `Generated from business-input/${context.slug}/raw/images using images:process.`,
    `Exported runtime assets live under public${context.outputPublicBase}.`,
  ];

  if (!entries.some((entry) => entry.classification.primaryCategory === 'exterior' && !entry.discard)) {
    notes.push('No strong exterior image was detected, so local reassurance should stay address-led.');
  }
  if (!entries.some((entry) => entry.classification.primaryCategory === 'logo' && !entry.discard)) {
    notes.push('No logo or brand asset was detected in the current input set.');
  }
  if (!entries.some((entry) => entry.classification.primaryCategory === 'hero-candidate' && !entry.discard)) {
    notes.push('No explicit hero file was detected; hero selection fell back to the strongest general image.');
  }

  return notes;
}

function createGeneratedAsset(entry: ScoredImageCandidate, context: ImagePipelineContext): GeneratedImageMapAsset {
  const subject = buildSubject(entry.classification, entry.candidate);
  const treatment = buildTreatment(entry.classification, entry.candidate);
  const pipeline: ImagePipelineMeta = {
    sourceRelativePath: entry.candidate.relativePath.replace(/\\/g, '/'),
    exportFilename: entry.exportFilename,
    exportStatus: entry.exportStatus,
    selectionRole: entry.selectionRole,
    selectionRank: entry.selectionRank,
    duplicateOf: entry.duplicateOf,
    duplicateKind: entry.duplicateKind,
    metrics: entry.metrics,
    score: entry.score,
    classification: entry.classification,
  };

  return {
    id: entry.candidate.stableId,
    publicPath: entry.publicPath ?? `${context.outputPublicBase}/${entry.candidate.fileName}`,
    originalFilename: entry.candidate.fileName,
    kind: buildKind(entry.selectionRole, entry.classification),
    ratio: entry.ratio,
    roles: buildRoles(entry.classification, entry.selectionRole),
    quality: buildQuality(entry.score.total, entry.classification, entry.exportStatus),
    reviewStatus: buildReviewStatus(entry.exportStatus, buildQuality(entry.score.total, entry.classification, entry.exportStatus)),
    heroCandidate: entry.score.heroPotential >= 72,
    discard: entry.exportStatus === 'discarded',
    subject,
    treatment,
    suggestedAlt: buildAltText(entry.classification, subject, context, entry.candidate),
    desiredCrops: buildDesiredCrops(entry.selectionRole, entry.ratio),
    width: entry.width,
    height: entry.height,
    notes: buildAssetNote(entry),
    pipeline,
  };
}

function updateRawAssetMetadata(rawFilePath: string, imageMap: GeneratedImageMapFile, context: ImagePipelineContext) {
  const parsed = JSON.parse(readFileSync(rawFilePath, 'utf8')) as BusinessRawFile;
  parsed.updatedAt = imageMap.updatedAt;
  parsed.assets = {
    assetIds: imageMap.assets.map((asset) => asset.id),
    sourceFolder: `public${context.outputPublicBase}`,
    notes: [
      `Generated from business-input/${context.slug}/raw/images by images:process.`,
      `Runtime image exports now live in public${context.outputPublicBase}.`,
    ],
  };

  writeFileSync(rawFilePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
}

export function generateImageMap(params: {
  projectRoot: string;
  context: ImagePipelineContext;
  raw: BusinessRawFile;
  existingMap?: GeneratedImageMapFile | null;
}) {
  const { projectRoot, context, raw, existingMap } = params;
  const candidates = listRawImages(context.rawImageFolder, existingMap);
  if (candidates.length === 0) {
    throw new Error(`No supported images found in ${context.rawImageFolder}.`);
  }

  const powerShellMetrics = loadPowerShellMetrics(
    projectRoot,
    candidates.filter((candidate) => POWERSHELL_METRIC_EXTENSIONS.has(candidate.extension)).map((candidate) => candidate.absolutePath),
  );

  const analyzedEntries: ScoredImageCandidate[] = candidates.map((candidate) => {
    const { metrics, width, height } = buildMetrics(candidate, powerShellMetrics);
    const ratio = buildImageRatio(width, height);
    const classification = classifyCandidate(candidate, context);
    const score = buildScore(classification, metrics, width, height, ratio, context);

    return {
      candidate,
      width,
      height,
      ratio,
      metrics,
      classification,
      score,
      duplicateOf: null,
      duplicateKind: null,
      exportStatus: 'reserved',
      selectionRole: null,
      selectionRank: null,
      exportFilename: null,
      publicPath: null,
      discard: false,
    };
  });

  applyDuplicatePenalties(analyzedEntries);
  const selection = assignSelections(analyzedEntries, context);
  assignExportFilenames(analyzedEntries, context);
  exportImages(analyzedEntries.filter((entry) => entry.exportFilename), context.outputDirectory);

  const publicPathById = new Map(
    analyzedEntries
      .filter((entry): entry is ScoredImageCandidate & { publicPath: string } => Boolean(entry.publicPath))
      .map((entry) => [entry.candidate.stableId, entry.publicPath]),
  );
  for (const entry of analyzedEntries) {
    if (!entry.publicPath && entry.duplicateOf) {
      entry.publicPath = publicPathById.get(entry.duplicateOf) ?? null;
    }
  }

  return {
    schemaVersion: 2,
    fileKind: 'image-map',
    businessSlug: raw.businessSlug,
    updatedAt: new Date().toISOString(),
    summary: {
      totalAssets: analyzedEntries.length,
      selectedAssets: analyzedEntries.filter((entry) => entry.exportStatus === 'selected').length,
      reservedAssets: analyzedEntries.filter((entry) => entry.exportStatus === 'reserved').length,
      discardedAssets: analyzedEntries.filter((entry) => entry.exportStatus === 'discarded').length,
      duplicateAssets: analyzedEntries.filter((entry) => entry.duplicateKind !== null).length,
      weakAssets: analyzedEntries.filter((entry) => buildQuality(entry.score.total, entry.classification, entry.exportStatus) === 'weak').length,
      heroCandidates: analyzedEntries.filter((entry) => entry.score.heroPotential >= 72).length,
    },
    selection: {
      heroMainAssetId: selection.heroMain?.candidate.stableId ?? null,
      heroAlternateAssetIds: selection.heroAlternates.map((entry) => entry.candidate.stableId),
      dishAssetIds: selection.dishAssets.map((entry) => entry.candidate.stableId),
      galleryAssetIds: selection.galleryAssets.map((entry) => entry.candidate.stableId),
      ambienceAssetIds: selection.ambienceAssets.filter((entry) => !entry.discard).map((entry) => entry.candidate.stableId),
      exteriorAssetIds: selection.exteriorAssets.filter((entry) => !entry.discard).map((entry) => entry.candidate.stableId),
      fallbackAssetId: selection.fallbackAsset?.candidate.stableId ?? null,
    },
    assets: analyzedEntries
      .sort((left, right) => {
        const statusWeight = { selected: 0, reserved: 1, discarded: 2 };
        const roleWeight: Record<NonNullable<ScoredImageCandidate['selectionRole']>, number> = {
          'hero-main': 0,
          dish: 1,
          gallery: 2,
          exterior: 3,
          ambience: 4,
          'hero-alt': 5,
          interior: 6,
          staff: 7,
          logo: 8,
          fallback: 9,
          reserve: 10,
          discard: 11,
        };
        return (
          statusWeight[left.exportStatus] - statusWeight[right.exportStatus] ||
          (roleWeight[left.selectionRole ?? 'reserve'] - roleWeight[right.selectionRole ?? 'reserve']) ||
          (left.selectionRank ?? 99) - (right.selectionRank ?? 99) ||
          right.score.total - left.score.total
        );
      })
      .map((entry) => createGeneratedAsset(entry, context)),
    notes: buildNotes(analyzedEntries, context),
  } satisfies GeneratedImageMapFile;
}

export function syncImagePipelineArtifacts(params: {
  rawFilePath: string;
  imageMapPath: string;
  imageMap: GeneratedImageMapFile;
  context: ImagePipelineContext;
}) {
  writeFileSync(params.imageMapPath, `${JSON.stringify(params.imageMap, null, 2)}\n`, 'utf8');
  updateRawAssetMetadata(params.rawFilePath, params.imageMap, params.context);
}
