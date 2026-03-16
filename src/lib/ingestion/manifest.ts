import type {
  BusinessInputSeed,
  InputManifest,
  InputManifestExpectation,
  InputManifestFile,
  InputManifestSummary,
  InputManifestValidation,
} from '../../types/business-input';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectRecord(value: unknown, path: string): UnknownRecord {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }

  return value;
}

function expectString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${path} must be a non-empty string.`);
  }

  return value.trim();
}

function optionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalStringArray(value: unknown, path: string): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array when provided.`);
  }

  return value.map((item, index) => expectString(item, `${path}[${index}]`));
}

function expectNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${path} must be a number.`);
  }

  return value;
}

function parseSeed(value: unknown, path: string): BusinessInputSeed | null {
  if (value === null) return null;

  const record = expectRecord(value, path);

  return {
    businessName: expectString(record.businessName, `${path}.businessName`),
    slug: expectString(record.slug, `${path}.slug`),
    niche: optionalString(record.niche) as BusinessInputSeed['niche'],
    primaryCategory: optionalString(record.primaryCategory),
    secondaryCategories: optionalStringArray(record.secondaryCategories, `${path}.secondaryCategories`),
    city: optionalString(record.city),
    country: optionalString(record.country),
    mapsLink: optionalString(record.mapsLink),
    manualNotesSummary: optionalString(record.manualNotesSummary),
    desiredPrimaryCta: optionalString(record.desiredPrimaryCta),
    desiredTone: optionalStringArray(record.desiredTone, `${path}.desiredTone`),
    confirmedData: optionalStringArray(record.confirmedData, `${path}.confirmedData`),
  };
}

function parseManifestFile(value: unknown, path: string): InputManifestFile {
  const record = expectRecord(value, path);

  return {
    relativePath: expectString(record.relativePath, `${path}.relativePath`),
    folderKind: expectString(record.folderKind, `${path}.folderKind`) as InputManifestFile['folderKind'],
    category: expectString(record.category, `${path}.category`) as InputManifestFile['category'],
    fileName: expectString(record.fileName, `${path}.fileName`),
    extension: expectString(record.extension, `${path}.extension`),
    bytes: expectNumber(record.bytes, `${path}.bytes`),
    status: expectString(record.status, `${path}.status`) as InputManifestFile['status'],
    roleHint: optionalString(record.roleHint),
    issues: optionalStringArray(record.issues, `${path}.issues`),
  };
}

function parseExpectation(value: unknown, path: string): InputManifestExpectation {
  const record = expectRecord(value, path);

  return {
    id: expectString(record.id, `${path}.id`) as InputManifestExpectation['id'],
    status: expectString(record.status, `${path}.status`) as InputManifestExpectation['status'],
    reason: expectString(record.reason, `${path}.reason`),
    paths: optionalStringArray(record.paths, `${path}.paths`),
  };
}

function parseValidation(value: unknown, path: string): InputManifestValidation {
  const record = expectRecord(value, path);

  return {
    level: expectString(record.level, `${path}.level`) as InputManifestValidation['level'],
    code: expectString(record.code, `${path}.code`),
    message: expectString(record.message, `${path}.message`),
    paths: optionalStringArray(record.paths, `${path}.paths`),
  };
}

function parseSummary(value: unknown, path: string): InputManifestSummary {
  const record = expectRecord(value, path);

  return {
    fileCount: expectNumber(record.fileCount, `${path}.fileCount`),
    folderCount: expectNumber(record.folderCount, `${path}.folderCount`),
    mapsFileCount: expectNumber(record.mapsFileCount, `${path}.mapsFileCount`),
    htmlFileCount: expectNumber(record.htmlFileCount, `${path}.htmlFileCount`),
    imageFileCount: expectNumber(record.imageFileCount, `${path}.imageFileCount`),
    docsFileCount: expectNumber(record.docsFileCount, `${path}.docsFileCount`),
    notesFileCount: expectNumber(record.notesFileCount, `${path}.notesFileCount`),
    duplicateLikeCount: expectNumber(record.duplicateLikeCount, `${path}.duplicateLikeCount`),
    namingIssueCount: expectNumber(record.namingIssueCount, `${path}.namingIssueCount`),
    unsupportedFileCount: expectNumber(record.unsupportedFileCount, `${path}.unsupportedFileCount`),
  };
}

export function parseInputManifest(value: unknown): InputManifest {
  const record = expectRecord(value, 'inputManifest');

  return {
    schemaVersion: expectNumber(record.schemaVersion, 'inputManifest.schemaVersion'),
    businessSlug: expectString(record.businessSlug, 'inputManifest.businessSlug'),
    generatedAt: expectString(record.generatedAt, 'inputManifest.generatedAt'),
    seed: parseSeed(record.seed ?? null, 'inputManifest.seed'),
    rootPath: expectString(record.rootPath, 'inputManifest.rootPath'),
    normalizedPath: expectString(record.normalizedPath, 'inputManifest.normalizedPath'),
    discoveredFiles: (Array.isArray(record.discoveredFiles) ? record.discoveredFiles : []).map((item, index) =>
      parseManifestFile(item, `inputManifest.discoveredFiles[${index}]`),
    ),
    expectedInputs: (Array.isArray(record.expectedInputs) ? record.expectedInputs : []).map((item, index) =>
      parseExpectation(item, `inputManifest.expectedInputs[${index}]`),
    ),
    validations: (Array.isArray(record.validations) ? record.validations : []).map((item, index) =>
      parseValidation(item, `inputManifest.validations[${index}]`),
    ),
    summary: parseSummary(record.summary, 'inputManifest.summary'),
  };
}

export function getInputManifestErrorCount(manifest: InputManifest) {
  return manifest.validations.filter((item) => item.level === 'error').length;
}

export function getInputManifestWarningCount(manifest: InputManifest) {
  return manifest.validations.filter((item) => item.level === 'warning').length;
}
