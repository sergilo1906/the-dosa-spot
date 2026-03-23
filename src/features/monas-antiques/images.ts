import type { ImageAsset, ImageKind, ImageRatio } from '../../types/business';

export type MonaAntiquesImageCategory = 'hero' | 'storefront' | 'collection' | 'ambience';
export type MonaAntiquesSourceType = 'real-business' | 'support-stock' | 'contextual';
export type MonaAntiquesSourceConfidence = 'high' | 'medium' | 'low';

export type MonaAntiquesImageSlot =
  | 'heroMain'
  | 'storefrontMain'
  | 'collection01'
  | 'collection02'
  | 'collection03'
  | 'collection04'
  | 'ambience01'
  | 'ambience02';

export interface MonaAntiquesRemoteImageSeed extends ImageAsset {
  slot: MonaAntiquesImageSlot;
  category: MonaAntiquesImageCategory;
  placeholderToken: string;
  usage: string;
  sourceType: MonaAntiquesSourceType;
  sourceLabel: string;
  sourcePageUrl: string;
  confidence: MonaAntiquesSourceConfidence;
  notes: string;
  finalHostStatus: 'pending' | 'resolved';
}

export const monasAntiquesRemoteImagePolicy = {
  deliveryMode: 'browser-native-remote-img',
  astroRemoteConfigRequired: false,
  currentDecision:
    'Mona uses plain <img> tags with remote src strings because the current shared render layer already consumes image src as raw strings.',
  escalationRule:
    'Only add Astro remote allowlists once Mona explicitly switches to astro:assets or another optimized remote-image path.',
  approvedHosts: ['img.localitybiz.com', 'images.pexels.com'],
} as const;

export const MONAS_ANTIQUES_REMOTE_IMAGE_PLACEHOLDERS = {
  heroMain: '__MONAS_HERO_URL__',
  storefrontMain: '__MONAS_STOREFRONT_URL__',
  collection01: '__MONAS_COLLECTION_01_URL__',
  collection02: '__MONAS_COLLECTION_02_URL__',
  collection03: '__MONAS_COLLECTION_03_URL__',
  collection04: '__MONAS_COLLECTION_04_URL__',
  ambience01: '__MONAS_AMBIENCE_01_URL__',
  ambience02: '__MONAS_AMBIENCE_02_URL__',
} as const satisfies Record<MonaAntiquesImageSlot, string>;

function createSeed(input: {
  slot: MonaAntiquesImageSlot;
  category: MonaAntiquesImageCategory;
  src: string;
  kind: ImageKind;
  ratio: ImageRatio;
  alt: string;
  treatment: string;
  usage: string;
  width: number;
  height: number;
  sourceType: MonaAntiquesSourceType;
  sourceLabel: string;
  sourcePageUrl: string;
  confidence: MonaAntiquesSourceConfidence;
  notes: string;
}): MonaAntiquesRemoteImageSeed {
  return {
    id: input.slot,
    slot: input.slot,
    category: input.category,
    placeholderToken: MONAS_ANTIQUES_REMOTE_IMAGE_PLACEHOLDERS[input.slot],
    src: input.src,
    alt: input.alt,
    kind: input.kind,
    ratio: input.ratio,
    treatment: input.treatment,
    width: input.width,
    height: input.height,
    usage: input.usage,
    sourceType: input.sourceType,
    sourceLabel: input.sourceLabel,
    sourcePageUrl: input.sourcePageUrl,
    confidence: input.confidence,
    notes: input.notes,
    finalHostStatus: 'resolved',
  };
}

export const monasAntiquesImageMap = {
  heroMain: createSeed({
    slot: 'heroMain',
    category: 'hero',
    src: 'https://images.pexels.com/photos/20002456/pexels-photo-20002456.jpeg?cs=srgb&dl=pexels-dagmara-dombrovska-22732579-20002456.jpg&fm=jpg',
    kind: 'hero',
    ratio: 'portrait',
    alt: 'Vintage silver rings and gemstone pieces styled beside glass scent bottles.',
    treatment: 'editorial portrait',
    usage: 'Primary opening image for the first fold.',
    width: 2592,
    height: 3872,
    sourceType: 'support-stock',
    sourceLabel: 'Pexels',
    sourcePageUrl: 'https://www.pexels.com/photo/vintage-silver-jewelry-20002456/',
    confidence: 'high',
    notes: 'Strong editorial hero with warmth, patina, and antique-adjacent styling rather than modern e-commerce cues.',
  }),
  storefrontMain: createSeed({
    slot: 'storefrontMain',
    category: 'storefront',
    src: 'https://img.localitybiz.com/ANJU3DskHhj62rsbcBmgfkWyEDSaQd7FFhkV2PnhREKFVKUwsU_MNWlieDUFkMTKvE2TAiOrH1NHMPSCnLiWxsvf9Vr29l8rsQyhmg=s1600-w480',
    kind: 'gallery',
    ratio: 'landscape',
    alt: "Mona's Antiques storefront on Oliver Plunkett Street in Cork.",
    treatment: 'heritage exterior',
    usage: 'Street-level boutique confirmation shot for the real-business anchor.',
    width: 480,
    height: 236,
    sourceType: 'real-business',
    sourceLabel: 'LocalityBiz',
    sourcePageUrl: 'https://ie.localitybiz.com/21557117/mona%27s-antiques-cork',
    confidence: 'high',
    notes: "Visible Mona's sign on the Cork listing makes this the best real-business credibility image available.",
  }),
  collection01: createSeed({
    slot: 'collection01',
    category: 'collection',
    src: 'https://img.localitybiz.com/ANJU3DsvvVz436a4bPnov9u4br646wZ6-Tw5G9Am7FpD_MtbEKJ7R3IEEnvqa_aMau3Qpp-pNgEbDhkAItaJhXX-Qm7-xOLvzXmP_w=s1600-w480',
    kind: 'detail',
    ratio: 'landscape',
    alt: "Rings and small jewellery pieces arranged in apothecary-style drawers inside Mona's Antiques.",
    treatment: 'cabinet detail',
    usage: 'Real-business interior display to support curation credibility.',
    width: 480,
    height: 270,
    sourceType: 'real-business',
    sourceLabel: 'LocalityBiz',
    sourcePageUrl: 'https://ie.localitybiz.com/21557117/mona%27s-antiques-cork',
    confidence: 'medium',
    notes: "Interior display appears on the Mona's Cork listing and fits the boutique tone, but the storefront sign is not visible in-frame.",
  }),
  collection02: createSeed({
    slot: 'collection02',
    category: 'collection',
    src: 'https://images.pexels.com/photos/11365012/pexels-photo-11365012.jpeg?cs=srgb&dl=pexels-creative-wedding-films-188401661-11365012.jpg&fm=jpg',
    kind: 'detail',
    ratio: 'landscape',
    alt: 'Pearl necklace and earrings arranged inside an open vintage jewellery box.',
    treatment: 'jewellery close-up',
    usage: 'Classic pearl-led collection frame for the supporting set.',
    width: 2448,
    height: 1635,
    sourceType: 'support-stock',
    sourceLabel: 'Pexels',
    sourcePageUrl: 'https://www.pexels.com/photo/close-up-photo-of-pearl-necklace-and-earings-11365012/',
    confidence: 'high',
    notes: 'Warm and classic; feels curated and giftable without reading as contemporary direct-to-consumer jewellery.',
  }),
  collection03: createSeed({
    slot: 'collection03',
    category: 'collection',
    src: 'https://images.pexels.com/photos/6012226/pexels-photo-6012226.jpeg?cs=srgb&dl=pexels-jonatan-rios-2455283-6012226.jpg&fm=jpg',
    kind: 'detail',
    ratio: 'square',
    alt: 'Close-up of a vintage ring with a dark gemstone setting.',
    treatment: 'curated tray detail',
    usage: 'Moody contrast frame for rings or singular hero pieces.',
    width: 3324,
    height: 3416,
    sourceType: 'support-stock',
    sourceLabel: 'Pexels',
    sourcePageUrl: 'https://www.pexels.com/photo/close-up-photo-of-vintage-ring-6012226/',
    confidence: 'high',
    notes: 'Adds depth and contrast to the set while staying firmly in the vintage-jewellery world.',
  }),
  collection04: createSeed({
    slot: 'collection04',
    category: 'collection',
    src: 'https://images.pexels.com/photos/10915187/pexels-photo-10915187.jpeg?cs=srgb&dl=pexels-lany-10915187.jpg&fm=jpg',
    kind: 'detail',
    ratio: 'square',
    alt: 'Pearls and vintage jewellery arranged beside a shell and mirror.',
    treatment: 'editorial still life',
    usage: 'Alternate collection frame for visual rhythm and editorial softness.',
    width: 4000,
    height: 4256,
    sourceType: 'support-stock',
    sourceLabel: 'Pexels',
    sourcePageUrl: 'https://www.pexels.com/photo/pearl-shell-and-vintage-jewelry-on-surface-10915187/',
    confidence: 'medium',
    notes: 'More stylised than the core collection shots, but still coherent with the heritage boutique direction.',
  }),
  ambience01: createSeed({
    slot: 'ambience01',
    category: 'ambience',
    src: 'https://images.pexels.com/photos/10069279/pexels-photo-10069279.jpeg?cs=srgb&dl=pexels-cottonbro-10069279.jpg&fm=jpg',
    kind: 'gallery',
    ratio: 'portrait',
    alt: 'Pearl necklace hanging from an ornamented antique mirror.',
    treatment: 'interior ambience',
    usage: 'Elegant boutique ambience without introducing modern retail cues.',
    width: 3648,
    height: 5472,
    sourceType: 'support-stock',
    sourceLabel: 'Pexels',
    sourcePageUrl: 'https://www.pexels.com/photo/pearl-necklace-on-metal-framed-mirror-10069279/',
    confidence: 'high',
    notes: 'Strong atmosphere image that reinforces intimacy, ornament, and old-world texture.',
  }),
  ambience02: createSeed({
    slot: 'ambience02',
    category: 'ambience',
    src: 'https://images.pexels.com/photos/34544569/pexels-photo-34544569.jpeg?cs=srgb&dl=pexels-dawn-reynolds-2146425037-34544569.jpg&fm=jpg',
    kind: 'gallery',
    ratio: 'portrait',
    alt: 'Antique still life with crystal carafe and a tray of small jewellery pieces.',
    treatment: 'material texture',
    usage: 'Supporting frame for textures, patina, and the wider boutique world.',
    width: 3024,
    height: 4032,
    sourceType: 'support-stock',
    sourceLabel: 'Pexels',
    sourcePageUrl: 'https://www.pexels.com/photo/elegant-antique-still-life-with-crystal-carafe-34544569/',
    confidence: 'medium',
    notes: 'Supports the heritage universe well, though it is more atmospheric than product-specific.',
  }),
} as const satisfies Record<MonaAntiquesImageSlot, MonaAntiquesRemoteImageSeed>;

export const monasAntiquesImageGroups = {
  hero: [monasAntiquesImageMap.heroMain],
  storefront: [monasAntiquesImageMap.storefrontMain],
  collections: [
    monasAntiquesImageMap.collection01,
    monasAntiquesImageMap.collection02,
    monasAntiquesImageMap.collection03,
    monasAntiquesImageMap.collection04,
  ],
  ambience: [monasAntiquesImageMap.ambience01, monasAntiquesImageMap.ambience02],
} as const;

export const monasAntiquesBusinessImageAssets: ImageAsset[] = Object.values(monasAntiquesImageMap).map((asset) => ({
  id: asset.id,
  src: asset.src,
  alt: asset.alt,
  kind: asset.kind,
  ratio: asset.ratio,
  treatment: asset.treatment,
  width: asset.width,
  height: asset.height,
}));

export function getMonasAntiquesImage(slot: MonaAntiquesImageSlot) {
  return monasAntiquesImageMap[slot];
}

export function getMonasAntiquesImagesByCategory(category: MonaAntiquesImageCategory) {
  return Object.values(monasAntiquesImageMap).filter((asset) => asset.category === category);
}

export function isMonasAntiquesImagePlaceholder(value: string) {
  return /^__MONAS_[A-Z0-9_]+__$/.test(value.trim());
}

export function monasAntiquesRemoteImagesAreReady() {
  return Object.values(monasAntiquesImageMap).every(
    (asset) => asset.finalHostStatus === 'resolved' && !isMonasAntiquesImagePlaceholder(asset.src),
  );
}
