import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { demoPresets } from '../src/data/preset-definitions.ts';
import { assertValidAssemblyProfile } from '../src/lib/assembly/engine.ts';
import { loadBusinessMasterRecordSync } from '../src/lib/business/master-record.ts';
import { assertValidCopyProfile } from '../src/lib/copy/engine.ts';
import { formatQaReportMarkdown, runProductQa } from '../src/lib/qa/engine.ts';
import type { AssemblyProfileFile } from '../src/types/assembly-engine';
import type { CopyProfileFile } from '../src/types/copy-engine';

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

function readJsonFile<T>(filePath: string) {
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function writeTextFile(filePath: string, value: string) {
  writeFileSync(filePath, value, 'utf8');
}

function writeJsonFile(filePath: string, value: unknown) {
  writeTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function analyzeSlug(slug: string) {
  const normalizedRoot = path.join(projectRoot, 'business-input', slug, 'normalized');

  if (!statExists(normalizedRoot)) {
    throw new Error(`Normalized directory not found for "${slug}". Run normalize:business first.`);
  }

  const assemblyProfilePath = path.join(normalizedRoot, 'assembly-profile.json');
  const copyProfilePath = path.join(normalizedRoot, 'copy-profile.json');

  if (!statExists(assemblyProfilePath)) {
    throw new Error(`assembly-profile.json not found for "${slug}". Run assembly:analyze first.`);
  }

  if (!statExists(copyProfilePath)) {
    throw new Error(`copy-profile.json not found for "${slug}". Run copy:analyze first.`);
  }

  const record = loadBusinessMasterRecordSync(pathToFileURL(`${path.resolve(normalizedRoot)}${path.sep}`));
  const assemblyProfile = assertValidAssemblyProfile(readJsonFile<AssemblyProfileFile>(assemblyProfilePath));
  const copyProfile = assertValidCopyProfile(readJsonFile<CopyProfileFile>(copyProfilePath));
  const knownBusinesses = listBusinessSlugs()
    .map((entrySlug) => {
      const briefPath = path.join(projectRoot, 'business-input', entrySlug, 'normalized', 'business-brief.json');
      if (!statExists(briefPath)) return null;

      const brief = readJsonFile<{ identity?: { businessName?: string } }>(briefPath);
      const businessName = brief.identity?.businessName?.trim();

      if (!businessName) return null;

      return {
        slug: entrySlug,
        businessName,
      };
    })
    .filter((entry): entry is { slug: string; businessName: string } => Boolean(entry));
  const report = runProductQa({
    projectRoot,
    buildRoot: path.join(projectRoot, 'dist'),
    publicRoot: path.join(projectRoot, 'public'),
    businessSlug: slug,
    record,
    assemblyProfile,
    copyProfile,
    demoPresetSlugs: demoPresets.filter((preset) => preset.businessSlug === slug && !preset.isDefault).map((preset) => preset.slug),
    knownBusinesses,
  });

  const reportJsonPath = path.join(normalizedRoot, 'qa-report.json');
  const reportMarkdownPath = path.join(normalizedRoot, 'qa-report.md');

  writeJsonFile(reportJsonPath, report);
  writeTextFile(reportMarkdownPath, formatQaReportMarkdown(report));

  console.log(
    `QA report for ${slug}: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ` +
      `${report.summary.polish} polish, ${report.summary.passed} passes.`,
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
