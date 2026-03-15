import { getBusinessBySlug } from './businesses';
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

export function getAllPresets() {
  return demoPresets;
}

export function getDefaultPreset() {
  const preset = demoPresets.find((item) => item.isDefault);

  if (!preset) {
    throw new Error('No default preset configured.');
  }

  return preset;
}

export function getPresetBySlug(slug: string) {
  const preset = demoPresets.find((item) => item.slug === slug);

  if (!preset) {
    throw new Error(`Unknown preset slug: ${slug}`);
  }

  return preset;
}

export function getBusinessForPreset(preset: DemoPreset) {
  return getBusinessBySlug(preset.businessSlug);
}
