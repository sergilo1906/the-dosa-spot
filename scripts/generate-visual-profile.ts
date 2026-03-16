import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadBusinessMasterRecordSync } from '../src/lib/business/master-record.ts';
import { assertValidSectorProfile } from '../src/lib/sector/engine.ts';
import { analyzeBusinessVisual, assertValidVisualProfile } from '../src/lib/visual/engine.ts';
import type { SectorProfileFile } from '../src/types/sector-engine';

const projectRoot = process.cwd();
const businessInputRoot = path.join(projectRoot, 'business-input');
const requestedSlug = process.argv[2] ?? null;

function statExists(targetPath: string) {
  try {
    statSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

function listBusinessSlugs() {
  if (!statExists(businessInputRoot)) return [];

  return readdirSync(businessInputRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function writeJsonFile(filePath: string, value: unknown) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readJsonFile<T>(filePath: string) {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function analyzeSlug(slug: string) {
  const normalizedRoot = path.join(projectRoot, 'business-input', slug, 'normalized');

  if (!statExists(normalizedRoot)) {
    throw new Error(`Normalized directory not found for "${slug}". Run normalize:business first.`);
  }

  const sectorProfilePath = path.join(normalizedRoot, 'sector-profile.json');
  if (!statExists(sectorProfilePath)) {
    throw new Error(`sector-profile.json not found for "${slug}". Run sector:analyze first.`);
  }

  const record = loadBusinessMasterRecordSync(pathToFileURL(`${path.resolve(normalizedRoot)}${path.sep}`));
  const sectorProfile = assertValidSectorProfile(readJsonFile<SectorProfileFile>(sectorProfilePath));
  const visualProfile = assertValidVisualProfile(analyzeBusinessVisual(record, sectorProfile));

  writeJsonFile(path.join(normalizedRoot, 'visual-profile.json'), visualProfile);

  console.log(
    `Visual profile for ${slug}: ${visualProfile.visualFamily} (${visualProfile.visualConfidence}) -> ${visualProfile.family.label}.`,
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
