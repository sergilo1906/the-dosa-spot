import type { BusinessBrief } from '../../types/business';
import {
  getAllBusinessRuntimeBusinesses,
  getBusinessRuntimeBySlug,
} from '../business-records';

export function getAllBusinesses() {
  return getAllBusinessRuntimeBusinesses();
}

export function getBusinessBySlug(slug: string) {
  return getBusinessRuntimeBySlug(slug) as BusinessBrief;
}
