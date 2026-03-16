import assemblyProfile from '../../../../business-input/the-dosa-spot/normalized/assembly-profile.json';
import businessBrief from '../../../../business-input/the-dosa-spot/normalized/business-brief.json';
import copyProfile from '../../../../business-input/the-dosa-spot/normalized/copy-profile.json';
import businessRaw from '../../../../business-input/the-dosa-spot/normalized/business-raw.json';
import contentPlan from '../../../../business-input/the-dosa-spot/normalized/content-plan.json';
import imageMap from '../../../../business-input/the-dosa-spot/normalized/image-map.json';
import missingData from '../../../../business-input/the-dosa-spot/normalized/missing-data.json';
import sectorProfile from '../../../../business-input/the-dosa-spot/normalized/sector-profile.json';
import visualProfile from '../../../../business-input/the-dosa-spot/normalized/visual-profile.json';
import { createBusinessMasterRecord } from '../../../lib/business/master-record';
import { createBusinessBriefInputFromMasterRecord } from '../../../lib/business/master-record';
import { normalizeBusinessBrief } from '../../../lib/business/normalize';
import type { BusinessBrief } from '../../../types/business';
import type { AssemblyProfileFile } from '../../../types/assembly-engine';
import type { CopyProfileFile } from '../../../types/copy-engine';
import type { SectorProfileFile } from '../../../types/sector-engine';
import type { VisualProfileFile } from '../../../types/visual-engine';

export const theDosaSpotMasterRecord = createBusinessMasterRecord({
  raw: businessRaw,
  brief: businessBrief,
  missingData,
  contentPlan,
  imageMap,
});
export const theDosaSpotBusiness: BusinessBrief = normalizeBusinessBrief(
  createBusinessBriefInputFromMasterRecord(theDosaSpotMasterRecord),
);

export const theDosaSpotSectorProfile = sectorProfile as SectorProfileFile;
export const theDosaSpotVisualProfile = visualProfile as VisualProfileFile;
export const theDosaSpotCopyProfile = copyProfile as CopyProfileFile;
export const theDosaSpotAssemblyProfile = assemblyProfile as AssemblyProfileFile;
