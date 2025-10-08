import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { MatrixKindEffective } from '../referential/Matrix/MatrixKind';
import { RegionList, Regions } from '../referential/Region';
import { SSD2Ids } from '../referential/Residue/SSD2Id';
import { StageList } from '../referential/Stage';
import { AnalysisMethodList } from '../schema/Analysis/AnalysisMethod';
import { LocalPrescription } from '../schema/LocalPrescription/LocalPrescription';
import { Prescription } from '../schema/Prescription/Prescription';
import { PrescriptionSubstance } from '../schema/Prescription/PrescriptionSubstance';
import { ProgrammingPlanContextList } from '../schema/ProgrammingPlan/Context';
import { DummyLaboratoryIds } from '../schema/User/User';
import { LaboratoryFixture } from './laboratoryFixtures';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from './programmingPlanFixtures';
import { oneOf } from './testFixtures';

export const genPrescription = (
  data?: Partial<Prescription>
): Prescription => ({
  id: uuidv4(),
  programmingPlanId: uuidv4(),
  programmingPlanKind: 'PPV',
  context: oneOf(ProgrammingPlanContextList),
  matrixKind: oneOf(MatrixKindEffective.options),
  stages: ['STADE1'],
  ...data
});

export const genLocalPrescription = (
  data?: Partial<LocalPrescription>
): LocalPrescription => ({
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
  substance: oneOf(SSD2Ids),
  ...data
});

export const PrescriptionFixture = genPrescription({
  id: '11111111-1111-1111-1111-111111111111',
  programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
  programmingPlanKind: PPVValidatedProgrammingPlanFixture.kinds[0],
  context: PPVValidatedProgrammingPlanFixture.contexts[0],
  matrixKind: 'A00GY',
  stages: StageList
});

export const LocalPrescriptionFixture = genLocalPrescription({
  prescriptionId: PrescriptionFixture.id,
  region: '44',
  sampleCount: 1,
  laboratoryId: LaboratoryFixture.id
});

export const FoieDeBovinPrescriptionFixture = genPrescription({
  id: '177e280f-7fc5-499f-9dcb-4970dc00af36',
  programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
  programmingPlanKind: 'DAOA_SLAUGHTER',
  context: 'Surveillance',
  matrixKind: 'TODO1',
  stages: ['STADE10']
});
export const VolaillePrescriptionFixture = genPrescription({
  id: '608d0973-b472-4964-a8d7-246f91ad4d39',
  programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
  programmingPlanKind: 'DAOA_BREEDING',
  context: 'Surveillance',
  matrixKind: 'TODO2',
  stages: ['STADE10']
});

export const genLocalPrescriptions = (
  prescriptionId: string,
  quantities: number[],
  options?: {
    withDepartment?: boolean;
  }
) => [
  ...quantities.map((quantity, index) => ({
    prescriptionId,
    region: RegionList[index],
    sampleCount: quantity,
    department: undefined
  })),
  ...(options?.withDepartment
    ? RegionList.flatMap((region) =>
        Regions[region].departments.map((department) => ({
          prescriptionId,
          region,
          department,
          sampleCount: 0,
          laboratoryId: oneOf(DummyLaboratoryIds)
        }))
      )
    : [])
];
export const FoieDeBovinLocalPrescriptionFixture = genLocalPrescriptions(
  FoieDeBovinPrescriptionFixture.id,
  [3, 2, 5, 8, 10, 1, 2, 10, 3, 3, 2, 9, 4, 4, 2, 1, 5, 6],
  { withDepartment: true }
);

export const VolailleLocalPrescriptionFixture = genLocalPrescriptions(
  VolaillePrescriptionFixture.id,
  [2, 3, 8, 1, 9, 1, 11, 3, 2, 1, 1, 4, 6, 1, 5, 6, 3, 10],
  { withDepartment: true }
);
