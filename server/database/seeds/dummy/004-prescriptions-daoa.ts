import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { DAOAInProgressProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';
import { RegionalPrescriptions } from '../../../repositories/regionalPrescriptionRepository';
import { DummyLaboratoryIds } from './002-laboratories';

const foie_de_bovin = genPrescription({
  id: '177e280f-7fc5-499f-9dcb-4970dc00af36',
  programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
  programmingPlanKind: 'DAOA_SLAUGHTER',
  context: 'Surveillance',
  matrixKind: 'TODO1',
  stages: ['STADE10']
});
const volaille = genPrescription({
  id: '608d0973-b472-4964-a8d7-246f91ad4d39',
  programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
  programmingPlanKind: 'DAOA_BREEDING',
  context: 'Surveillance',
  matrixKind: 'TODO2',
  stages: ['STADE10']
});

export const seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ id: DAOAInProgressProgrammingPlanFixture.id })
    .first();

  if (!validatedProgrammingPlan) {
    return;
  }

  const genRegionalPrescriptions = (
    prescriptionId: string,
    quantities: number[]
  ) => [
    ...quantities.map((quantity, index) => ({
      prescriptionId,
      region: RegionList[index],
      sampleCount: quantity
    })),
    ...RegionList.flatMap((region) =>
      Regions[region].departments.map((department) => ({
        prescriptionId,
        region,
        department,
        sampleCount: 0,
        laboratoryId: oneOf(DummyLaboratoryIds)
      }))
    )
  ];

  await Prescriptions().insert([foie_de_bovin, volaille]);

  await RegionalPrescriptions().insert([
    ...genRegionalPrescriptions(
      foie_de_bovin.id,
      [3, 2, 5, 8, 10, 1, 2, 10, 3, 3, 2, 9, 4, 4, 2, 1, 5, 6]
    ),
    ...genRegionalPrescriptions(
      volaille.id,
      [2, 3, 8, 1, 9, 1, 11, 3, 2, 1, 1, 4, 6, 1, 5, 6, 3, 10]
    )
  ]);
};
