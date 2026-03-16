import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const businessInputRoot = path.join(projectRoot, 'business-input');
const requestedSlug = process.argv[2] ?? null;

const allowedRawFolders = new Set(['maps', 'html', 'images', 'docs', 'notes']);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.avif']);
const htmlExtensions = new Set(['.html', '.htm']);
const docExtensions = new Set(['.pdf', '.md', '.txt', '.json', '.csv', '.doc', '.docx']);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function safeReadJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function walkDirectory(directoryPath, basePath, collected = []) {
  if (!statExists(directoryPath) || !statSync(directoryPath).isDirectory()) {
    return collected;
  }

  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(directoryPath, entry.name);
    const relativePath = toPosix(path.relative(basePath, fullPath));

    if (entry.isDirectory()) {
      walkDirectory(fullPath, basePath, collected);
      continue;
    }

    collected.push({
      fullPath,
      relativePath,
      name: entry.name,
      bytes: statSync(fullPath).size,
    });
  }

  return collected;
}

function inferFolderKind(relativePath) {
  const [firstSegment] = relativePath.split('/');

  if (firstSegment === 'intake.json') return 'root';
  if (allowedRawFolders.has(firstSegment)) return firstSegment;
  return 'unknown';
}

function inferImageRole(fileName) {
  const lower = fileName.toLowerCase();

  if (lower.startsWith('logo')) return 'logo';
  if (lower.startsWith('hero')) return 'hero';
  if (lower.startsWith('dish')) return 'dish';
  if (lower.startsWith('interior')) return 'interior';
  if (lower.startsWith('exterior')) return 'exterior';
  if (lower.startsWith('team')) return 'team';
  return 'generic';
}

function classifyFile(file) {
  const folderKind = inferFolderKind(file.relativePath);
  const extension = path.extname(file.name).toLowerCase();
  const lowerName = file.name.toLowerCase();
  const issues = [];
  let category = 'other';
  let roleHint = null;
  let status = 'accepted';

  if (/[A-Z]/.test(file.name) || /\s/.test(file.name)) {
    issues.push('Filename should use lowercase kebab-case.');
  }

  if (folderKind === 'unknown') {
    issues.push('File is outside the supported raw folder structure.');
  }

  if (folderKind === 'root') {
    category = file.name === 'intake.json' ? 'seed' : 'other';
  } else if (folderKind === 'maps') {
    if (lowerName === 'maps-link.txt' || lowerName === 'maps-link.url') {
      category = 'maps-link';
    } else if (htmlExtensions.has(extension)) {
      category = 'maps-html';
    } else {
      category = 'other';
      issues.push('Maps folder should mainly contain maps-link.txt or HTML exports.');
    }
  } else if (folderKind === 'html') {
    if (htmlExtensions.has(extension)) {
      category = 'page-html';
    } else {
      category = 'other';
      issues.push('HTML folder should contain HTML exports.');
    }
  } else if (folderKind === 'images') {
    if (imageExtensions.has(extension)) {
      roleHint = inferImageRole(file.name);
      category =
        roleHint === 'logo'
          ? 'image-logo'
          : roleHint === 'hero'
            ? 'image-hero'
            : roleHint === 'dish'
              ? 'image-dish'
              : roleHint === 'interior'
                ? 'image-interior'
                : roleHint === 'exterior'
                  ? 'image-exterior'
                  : roleHint === 'team'
                    ? 'image-team'
                    : 'image-generic';
    } else {
      category = 'other';
      issues.push('Images folder should contain image file types.');
    }
  } else if (folderKind === 'docs') {
    if (extension === '.pdf') {
      category = 'document-pdf';
    } else if (docExtensions.has(extension)) {
      category = 'document-text';
    } else {
      category = 'other';
      issues.push('Docs folder has an unusual extension.');
    }
  } else if (folderKind === 'notes') {
    if (docExtensions.has(extension)) {
      category = 'notes';
    } else {
      category = 'other';
      issues.push('Notes folder should contain text-based files.');
    }
  }

  if (issues.length > 0) {
    status = 'warning';
  }

  return {
    relativePath: file.relativePath,
    folderKind,
    category,
    fileName: file.name,
    extension: extension || '<none>',
    bytes: file.bytes,
    status,
    roleHint,
    issues,
  };
}

function buildExpectedInputs(seed, discoveredFiles) {
  const byCategory = (category) => discoveredFiles.filter((item) => item.category === category).map((item) => item.relativePath);
  const mapsLinks = byCategory('maps-link');
  const htmlSources = discoveredFiles
    .filter((item) => item.category === 'maps-html' || item.category === 'page-html')
    .map((item) => item.relativePath);
  const images = discoveredFiles.filter((item) => item.category.startsWith('image-')).map((item) => item.relativePath);
  const docs = discoveredFiles
    .filter((item) => item.category === 'document-pdf' || item.category === 'document-text')
    .map((item) => item.relativePath);
  const notes = byCategory('notes');

  return [
    {
      id: 'seed',
      status: seed ? 'present' : 'missing',
      reason: seed ? 'Seed intake file is present.' : 'Missing intake.json at the business root.',
      paths: seed ? ['intake.json'] : [],
    },
    {
      id: 'maps-link',
      status: mapsLinks.length > 0 || seed?.mapsLink ? 'present' : 'missing',
      reason:
        mapsLinks.length > 0 || seed?.mapsLink
          ? 'Maps link is available through intake.json or raw/maps.'
          : 'No maps link was found.',
      paths: [...mapsLinks, ...(seed?.mapsLink ? ['intake.json'] : [])],
    },
    {
      id: 'html-source',
      status: htmlSources.length > 0 ? 'present' : 'missing',
      reason: htmlSources.length > 0 ? 'At least one HTML source export is available.' : 'No HTML source files were found.',
      paths: htmlSources,
    },
    {
      id: 'image-source',
      status: images.length > 0 ? 'present' : 'missing',
      reason: images.length > 0 ? 'At least one source image is available.' : 'No source images were found.',
      paths: images,
    },
    {
      id: 'business-docs',
      status: docs.length > 0 ? 'present' : 'partial',
      reason: docs.length > 0 ? 'Supporting documents are available.' : 'No supporting docs or menu files were found yet.',
      paths: docs,
    },
    {
      id: 'notes',
      status: notes.length > 0 ? 'present' : 'partial',
      reason: notes.length > 0 ? 'Manual notes are available.' : 'No notes were found yet.',
      paths: notes,
    },
  ];
}

function buildValidations(slug, seed, discoveredFiles, expectedInputs, rawRootExists) {
  const validations = [];

  if (!rawRootExists) {
    validations.push({
      level: 'error',
      code: 'missing_raw_root',
      message: 'Missing raw/ directory for this business input package.',
      paths: ['raw'],
    });
  }

  if (!seed) {
    validations.push({
      level: 'error',
      code: 'missing_seed',
      message: 'Missing intake.json at the business root.',
      paths: ['intake.json'],
    });
  } else {
    if (!seed.slug) {
      validations.push({
        level: 'error',
        code: 'missing_slug',
        message: 'intake.json is missing the slug field.',
        paths: ['intake.json'],
      });
    }

    if (seed.slug && seed.slug !== slug) {
      validations.push({
        level: 'error',
        code: 'slug_mismatch',
        message: `Folder slug "${slug}" does not match intake.json slug "${seed.slug}".`,
        paths: ['intake.json'],
      });
    }

    if (!seed.businessName) {
      validations.push({
        level: 'error',
        code: 'missing_business_name',
        message: 'intake.json is missing businessName.',
        paths: ['intake.json'],
      });
    }
  }

  const noHtml = expectedInputs.find((item) => item.id === 'html-source' && item.status === 'missing');
  if (noHtml) {
    validations.push({
      level: 'warning',
      code: 'missing_html_sources',
      message: 'No HTML source files were found. Intake can continue, but extraction options will be limited.',
      paths: [],
    });
  }

  const noImages = expectedInputs.find((item) => item.id === 'image-source' && item.status === 'missing');
  if (noImages) {
    validations.push({
      level: 'warning',
      code: 'missing_images',
      message: 'No source images were found in raw/images.',
      paths: [],
    });
  }

  const byName = new Map();
  for (const file of discoveredFiles) {
    const key = file.fileName.toLowerCase();
    const existing = byName.get(key) ?? [];
    existing.push(file.relativePath);
    byName.set(key, existing);

    if ((file.issues?.length ?? 0) > 0) {
      validations.push({
        level: 'warning',
        code: 'naming_or_location_issue',
        message: `${file.relativePath} needs cleanup or review.`,
        paths: [file.relativePath],
      });
    }
  }

  for (const [fileName, paths] of byName.entries()) {
    if (paths.length > 1) {
      validations.push({
        level: 'warning',
        code: 'duplicate_like_filename',
        message: `Repeated filename detected: ${fileName}.`,
        paths,
      });
    }
  }

  const unsupported = discoveredFiles.filter((item) => item.category === 'other').map((item) => item.relativePath);
  if (unsupported.length > 0) {
    validations.push({
      level: 'warning',
      code: 'unsupported_or_unclear_files',
      message: 'Some files could not be cleanly classified.',
      paths: unsupported,
    });
  }

  return validations;
}

function buildSummary(discoveredFiles, rawRoot) {
  const folderEntries = statExists(rawRoot)
    ? readdirSync(rawRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    : [];
  const duplicateLikeCount = new Set(
    discoveredFiles
      .map((item) => item.fileName.toLowerCase())
      .filter((fileName, index, all) => all.indexOf(fileName) !== index),
  ).size;

  return {
    fileCount: discoveredFiles.length,
    folderCount: folderEntries.length,
    mapsFileCount: discoveredFiles.filter((item) => item.folderKind === 'maps').length,
    htmlFileCount: discoveredFiles.filter((item) => item.category === 'maps-html' || item.category === 'page-html').length,
    imageFileCount: discoveredFiles.filter((item) => item.category.startsWith('image-')).length,
    docsFileCount: discoveredFiles.filter((item) => item.folderKind === 'docs').length,
    notesFileCount: discoveredFiles.filter((item) => item.folderKind === 'notes').length,
    duplicateLikeCount,
    namingIssueCount: discoveredFiles.filter((item) => (item.issues?.length ?? 0) > 0).length,
    unsupportedFileCount: discoveredFiles.filter((item) => item.category === 'other').length,
  };
}

function loadSeed(seedPath) {
  if (!statExists(seedPath)) return null;

  try {
    return safeReadJson(seedPath);
  } catch (error) {
    return {
      businessName: '',
      slug: '',
      manualNotesSummary: `Seed file could not be parsed: ${String(error)}`,
    };
  }
}

function statExists(targetPath) {
  try {
    statSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

function buildManifestForSlug(slug) {
  const businessRoot = path.join(businessInputRoot, slug);
  const rawRoot = path.join(businessRoot, 'raw');
  const normalizedRoot = path.join(businessRoot, 'normalized');
  const seedPath = path.join(businessRoot, 'intake.json');
  const rawRootExists = statExists(rawRoot);

  mkdirSync(normalizedRoot, { recursive: true });

  const seed = loadSeed(seedPath);
  const discoveredFiles = walkDirectory(rawRoot, rawRoot).map(classifyFile).sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  const expectedInputs = buildExpectedInputs(seed, discoveredFiles);
  const validations = buildValidations(slug, seed, discoveredFiles, expectedInputs, rawRootExists);
  const summary = buildSummary(discoveredFiles, rawRoot);

  const manifest = {
    schemaVersion: 1,
    businessSlug: slug,
    generatedAt: new Date().toISOString(),
    seed,
    rootPath: toPosix(path.relative(projectRoot, businessRoot)),
    normalizedPath: toPosix(path.relative(projectRoot, normalizedRoot)),
    discoveredFiles,
    expectedInputs,
    validations,
    summary,
  };

  writeFileSync(path.join(normalizedRoot, 'input-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}

function listBusinessSlugs() {
  if (!statExists(businessInputRoot)) return [];

  return readdirSync(businessInputRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const slugs = requestedSlug ? [requestedSlug] : listBusinessSlugs();

if (slugs.length === 0) {
  console.error('No business-input directories found.');
  process.exit(1);
}

for (const slug of slugs) {
  const manifest = buildManifestForSlug(slug);
  const errorCount = manifest.validations.filter((item) => item.level === 'error').length;
  const warningCount = manifest.validations.filter((item) => item.level === 'warning').length;
  console.log(`Generated input manifest for ${slug}: ${manifest.summary.fileCount} files, ${errorCount} errors, ${warningCount} warnings.`);
}
