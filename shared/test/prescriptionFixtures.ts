import { v4 as uuidv4 } from 'uuid';
import { MatrixList } from '../referential/Matrix/Matrix';
import { RegionList } from '../referential/Region';
import { StageList } from '../referential/Stage';
import { Prescription } from '../schema/Prescription/Prescription';
import { ContextList } from '../schema/ProgrammingPlan/Context';
import { RegionalPrescription } from '../schema/RegionalPrescription/RegionalPrescription';
import { genNumber, oneOf } from './testFixtures';

export const genPrescription = (
  data?: Partial<Prescription>
): Prescription => ({
  id: uuidv4(),
  programmingPlanId: uuidv4(),
  context: oneOf(ContextList),
  matrix: oneOf(MatrixList),
  stages: [oneOf(StageList)],
  ...data,
});

export const genRegionalPrescription = (
  data?: Partial<RegionalPrescription>
): RegionalPrescription => ({
  id: uuidv4(),
  prescriptionId: uuidv4(),
  region: oneOf(RegionList),
  sampleCount: genNumber(1),
  realizedSampleCount: genNumber(1),
  ...data,
});
