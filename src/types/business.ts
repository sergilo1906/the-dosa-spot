export type BusinessNiche = 'barbershop' | 'restaurant';
export type DesiredLuxuryLevel = 'elevated' | 'high' | 'editorial';
export type VisualIntensity = 'restrained' | 'bold' | 'cinematic';
export type PreferredContrast = 'soft' | 'balanced' | 'high';
export type SectionDensityPreference = 'airy' | 'balanced' | 'dense';
export type ImageKind = 'hero' | 'gallery' | 'detail' | 'texture';
export type ImageRatio = 'portrait' | 'landscape' | 'square' | 'ultrawide';
export type HeroVariant = 'cinematic-split' | 'immersive-poster' | 'monolith-stack';
export type ServicesVariant = 'signature-grid' | 'editorial-rows';
export type GalleryVariant = 'atmosphere-carousel' | 'frames-mosaic';
export type CtaVariant = 'visit-studio' | 'book-consult';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface OpeningHoursItem {
  label: string;
  dayOfWeek?: string[];
  opens?: string;
  closes?: string;
}

export interface LocalSeoData {
  areaServed?: string[];
  geoPrecision?: 'exact' | 'district' | 'city';
  priceRange?: string | null;
  serviceType?: string | null;
}

export interface ServiceItem {
  title: string;
  summary: string;
  duration?: string | null;
  priceLabel?: string | null;
  accent?: string | null;
}

export interface FeaturedItem {
  title: string;
  summary: string;
  accent?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ReviewItem {
  quote: string;
  reviewer: string;
  sourceLabel?: string | null;
  datePublished?: string | null;
}

export interface ImageAsset {
  id: string;
  src: string;
  alt: string;
  kind: ImageKind;
  ratio: ImageRatio;
  treatment?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface BusinessBriefInput {
  slug: string;
  isMockSample: boolean;
  sampleLabel: string;
  businessName: string;
  niche: BusinessNiche;
  primaryCategory?: string | null;
  tagline?: string | null;
  shortDescription?: string | null;
  city: string;
  country: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  orderUrl?: string | null;
  menuUrl?: string | null;
  openingHours?: OpeningHoursItem[] | null;
  coordinates?: Coordinates | null;
  socialLinks?: string[] | null;
  featuredItems?: FeaturedItem[] | null;
  services?: ServiceItem[] | null;
  faqItems?: FaqItem[] | null;
  realReviews?: ReviewItem[] | null;
  ratingValue?: number | null;
  reviewCount?: number | null;
  reviewHighlights?: string[] | null;
  serviceModes?: string[] | null;
  imageAssets?: ImageAsset[] | null;
  brandHints?: string[] | null;
  brandColors?: string[] | null;
  toneHints?: string[] | null;
  visualMood?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  localSeoData?: LocalSeoData | null;
  missingDataFlags?: string[] | null;
  completenessScore?: number | null;
  desiredLuxuryLevel?: DesiredLuxuryLevel | null;
  visualIntensity?: VisualIntensity | null;
  photographyStyle?: string | null;
  atmosphereKeywords?: string[] | null;
  preferredContrast?: PreferredContrast | null;
  sectionDensityPreference?: SectionDensityPreference | null;
  proofPoints?: string[] | null;
  heroSignature?: string | null;
  materialFinish?: string | null;
  imageTreatment?: string | null;
}

export interface BusinessBrief
  extends Omit<
    BusinessBriefInput,
    | 'tagline'
    | 'shortDescription'
    | 'openingHours'
    | 'socialLinks'
    | 'featuredItems'
    | 'services'
    | 'faqItems'
    | 'realReviews'
    | 'reviewHighlights'
    | 'serviceModes'
    | 'imageAssets'
    | 'brandHints'
    | 'brandColors'
    | 'toneHints'
    | 'visualMood'
    | 'seoTitle'
    | 'seoDescription'
    | 'localSeoData'
    | 'missingDataFlags'
    | 'completenessScore'
    | 'desiredLuxuryLevel'
    | 'visualIntensity'
    | 'photographyStyle'
    | 'atmosphereKeywords'
    | 'preferredContrast'
    | 'sectionDensityPreference'
    | 'proofPoints'
    | 'heroSignature'
    | 'materialFinish'
    | 'imageTreatment'
  > {
  tagline: string;
  shortDescription: string;
  openingHours: OpeningHoursItem[];
  socialLinks: string[];
  featuredItems: FeaturedItem[];
  services: ServiceItem[];
  faqItems: FaqItem[];
  realReviews: ReviewItem[];
  reviewHighlights: string[];
  serviceModes: string[];
  imageAssets: ImageAsset[];
  brandHints: string[];
  brandColors: string[];
  toneHints: string[];
  visualMood: string;
  seoTitle: string;
  seoDescription: string;
  localSeoData: LocalSeoData;
  missingDataFlags: string[];
  completenessScore: number;
  desiredLuxuryLevel: DesiredLuxuryLevel;
  visualIntensity: VisualIntensity;
  photographyStyle: string;
  atmosphereKeywords: string[];
  preferredContrast: PreferredContrast;
  sectionDensityPreference: SectionDensityPreference;
  proofPoints: string[];
  heroSignature: string;
  materialFinish: string;
  imageTreatment: string;
  primaryImage: ImageAsset | null;
  galleryAssets: ImageAsset[];
  display: {
    location: string;
    contactLabel: string;
    contactHref: string | null;
    callHref: string | null;
    directionsHref: string | null;
    orderHref: string | null;
    menuHref: string;
    websiteLabel: string | null;
    openingHoursLabel: string | null;
    ratingLabel: string | null;
  };
  sectionEligibility: {
    about: boolean;
    featuredItems: boolean;
    services: boolean;
    gallery: boolean;
    credibility: boolean;
    faq: boolean;
    contact: boolean;
  };
}

export interface DemoPreset {
  slug: string;
  label: string;
  description: string;
  businessSlug: string;
  presentationRole?: 'primary' | 'secondary' | 'fallback';
  ownerNarrative?: string | null;
  heroVariant: HeroVariant;
  servicesVariant: ServicesVariant;
  galleryVariant: GalleryVariant;
  ctaVariant: CtaVariant;
  isDefault?: boolean;
  featuredNote?: string | null;
}
