import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { demoPresets } from '../src/data/preset-definitions.ts';
import { createBusinessBriefInputFromMasterRecord, loadBusinessMasterRecordSync } from '../src/lib/business/master-record.ts';
import { normalizeBusinessBrief } from '../src/lib/business/normalize.ts';
import { analyzeBusinessAssembly, assertValidAssemblyProfile } from '../src/lib/assembly/engine.ts';
import { assertValidCopyProfile } from '../src/lib/copy/engine.ts';
import { assertValidSectorProfile } from '../src/lib/sector/engine.ts';
import { assertValidVisualProfile } from '../src/lib/visual/engine.ts';
import type { CopyProfileFile } from '../src/types/copy-engine';
import type { SectorProfileFile } from '../src/types/sector-engine';
import type { VisualProfileFile } from '../src/types/visual-engine';

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
  const visualProfilePath = path.join(normalizedRoot, 'visual-profile.json');
  const copyProfilePath = path.join(normalizedRoot, 'copy-profile.json');

  if (!statExists(sectorProfilePath)) {
    throw new Error(`sector-profile.json not found for "${slug}". Run sector:analyze first.`);
  }

  if (!statExists(visualProfilePath)) {
    throw new Error(`visual-profile.json not found for "${slug}". Run visual:analyze first.`);
  }

  if (!statExists(copyProfilePath)) {
    throw new Error(`copy-profile.json not found for "${slug}". Run copy:analyze first.`);
  }

  const record = loadBusinessMasterRecordSync(pathToFileURL(`${path.resolve(normalizedRoot)}${path.sep}`));
  const business = normalizeBusinessBrief(createBusinessBriefInputFromMasterRecord(record));
  const sectorProfile = assertValidSectorProfile(readJsonFile<SectorProfileFile>(sectorProfilePath));
  const visualProfile = assertValidVisualProfile(readJsonFile<VisualProfileFile>(visualProfilePath));
  const copyProfile = assertValidCopyProfile(readJsonFile<CopyProfileFile>(copyProfilePath));
  const assemblyProfile = assertValidAssemblyProfile(
    analyzeBusinessAssembly({
      business,
      record,
      sectorProfile,
      visualProfile,
      copyProfile,
      presets: demoPresets.map((preset) => ({
        slug: preset.slug,
        businessSlug: preset.businessSlug,
        isDefault: preset.isDefault,
      })),
    }),
  );

  writeJsonFile(path.join(normalizedRoot, 'assembly-profile.json'), assemblyProfile);

  console.log(
    `Assembly profile for ${slug}: ${assemblyProfile.visibility.sections.filter((section) => section.show).length} visible sections, ` +
      `${assemblyProfile.ctaMap.hero.primary?.label ?? 'no hero CTA'} as primary action.`,
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
