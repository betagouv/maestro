import { fakerFR } from '@faker-js/faker';
import { RegionList, Regions } from '../referential/Region';
import type { LocalPrescription } from '../schema/LocalPrescription/LocalPrescription';
import type { Prescription } from '../schema/Prescription/Prescription';
import { LaboratoryFixture } from './laboratoryFixtures';
import {
  DAOABovinValidatedSubPlanId,
  DAOAInProgressBovinSubPlanId,
  DAOAInProgressVolailleSubPlanId,
  DAOAVolailleValidatedSubPlanId,
  PPVValidatedSubPlanId
} from './programmingPlanFixtures';
import { oneOf } from './testFixtures';

export const genPrescription = (
  data?: Partial<Prescription>
): Prescription => ({
  id: crypto.randomUUID(),
  programmingSubPlanId: PPVValidatedSubPlanId,
  sampleCount: 0,
  ...data
});

export const genLocalPrescription = (
  data?: Partial<LocalPrescription>
): LocalPrescription => ({
  prescriptionId: crypto.randomUUID(),
  region: oneOf(RegionList),
  sampleCount: fakerFR.number.int({
    min: 1,
    max: 50
  }),
  ...data
});

export const PrescriptionFixture = genPrescription({
  id: '11111111-1111-1111-1111-111111111111',
  programmingSubPlanId: PPVValidatedSubPlanId
});

export const LocalPrescriptionFixture = genLocalPrescription({
  prescriptionId: PrescriptionFixture.id,
  region: '44',
  sampleCount: 1,
  substanceKindsLaboratories: [
    {
      substanceKind: 'Mono',
      laboratoryId: LaboratoryFixture.id
    },
    {
      substanceKind: 'Multi',
      laboratoryId: LaboratoryFixture.id
    }
  ]
});

export const FoieDeBovinPrescriptionFixture = genPrescription({
  id: '177e280f-7fc5-499f-9dcb-4970dc00af36',
  programmingSubPlanId: DAOAInProgressBovinSubPlanId,
  sampleCount: 80
});
export const VolaillePrescriptionFixture = genPrescription({
  id: '608d0973-b472-4964-a8d7-246f91ad4d39',
  programmingSubPlanId: DAOAInProgressVolailleSubPlanId,
  sampleCount: 77
});
export const FoieDeBovinValidatedPrescriptionFixture = {
  ...FoieDeBovinPrescriptionFixture,
  id: '5e7fe72f-cb52-4adf-a36a-93e553f73935',
  programmingSubPlanId: DAOABovinValidatedSubPlanId
};
export const VolailleValidatedPrescriptionFixture = {
  ...VolaillePrescriptionFixture,
  id: '17aee1c4-c8d0-4aad-9ed1-fb1f6d22bebb',
  programmingSubPlanId: DAOAVolailleValidatedSubPlanId
};

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
          sampleCount: 0
        }))
      )
    : [])
];
export const FoieDeBovinLocalPrescriptionFixture = genLocalPrescriptions(
  FoieDeBovinPrescriptionFixture.id,
  [3, 2, 5, 8, 10, 1, 2, 10, 3, 3, 2, 9, 4, 4, 2, 1, 5, 6],
  { withDepartment: true }
);
export const FoieDeBovinValidatedLocalPrescriptionFixture =
  genLocalPrescriptions(
    FoieDeBovinValidatedPrescriptionFixture.id,
    [3, 2, 5, 8, 10, 1, 2, 10, 3, 3, 2, 9, 4, 4, 2, 1, 5, 6],
    { withDepartment: true }
  );

export const VolailleLocalPrescriptionFixture = genLocalPrescriptions(
  VolaillePrescriptionFixture.id,
  [2, 3, 8, 1, 9, 1, 11, 3, 2, 1, 1, 4, 6, 1, 5, 6, 3, 10],
  { withDepartment: true }
);
export const VolailleValidatedLocalPrescriptionFixture = genLocalPrescriptions(
  VolailleValidatedPrescriptionFixture.id,
  [2, 3, 8, 1, 9, 1, 11, 3, 2, 1, 1, 4, 6, 1, 5, 6, 3, 10],
  { withDepartment: true }
);
