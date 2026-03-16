import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

type ReleaseCommand = 'status' | 'prepare' | 'validate' | 'preview' | 'live';

interface ParsedArgs {
  command: ReleaseCommand;
  slug: string | null;
  projectId: string | null;
  siteUrl: string | null;
  channelId: string | null;
  expires: string | null;
  allowWarnings: boolean;
  confirmLive: boolean;
}

interface QaSummary {
  errors: number;
  warnings: number;
  polish: number;
  passed: number;
  manualReview: number;
}

const projectRoot = process.cwd();
const businessInputRoot = path.join(projectRoot, 'business-input');

function runCommand(command: 'npm' | 'firebase' | 'git' | 'gh', args: string[], options?: { allowFailure?: boolean }) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });

  if (!options?.allowFailure && result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status ?? 1}.`);
  }

  return result.status ?? 1;
}

function runCaptured(command: 'git' | 'gh' | 'firebase', args: string[]) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    env: process.env,
    shell: process.platform === 'win32',
  });

  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
  };
}

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

function parseArgs(argv: string[]): ParsedArgs {
  const [commandRaw, ...rest] = argv;
  const command = commandRaw as ReleaseCommand;

  if (!command || !['status', 'prepare', 'validate', 'preview', 'live'].includes(command)) {
    throw new Error(
      'Usage: release-workflow.ts <status|prepare|validate|preview|live> [slug] [--project <id>] [--site-url <url>] [--channel <id>] [--expires <duration>] [--allow-warnings] [--confirm-live]',
    );
  }

  let slug: string | null = null;
  let projectId: string | null = null;
  let siteUrl: string | null = null;
  let channelId: string | null = null;
  let expires: string | null = null;
  let allowWarnings = false;
  let confirmLive = false;
  const extras: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];

    if (value === '--project') {
      projectId = rest[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value === '--channel') {
      channelId = rest[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value === '--site-url') {
      siteUrl = rest[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value === '--expires') {
      expires = rest[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (value === '--allow-warnings') {
      allowWarnings = true;
      continue;
    }

    if (value === '--confirm-live') {
      confirmLive = true;
      continue;
    }

    if (value === 'allow-warnings') {
      allowWarnings = true;
      continue;
    }

    if (value === 'confirm-live') {
      confirmLive = true;
      continue;
    }

    if (value.startsWith('project=')) {
      projectId = value.slice('project='.length) || null;
      continue;
    }

    if (value.startsWith('site-url=')) {
      siteUrl = value.slice('site-url='.length) || null;
      continue;
    }

    if (value.startsWith('channel=')) {
      channelId = value.slice('channel='.length) || null;
      continue;
    }

    if (value.startsWith('expires=')) {
      expires = value.slice('expires='.length) || null;
      continue;
    }

    if (!slug) {
      slug = value;
      continue;
    }

    extras.push(value);
  }

  if (!projectId && (command === 'preview' || command === 'live') && extras.length >= 1) {
    projectId = extras[0];
  }

  if (!siteUrl && command === 'validate' && extras.length >= 1) {
    siteUrl = extras[0];
  }

  if (!channelId && command === 'preview' && extras.length >= 2) {
    channelId = extras[1];
  }

  if (!expires && command === 'preview' && extras.length >= 3) {
    expires = extras[2];
  }

  return {
    command,
    slug,
    projectId,
    siteUrl,
    channelId,
    expires,
    allowWarnings,
    confirmLive,
  };
}

function requireSlug(slug: string | null, command: ReleaseCommand) {
  if (!slug) {
    throw new Error(`${command} requires a business slug. Example: npm run release:${command} -- the-dosa-spot`);
  }

  const slugRoot = path.join(businessInputRoot, slug);
  if (!statExists(slugRoot)) {
    throw new Error(`Business slug "${slug}" was not found under business-input/.`);
  }

  return slug;
}

function parseLocalFirebaseProject() {
  const firebasercPath = path.join(projectRoot, '.firebaserc');
  if (!existsSync(firebasercPath)) return null;

  try {
    const config = readJsonFile<{ projects?: { default?: string } }>(firebasercPath);
    return config.projects?.default ?? null;
  } catch {
    return null;
  }
}

function resolveProjectId(explicitProjectId: string | null) {
  return explicitProjectId ?? process.env.FIREBASE_PROJECT_ID ?? parseLocalFirebaseProject();
}

function normalizeSiteUrl(value: string | null | undefined) {
  if (!value) return null;

  const trimmed = value.trim().replace(/\/+$/u, '');
  if (!trimmed) return null;

  return /^https?:\/\//iu.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function resolveSiteUrl(explicitSiteUrl: string | null, projectId: string | null) {
  return (
    normalizeSiteUrl(explicitSiteUrl) ??
    normalizeSiteUrl(process.env.PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.SITE_URL) ??
    (projectId ? `https://${projectId}.web.app` : null)
  );
}

function applySiteUrl(siteUrl: string | null) {
  if (!siteUrl) return;

  process.env.SITE_URL = siteUrl;
  process.env.PUBLIC_SITE_URL = siteUrl;
}

function createDefaultPreviewChannel(slug: string) {
  const safeSlug = slug.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10) || 'preview';
  const now = new Date();
  const stamp = [
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
  ].join('');

  return `${safeSlug}-${stamp}`.slice(0, 20);
}

function getTrackedFiles() {
  const result = runCaptured('git', ['ls-files']);
  if (!result.ok) return [];
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function findTrackedSensitiveFiles() {
  const trackedFiles = getTrackedFiles();
  const sensitivePatterns = [
    /^\.env(\.|$)/i,
    /^\.firebaserc$/i,
    /\.pem$/i,
    /\.p12$/i,
    /\.key$/i,
    /service[-_]?account.*\.json$/i,
    /secret/i,
  ];

  return trackedFiles.filter((file) => sensitivePatterns.some((pattern) => pattern.test(file)));
}

function getQaReportPath(slug: string) {
  return path.join(projectRoot, 'business-input', slug, 'normalized', 'qa-report.json');
}

function readQaSummary(slug: string): QaSummary {
  const reportPath = getQaReportPath(slug);
  if (!existsSync(reportPath)) {
    throw new Error(`QA report not found for "${slug}". Run npm run qa:product -- ${slug} first.`);
  }

  const report = readJsonFile<{ summary: QaSummary }>(reportPath);
  return report.summary;
}

function runPreparation(slug: string) {
  process.env.ACTIVE_BUSINESS_SLUG = slug;
  process.env.PUBLIC_ACTIVE_BUSINESS_SLUG = slug;

  const steps: Array<[string, string[]]> = [
    ['npm', ['run', 'ingest:manifest', '--', slug]],
    ['npm', ['run', 'normalize:business', '--', slug]],
    ['npm', ['run', 'sector:analyze', '--', slug]],
    ['npm', ['run', 'images:process', '--', slug]],
    ['npm', ['run', 'visual:analyze', '--', slug]],
    ['npm', ['run', 'copy:analyze', '--', slug]],
    ['npm', ['run', 'assembly:analyze', '--', slug]],
  ] as Array<[string, string[]]>;

  for (const [command, args] of steps) {
    runCommand(command as 'npm', args);
  }
}

function runReleaseValidation(slug: string, siteUrl: string | null = null) {
  applySiteUrl(siteUrl);
  runPreparation(slug);
  runCommand('npm', ['run', 'check']);
  runCommand('npm', ['run', 'build']);
  runCommand('npm', ['run', 'qa:product', '--', slug]);

  const sensitiveFiles = findTrackedSensitiveFiles();
  if (sensitiveFiles.length > 0) {
    throw new Error(
      `Tracked sensitive files detected:\n- ${sensitiveFiles.join('\n- ')}\nRemove them from git tracking before release.`,
    );
  }

  const qaSummary = readQaSummary(slug);
  if (qaSummary.errors > 0) {
    throw new Error(
      `QA report for "${slug}" contains ${qaSummary.errors} error(s). Fix them before preview or live deploy.`,
    );
  }

  return qaSummary;
}

function printStatus() {
  const gitRemote = runCaptured('git', ['remote', 'get-url', 'origin']);
  const gitStatus = runCaptured('git', ['status', '--short']);
  const ghStatus = runCaptured('gh', ['auth', 'status']);
  const firebaseLogin = runCaptured('firebase', ['login:list']);
  const firebaseUse = runCaptured('firebase', ['use', '--json']);
  const localProject = parseLocalFirebaseProject();
  const resolvedSiteUrl = resolveSiteUrl(null, localProject);
  const businessSlugs = listBusinessSlugs();

  console.log('Release status');
  console.log(`- Businesses: ${businessSlugs.join(', ') || 'none'}`);
  console.log(`- Git remote: ${gitRemote.ok ? gitRemote.stdout : 'missing'}`);
  console.log(`- Git worktree: ${gitStatus.stdout ? 'dirty' : 'clean'}`);
  console.log(`- GitHub auth: ${ghStatus.ok ? 'available' : 'missing'}`);
  console.log(`- Firebase auth: ${firebaseLogin.ok ? 'available' : 'missing'}`);
  console.log(`- Local .firebaserc: ${localProject ?? 'not configured'}`);
  console.log(`- Release site URL: ${resolvedSiteUrl ?? 'not configured'}`);

  if (firebaseUse.ok) {
    console.log(`- Active Firebase project: ${firebaseUse.stdout}`);
  } else {
    console.log('- Active Firebase project: none');
  }

  if (!localProject) {
    console.log('- Preview/live deploys currently need --project <id> or FIREBASE_PROJECT_ID.');
  }
}

function printValidateSummary(slug: string, qaSummary: QaSummary) {
  console.log(
    `Release validation for ${slug}: ${qaSummary.errors} errors, ${qaSummary.warnings} warnings, ` +
      `${qaSummary.polish} polish, ${qaSummary.passed} passes.`,
  );
}

function runPreview(slug: string, parsed: ParsedArgs) {
  const projectId = resolveProjectId(parsed.projectId);
  if (!projectId) {
    throw new Error(
      'Preview deploy requires a Firebase project. Use --project <id>, FIREBASE_PROJECT_ID, or create a local .firebaserc from .firebaserc.example.',
    );
  }
  const siteUrl = resolveSiteUrl(parsed.siteUrl, projectId);
  const qaSummary = runReleaseValidation(slug, siteUrl);
  printValidateSummary(slug, qaSummary);

  const channelId = parsed.channelId ?? createDefaultPreviewChannel(slug);
  const expires = parsed.expires ?? '7d';

  console.log(`Deploying preview channel "${channelId}" to Firebase project "${projectId}"...`);
  runCommand('firebase', ['hosting:channel:deploy', channelId, '--only', 'hosting', '--expires', expires, '--project', projectId]);
}

function runLive(slug: string, parsed: ParsedArgs) {
  if (!parsed.confirmLive) {
    throw new Error('Live deploy requires --confirm-live to avoid accidental production deploys.');
  }

  const projectId = resolveProjectId(parsed.projectId);
  if (!projectId) {
    throw new Error(
      'Live deploy requires a Firebase project. Use --project <id>, FIREBASE_PROJECT_ID, or create a local .firebaserc from .firebaserc.example.',
    );
  }
  const siteUrl = resolveSiteUrl(parsed.siteUrl, projectId);
  const qaSummary = runReleaseValidation(slug, siteUrl);
  printValidateSummary(slug, qaSummary);

  if (qaSummary.warnings > 0 && !parsed.allowWarnings) {
    throw new Error(
      `Live deploy blocked because QA still reports ${qaSummary.warnings} warning(s). Review them or rerun with --allow-warnings if the risk is explicitly accepted.`,
    );
  }

  console.log(`Deploying live hosting to Firebase project "${projectId}"...`);
  runCommand('firebase', ['deploy', '--only', 'hosting', '--project', projectId]);
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));

  switch (parsed.command) {
    case 'status':
      printStatus();
      break;
    case 'prepare':
      runPreparation(requireSlug(parsed.slug, 'prepare'));
      break;
    case 'validate': {
      const slug = requireSlug(parsed.slug, 'validate');
      const qaSummary = runReleaseValidation(slug, resolveSiteUrl(parsed.siteUrl, resolveProjectId(parsed.projectId)));
      printValidateSummary(slug, qaSummary);
      break;
    }
    case 'preview':
      runPreview(requireSlug(parsed.slug, 'preview'), parsed);
      break;
    case 'live':
      runLive(requireSlug(parsed.slug, 'live'), parsed);
      break;
    default:
      throw new Error(`Unsupported command: ${parsed.command}`);
  }
}

main();
