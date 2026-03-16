import type { DemoPreset } from '../types/business';

export const demoPresets: DemoPreset[] = [
  {
    slug: 'dosa-signature',
    label: 'City Plates',
    description: 'The default preset balancing food-first imagery, clear menu highlights, and fast local action.',
    businessSlug: 'the-dosa-spot',
    presentationRole: 'primary',
    heroVariant: 'cinematic-split',
    servicesVariant: 'signature-grid',
    galleryVariant: 'atmosphere-carousel',
    ctaVariant: 'visit-studio',
    isDefault: true,
  },
  {
    slug: 'dosa-poster',
    label: 'Spice Table',
    description: 'A warmer, more editorial preset that pushes the food visuals first.',
    businessSlug: 'the-dosa-spot',
    presentationRole: 'secondary',
    heroVariant: 'immersive-poster',
    servicesVariant: 'editorial-rows',
    galleryVariant: 'frames-mosaic',
    ctaVariant: 'book-consult',
  },
  {
    slug: 'dosa-monolith',
    label: 'Washington Street',
    description: 'A more compact route with stronger emphasis on location, trust, and quick menu access.',
    businessSlug: 'the-dosa-spot',
    presentationRole: 'fallback',
    heroVariant: 'monolith-stack',
    servicesVariant: 'signature-grid',
    galleryVariant: 'frames-mosaic',
    ctaVariant: 'visit-studio',
  },
];
