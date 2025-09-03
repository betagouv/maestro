import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { RegionalPrescriptionComment } from '../schema/RegionalPrescription/RegionalPrescriptionComment';

export const genRegionalPrescriptionComment = (
  data?: Partial<RegionalPrescriptionComment>
): RegionalPrescriptionComment => ({
  id: uuidv4(),
  regionalPrescriptionId: uuidv4(),
  comment: fakerFR.food.description(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  ...data
});
