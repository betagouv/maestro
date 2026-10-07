import { fakerFR } from '@faker-js/faker';
import { RegionList } from '../referential/Region';
import type { LocalPrescriptionComment } from '../schema/LocalPrescription/LocalPrescriptionComment';
import { oneOf } from './testFixtures';

export const genLocalPrescriptionComment = (
  data?: Partial<LocalPrescriptionComment>
): LocalPrescriptionComment => ({
  id: crypto.randomUUID(),
  prescriptionId: crypto.randomUUID(),
  region: oneOf(RegionList),
  comment: fakerFR.food.description(),
  createdAt: new Date(),
  createdBy: crypto.randomUUID(),
  ...data
});
