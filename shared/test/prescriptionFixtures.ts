import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { MatrixKindEffective } from '../referential/Matrix/MatrixKind';
import { RegionList } from '../referential/Region';
import { StageList } from '../referential/Stage';
import { AnalysisMethodList } from '../schema/Analysis/AnalysisMethod';
import { Prescription } from '../schema/Prescription/Prescription';
import { PrescriptionSubstance } from '../schema/Prescription/PrescriptionSubstance';
import { ContextList } from '../schema/ProgrammingPlan/Context';
import { RegionalPrescription } from '../schema/RegionalPrescription/RegionalPrescription';
import { genSubstance } from './substanceFixtures';
import { oneOf } from './testFixtures';

export const genPrescription = (
  data?: Partial<Prescription>
): Prescription => ({
  id: uuidv4(),
  programmingPlanId: uuidv4(),
  context: oneOf(ContextList),
  matrixKind: oneOf(MatrixKindEffective.options),
  stages: [oneOf(StageList)],
  ...data
});

export const genRegionalPrescription = (
  data?: Partial<RegionalPrescription>
): RegionalPrescription => ({
  prescriptionId: uuidv4(),
  region: oneOf(RegionList),
  sampleCount: fakerFR.number.int({
    min: 1,
    max: 50
  }),
  ...data
});

export const genPrescriptionSubstance = (
  data?: Partial<PrescriptionSubstance>
): PrescriptionSubstance => ({
  prescriptionId: uuidv4(),
  analysisMethod: oneOf(AnalysisMethodList),
  substance: genSubstance(),
  ...data
});
