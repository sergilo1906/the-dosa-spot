import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { generateImageMap, syncImagePipelineArtifacts } from '../src/lib/images/pipeline.ts';
import type { BusinessBriefFile, BusinessRawFile } from '../src/types/business-record';
import type { GeneratedImageMapFile, ImagePipelineContext } from '../src/types/image-pipeline';

const projectRoot = process.cwd();
const businessInputRoot = path.join(projectRoot, 'business-input');
const requestedSlug = process.argv[2] ?? null;

function readJsonFile<T>(filePath: string) {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function listBusinessSlugs() {
  if (!existsSync(businessInputRoot)) return [];

  return readdirSync(businessInputRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function loadExistingMap(normalizedRoot: string) {
  const imageMapPath = path.join(normalizedRoot, 'image-map.json');
  if (!existsSync(imageMapPath)) return null;

  return readJsonFile<GeneratedImageMapFile>(imageMapPath);
}

function buildContext(slug: string, brief: BusinessBriefFile) {
  const outputPublicBase = `/businesses/${slug}/images`;
  return {
    slug,
    businessName: brief.identity.businessName,
    niche: brief.identity.niche,
    primaryCategory: brief.identity.primaryCategory ?? null,
    featuredItems: brief.offer.featuredItems ?? [],
    serviceModes: brief.offer.serviceModes ?? [],
    rawImageFolder: path.join(projectRoot, 'business-input', slug, 'raw', 'images'),
    outputDirectory: path.join(projectRoot, 'public', 'businesses', slug, 'images'),
    outputPublicBase,
  } satisfies ImagePipelineContext;
}

function analyzeSlug(slug: string) {
  const normalizedRoot = path.join(projectRoot, 'business-input', slug, 'normalized');
  const rawFilePath = path.join(normalizedRoot, 'business-raw.json');
  const briefFilePath = path.join(normalizedRoot, 'business-brief.json');
  const imageMapPath = path.join(normalizedRoot, 'image-map.json');

  if (!existsSync(rawFilePath) || !existsSync(briefFilePath)) {
    throw new Error(`Normalized business files not found for "${slug}". Run normalize:business first.`);
  }

  const raw = readJsonFile<BusinessRawFile>(rawFilePath);
  const brief = readJsonFile<BusinessBriefFile>(briefFilePath);
  const existingMap = loadExistingMap(normalizedRoot);
  const context = buildContext(slug, brief);

  const imageMap = generateImageMap({
    projectRoot,
    context,
    raw,
    existingMap,
  });

  syncImagePipelineArtifacts({
    rawFilePath,
    imageMapPath,
    imageMap,
    context,
  });

  console.log(
    `Image pipeline for ${slug}: ${imageMap.summary.selectedAssets} selected, ` +
      `${imageMap.summary.reservedAssets} reserved, ${imageMap.summary.discardedAssets} discarded. ` +
      `Hero: ${imageMap.selection.heroMainAssetId ?? 'none'}.`,
  );
}

const slugs = requestedSlug ? [requestedSlug] : listBusinessSlugs();

if (slugs.length === 0) {
  console.error('No business-input directories found.');
  process.exit(1);
}

for (const slug of slugs) {
  analyzeSlug(slug);
}
