import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionList } from '../referential/Region';
import { LocalPrescriptionComment } from '../schema/LocalPrescription/LocalPrescriptionComment';
import { oneOf } from './testFixtures';

export const genLocalPrescriptionComment = (
  data?: Partial<LocalPrescriptionComment>
): LocalPrescriptionComment => ({
  id: uuidv4(),
  prescriptionId: uuidv4(),
  region: oneOf(RegionList),
  comment: fakerFR.food.description(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  ...data
});
