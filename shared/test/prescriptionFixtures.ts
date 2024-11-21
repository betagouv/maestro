import { v4 as uuidv4 } from 'uuid';
import { MatrixList } from '../referential/Matrix/Matrix';
import { RegionList } from '../referential/Region';
import { StageList } from '../referential/Stage';
import { AnalysisKindList } from '../schema/Analysis/AnalysisKind';
import { Prescription } from '../schema/Prescription/Prescription';
import { PrescriptionSubstanceAnalysis } from '../schema/Prescription/PrescriptionSubstanceAnalysis';
import { ContextList } from '../schema/ProgrammingPlan/Context';
import { RegionalPrescription } from '../schema/RegionalPrescription/RegionalPrescription';
import { genNumber, genSubstance, oneOf } from './testFixtures';

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
  prescriptionId: uuidv4(),
  region: oneOf(RegionList),
  sampleCount: genNumber(1),
  realizedSampleCount: genNumber(1),
  ...data,
});

export const genPrescriptionSubstanceAnalysis = (
  data?: Partial<PrescriptionSubstanceAnalysis>
): PrescriptionSubstanceAnalysis => ({
  prescriptionId: uuidv4(),
  analysisKind: oneOf(AnalysisKindList),
  substance: genSubstance(),
  ...data,
});
