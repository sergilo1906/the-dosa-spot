import type { BusinessNiche } from './business';

export type InputFolderKind = 'root' | 'maps' | 'html' | 'images' | 'docs' | 'notes' | 'unknown';
export type InputFileCategory =
  | 'seed'
  | 'maps-link'
  | 'maps-html'
  | 'page-html'
  | 'image-logo'
  | 'image-hero'
  | 'image-dish'
  | 'image-interior'
  | 'image-exterior'
  | 'image-team'
  | 'image-generic'
  | 'document-pdf'
  | 'document-text'
  | 'notes'
  | 'other';

export type InputExpectationId =
  | 'seed'
  | 'maps-link'
  | 'html-source'
  | 'image-source'
  | 'business-docs'
  | 'notes';

export type InputExpectationStatus = 'present' | 'partial' | 'missing';
export type InputValidationLevel = 'error' | 'warning';

export interface BusinessInputSeed {
  businessName: string;
  slug: string;
  niche?: BusinessNiche | null;
  primaryCategory?: string | null;
  secondaryCategories?: string[];
  city?: string | null;
  country?: string | null;
  mapsLink?: string | null;
  manualNotesSummary?: string | null;
  desiredPrimaryCta?: string | null;
  desiredTone?: string[];
  confirmedData?: string[];
}

export interface InputManifestFile {
  relativePath: string;
  folderKind: InputFolderKind;
  category: InputFileCategory;
  fileName: string;
  extension: string;
  bytes: number;
  status: 'accepted' | 'warning';
  roleHint?: string | null;
  issues?: string[];
}

export interface InputManifestExpectation {
  id: InputExpectationId;
  status: InputExpectationStatus;
  reason: string;
  paths?: string[];
}

export interface InputManifestValidation {
  level: InputValidationLevel;
  code: string;
  message: string;
  paths?: string[];
}

export interface InputManifestSummary {
  fileCount: number;
  folderCount: number;
  mapsFileCount: number;
  htmlFileCount: number;
  imageFileCount: number;
  docsFileCount: number;
  notesFileCount: number;
  duplicateLikeCount: number;
  namingIssueCount: number;
  unsupportedFileCount: number;
}

export interface InputManifest {
  schemaVersion: number;
  businessSlug: string;
  generatedAt: string;
  seed: BusinessInputSeed | null;
  rootPath: string;
  normalizedPath: string;
  discoveredFiles: InputManifestFile[];
  expectedInputs: InputManifestExpectation[];
  validations: InputManifestValidation[];
  summary: InputManifestSummary;
}
