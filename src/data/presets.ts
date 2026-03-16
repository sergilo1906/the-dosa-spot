import { getBusinessBySlug } from './businesses';
import { demoPresets } from './preset-definitions';
import type { DemoPreset } from '../types/business';

const ACTIVE_PRESET_ENV_KEYS = ['PUBLIC_ACTIVE_PRESET_SLUG', 'ACTIVE_PRESET_SLUG'] as const;
const ACTIVE_BUSINESS_ENV_KEYS = ['PUBLIC_ACTIVE_BUSINESS_SLUG', 'ACTIVE_BUSINESS_SLUG'] as const;

function readFirstEnv(keys: readonly string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  return null;
}

export function getAllPresets() {
  return demoPresets;
}

export function getDefaultPreset() {
  const defaults = demoPresets.filter((item) => item.isDefault);

  if (defaults.length === 0) {
    throw new Error('No default preset configured.');
  }

  if (defaults.length > 1) {
    const businessCount = new Set(defaults.map((item) => item.businessSlug)).size;

    if (businessCount > 1) {
      throw new Error(
        'Multiple business defaults are configured. Set ACTIVE_BUSINESS_SLUG or ACTIVE_PRESET_SLUG to scope the build.',
      );
    }
  }

  return defaults[0];
}

export function getPresetBySlug(slug: string) {
  const preset = demoPresets.find((item) => item.slug === slug);

  if (!preset) {
    throw new Error(`Unknown preset slug: ${slug}`);
  }

  return preset;
}

export function getPresetsForBusinessSlug(businessSlug: string) {
  return demoPresets.filter((item) => item.businessSlug === businessSlug);
}

export function getPrimaryPresetForBusinessSlug(businessSlug: string) {
  const presets = getPresetsForBusinessSlug(businessSlug);
  const preferred = presets.find((item) => item.isDefault) ?? presets[0];

  if (!preferred) {
    throw new Error(`No preset configured for business slug: ${businessSlug}`);
  }

  return preferred;
}

export function getActivePreset() {
  const explicitPresetSlug = readFirstEnv(ACTIVE_PRESET_ENV_KEYS);
  if (explicitPresetSlug) {
    return getPresetBySlug(explicitPresetSlug);
  }

  const explicitBusinessSlug = readFirstEnv(ACTIVE_BUSINESS_ENV_KEYS);
  if (explicitBusinessSlug) {
    return getPrimaryPresetForBusinessSlug(explicitBusinessSlug);
  }

  return getDefaultPreset();
}

export function getBusinessForPreset(preset: DemoPreset) {
  return getBusinessBySlug(preset.businessSlug);
}
