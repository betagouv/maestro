import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionList } from '../referential/Region';
import { RegionalPrescriptionComment } from '../schema/RegionalPrescription/RegionalPrescriptionComment';
import { oneOf } from './testFixtures';

export const genRegionalPrescriptionComment = (
  data?: Partial<RegionalPrescriptionComment>
): RegionalPrescriptionComment => ({
  id: uuidv4(),
  prescriptionId: uuidv4(),
  region: oneOf(RegionList),
  comment: fakerFR.food.description(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  ...data
});
