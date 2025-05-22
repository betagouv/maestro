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
import { ValidatedProgrammingPlanFixture } from './programmingPlanFixtures';
import { genSubstance } from './substanceFixtures';
import { oneOf } from './testFixtures';

export const genPrescription = (
  data?: Partial<Prescription>
): Prescription => ({
  id: uuidv4(),
  programmingPlanId: uuidv4(),
  programmingPlanKind: 'PPV',
  context: oneOf(ContextList),
  matrixKind: oneOf(MatrixKindEffective.options),
  stages: ['STADE1'],
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

export const PrescriptionFixture = genPrescription({
  id: '11111111-1111-1111-1111-111111111111',
  programmingPlanId: ValidatedProgrammingPlanFixture.id,
  programmingPlanKind: ValidatedProgrammingPlanFixture.kinds[0],
  context: ValidatedProgrammingPlanFixture.contexts[0],
  matrixKind: 'A00GY',
  stages: StageList
});
