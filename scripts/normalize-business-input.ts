import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createBusinessMasterRecord } from '../src/lib/business/master-record.ts';
import { normalizeBusinessInput } from '../src/lib/normalization/business-normalizer.ts';
import { loadBusinessInputContext } from '../src/lib/normalization/parsers.ts';

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

function normalizeSlug(slug: string) {
  const context = loadBusinessInputContext(slug, projectRoot);
  const result = normalizeBusinessInput(context);

  createBusinessMasterRecord({
    raw: result.raw,
    brief: result.brief,
    missingData: result.missingData,
    contentPlan: result.contentPlan,
    imageMap: context.imageMap,
  });

  const normalizedRoot = path.join(projectRoot, context.normalizedPath);
  mkdirSync(normalizedRoot, { recursive: true });

  writeJsonFile(path.join(normalizedRoot, 'business-raw.json'), result.raw);
  writeJsonFile(path.join(normalizedRoot, 'business-brief.json'), result.brief);
  writeJsonFile(path.join(normalizedRoot, 'missing-data.json'), result.missingData);
  writeJsonFile(path.join(normalizedRoot, 'content-plan.json'), result.contentPlan);
  writeJsonFile(path.join(normalizedRoot, 'reconciliation-report.json'), result.reconciliationReport);

  console.log(
    `Normalized ${slug}: ${result.reconciliationReport.summary.verified} verified, ` +
      `${result.reconciliationReport.summary.inferred} inferred, ` +
      `${result.reconciliationReport.summary.missing} missing, ` +
      `${result.reconciliationReport.summary.conflict} conflict, ` +
      `${result.reconciliationReport.summary.pending} pending.`,
  );
}

const slugs = requestedSlug ? [requestedSlug] : listBusinessSlugs();

if (slugs.length === 0) {
  console.error('No business-input directories found.');
  process.exit(1);
}

for (const slug of slugs) {
  normalizeSlug(slug);
}
