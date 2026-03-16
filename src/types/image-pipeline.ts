export type ImagePipelineCategory =
  | 'hero-candidate'
  | 'food-close-up'
  | 'product-close-up'
  | 'signature-dish'
  | 'dessert'
  | 'drinks'
  | 'gallery'
  | 'ambience'
  | 'interior'
  | 'exterior'
  | 'counter-service'
  | 'staff'
  | 'logo'
  | 'fallback'
  | 'weak'
  | 'discard'
  | 'duplicate'
  | 'near-duplicate'
  | 'unknown';

export type ImagePipelineConfidence = 'high' | 'medium' | 'low';
export type ImagePipelineDuplicateKind = 'exact' | 'near';
export type ImagePipelineExportStatus = 'selected' | 'reserved' | 'discarded';
export type ImagePipelineSelectionRole =
  | 'hero-main'
  | 'hero-alt'
  | 'dish'
  | 'gallery'
  | 'ambience'
  | 'interior'
  | 'exterior'
  | 'staff'
  | 'logo'
  | 'fallback'
  | 'reserve'
  | 'discard';

export interface ImagePipelineMetricsProfile {
  format: string;
  fileSizeBytes: number;
  metricSource: 'powershell' | 'basic';
  averageBrightness?: number | null;
  contrastDeviation?: number | null;
  edgeStrength?: number | null;
  colorfulness?: number | null;
  perceptualHash?: string | null;
  sampleCount?: number | null;
}

export interface ImagePipelineScoreProfile {
  total: number;
  resolution: number;
  lighting: number;
  contrast: number;
  sharpness: number;
  colorfulness: number;
  utility: number;
  uniqueness: number;
  heroPotential: number;
  reasons: string[];
}

export interface ImagePipelineClassificationProfile {
  primaryCategory: ImagePipelineCategory;
  secondaryCategories: ImagePipelineCategory[];
  confidence: ImagePipelineConfidence;
  matchedFeaturedItemId?: string | null;
  matchedFeaturedItemTitle?: string | null;
  reasons: string[];
}

export interface ImagePipelineMeta {
  sourceRelativePath: string;
  exportFilename?: string | null;
  exportStatus: ImagePipelineExportStatus;
  selectionRole?: ImagePipelineSelectionRole | null;
  selectionRank?: number | null;
  duplicateOf?: string | null;
  duplicateKind?: ImagePipelineDuplicateKind | null;
  metrics: ImagePipelineMetricsProfile;
  score: ImagePipelineScoreProfile;
  classification: ImagePipelineClassificationProfile;
}

export interface GeneratedImageMapAsset {
  id: string;
  publicPath: string;
  originalFilename?: string | null;
  kind: 'hero' | 'gallery' | 'detail' | 'texture';
  ratio: 'portrait' | 'landscape' | 'square' | 'ultrawide';
  roles?: Array<'hero' | 'gallery' | 'dish' | 'ambience' | 'exterior' | 'interior' | 'detail' | 'social' | 'fallback' | 'discard'>;
  quality: 'strong' | 'usable' | 'weak' | 'discard';
  reviewStatus: 'approved' | 'backup' | 'discard';
  heroCandidate?: boolean;
  discard?: boolean;
  subject: string;
  treatment?: string | null;
  suggestedAlt: string;
  desiredCrops?: Array<'portrait' | 'landscape' | 'square' | 'social'>;
  width?: number | null;
  height?: number | null;
  notes?: string | null;
  pipeline: ImagePipelineMeta;
}

export interface GeneratedImageSelection {
  heroMainAssetId?: string | null;
  heroAlternateAssetIds: string[];
  dishAssetIds: string[];
  galleryAssetIds: string[];
  ambienceAssetIds: string[];
  exteriorAssetIds: string[];
  fallbackAssetId?: string | null;
}

export interface GeneratedImageMapFile {
  schemaVersion: number;
  fileKind: 'image-map';
  businessSlug: string;
  updatedAt: string;
  summary: {
    totalAssets: number;
    selectedAssets: number;
    reservedAssets: number;
    discardedAssets: number;
    duplicateAssets: number;
    weakAssets: number;
    heroCandidates: number;
  };
  selection: GeneratedImageSelection;
  assets: GeneratedImageMapAsset[];
  notes?: string[];
}

export interface ImagePipelineContext {
  slug: string;
  businessName: string;
  niche: string;
  primaryCategory?: string | null;
  featuredItems: Array<{
    title: string;
    accent?: string | null;
    imageAssetId?: string | null;
  }>;
  serviceModes?: string[];
  sectorType?: string | null;
  visualFamily?: string | null;
  rawImageFolder: string;
  outputDirectory: string;
  outputPublicBase: string;
}
