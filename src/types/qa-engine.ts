export type QaFileKind = 'qa-report';
export type QaCategory =
  | 'structure'
  | 'assets'
  | 'assembly'
  | 'copy'
  | 'seo'
  | 'accessibility'
  | 'experience';

export type QaSeverity = 'none' | 'error' | 'warning' | 'polish';
export type QaStatus = 'pass' | 'issue';

export interface QaCheckResult {
  id: string;
  category: QaCategory;
  status: QaStatus;
  severity: QaSeverity;
  title: string;
  summary: string;
  details?: string[];
  paths?: string[];
  route?: string | null;
}

export interface QaManualReviewItem {
  id: string;
  severity: Exclude<QaSeverity, 'none' | 'error'>;
  title: string;
  summary: string;
  reason: string;
  paths?: string[];
  relatedChecks?: string[];
}

export interface QaRouteSnapshot {
  route: string;
  filePath: string;
  exists: boolean;
  title?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  robots?: string | null;
  h1Count: number;
  imageCount: number;
  detailsCount: number;
}

export interface QaReportFile {
  schemaVersion: number;
  fileKind: QaFileKind;
  businessSlug: string;
  generatedAt: string;
  summary: {
    checksRun: number;
    passed: number;
    errors: number;
    warnings: number;
    polish: number;
    manualReview: number;
  };
  context: {
    siteUrl: string;
    routeSnapshots: QaRouteSnapshot[];
    visibleSections: string[];
    heroCtas: string[];
    finalCtas: string[];
    imageSummary: {
      totalAssets: number;
      selectedAssets: number;
      weakAssets: number;
      duplicateAssets: number;
    };
  };
  checks: QaCheckResult[];
  manualReview: QaManualReviewItem[];
}
