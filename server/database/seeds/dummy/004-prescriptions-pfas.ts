import { RegionList } from 'maestro-shared/referential/Region';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';
import { RegionalPrescriptions } from '../../../repositories/regionalPrescriptionRepository';
import { DummyLaboratoryIds } from './002-laboratories';
import { pfasValidatedProgrammingPlanId } from './003-programming-plans';

export const oeufs = genPrescription({
  id: '1ac599c4-1241-445e-a4eb-09d353810e10',
  programmingPlanId: pfasValidatedProgrammingPlanId,
  context: 'Control',
  matrixKind: 'A031E',
  stages: ['STADE1']
});

export const seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ id: pfasValidatedProgrammingPlanId })
    .first();

  if (!validatedProgrammingPlan) {
    return;
  }

  const genRegionalPrescriptions = (
    prescriptionId: string,
    quantities: number[]
  ) =>
    quantities.map((quantity, index) => ({
      prescriptionId,
      region: RegionList[index],
      sampleCount: quantity,
      laboratoryId: oneOf(DummyLaboratoryIds)
    }));

  await Prescriptions().insert([oeufs]);

  await RegionalPrescriptions().insert([
    ...genRegionalPrescriptions(
      oeufs.id,
      [2, 54, 3, 0, 10, 15, 3, 11, 6, 4, 1, 27, 1, 0, 0, 1, 0]
    )
  ]);
};
