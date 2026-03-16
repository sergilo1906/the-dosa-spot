import type { BusinessBrief } from '../../types/business';
import type { BusinessMasterRecord } from '../../types/business-record';
import type { AssemblyProfileFile } from '../../types/assembly-engine';
import type { CopyProfileFile } from '../../types/copy-engine';
import type { SectorProfileFile } from '../../types/sector-engine';
import type { VisualProfileFile } from '../../types/visual-engine';
import {
  theDosaSpotAssemblyProfile,
  theDosaSpotBusiness,
  theDosaSpotCopyProfile,
  theDosaSpotMasterRecord,
  theDosaSpotSectorProfile,
  theDosaSpotVisualProfile,
} from './the-dosa-spot';

const businessMasterRecords = {
  'the-dosa-spot': theDosaSpotMasterRecord,
} as const satisfies Record<string, BusinessMasterRecord>;

const businessRuntimeBusinesses = {
  'the-dosa-spot': theDosaSpotBusiness,
} as const satisfies Record<string, BusinessBrief>;

const businessSectorProfiles = {
  'the-dosa-spot': theDosaSpotSectorProfile,
} as const satisfies Record<string, SectorProfileFile>;

const businessVisualProfiles = {
  'the-dosa-spot': theDosaSpotVisualProfile,
} as const satisfies Record<string, VisualProfileFile>;

const businessCopyProfiles = {
  'the-dosa-spot': theDosaSpotCopyProfile,
} as const satisfies Record<string, CopyProfileFile>;

const businessAssemblyProfiles = {
  'the-dosa-spot': theDosaSpotAssemblyProfile,
} as const satisfies Record<string, AssemblyProfileFile>;

export type BusinessRecordSlug = keyof typeof businessMasterRecords;
export interface BusinessSystemRecord {
  slug: BusinessRecordSlug;
  record: BusinessMasterRecord;
  business: BusinessBrief;
  sectorProfile: SectorProfileFile;
  visualProfile: VisualProfileFile;
  copyProfile: CopyProfileFile;
  assemblyProfile: AssemblyProfileFile;
}

const businessSystemRecords = {
  'the-dosa-spot': {
    slug: 'the-dosa-spot',
    record: theDosaSpotMasterRecord,
    business: theDosaSpotBusiness,
    sectorProfile: theDosaSpotSectorProfile,
    visualProfile: theDosaSpotVisualProfile,
    copyProfile: theDosaSpotCopyProfile,
    assemblyProfile: theDosaSpotAssemblyProfile,
  },
} as const satisfies Record<BusinessRecordSlug, BusinessSystemRecord>;

function assertBusinessRecordSlug(slug: string): BusinessRecordSlug {
  if (!(slug in businessSystemRecords)) {
    throw new Error(`Unknown business slug: ${slug}`);
  }

  return slug as BusinessRecordSlug;
}

export function getBusinessMasterRecordBySlug(slug: string) {
  return businessMasterRecords[assertBusinessRecordSlug(slug)];
}

export function getAllBusinessMasterRecords() {
  return Object.values(businessMasterRecords);
}

export function getBusinessRuntimeBySlug(slug: string) {
  return businessRuntimeBusinesses[assertBusinessRecordSlug(slug)];
}

export function getAllBusinessRuntimeBusinesses() {
  return Object.values(businessRuntimeBusinesses);
}

export function getBusinessSectorProfileBySlug(slug: string) {
  return businessSectorProfiles[assertBusinessRecordSlug(slug)];
}

export function getAllBusinessSectorProfiles() {
  return Object.values(businessSectorProfiles);
}

export function getBusinessVisualProfileBySlug(slug: string) {
  return businessVisualProfiles[assertBusinessRecordSlug(slug)];
}

export function getAllBusinessVisualProfiles() {
  return Object.values(businessVisualProfiles);
}

export function getBusinessCopyProfileBySlug(slug: string) {
  return businessCopyProfiles[assertBusinessRecordSlug(slug)];
}

export function getAllBusinessCopyProfiles() {
  return Object.values(businessCopyProfiles);
}

export function getBusinessAssemblyProfileBySlug(slug: string) {
  return businessAssemblyProfiles[assertBusinessRecordSlug(slug)];
}

export function getAllBusinessAssemblyProfiles() {
  return Object.values(businessAssemblyProfiles);
}

export function getBusinessSystemBySlug(slug: string) {
  return businessSystemRecords[assertBusinessRecordSlug(slug)];
}

export function getAllBusinessSystems() {
  return Object.values(businessSystemRecords);
}
