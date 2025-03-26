import { RegionList } from 'maestro-shared/referential/Region';
import { genPrescription } from 'maestro-shared/test/prescriptionFixtures';
import { oneOf } from 'maestro-shared/test/testFixtures';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';
import { RegionalPrescriptions } from '../../../repositories/regionalPrescriptionRepository';
import { DummyLaboratoryIds } from './002-laboratories';
import { pfasValidatedProgrammingPlanId } from './003-programming-plans';

export const bovin = genPrescription({
  id: '1ac599c4-1241-445e-a4eb-09d353810e10',
  programmingPlanId: pfasValidatedProgrammingPlanId,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01QX',
  stages: ['STADE10']
});
export const caprin = genPrescription({
  id: '2f133d43-c18d-4c15-bb78-22afa128ccfc',
  programmingPlanId: pfasValidatedProgrammingPlanId,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01RL',
  stages: ['STADE10']
});
export const ovin = genPrescription({
  id: 'f3949b9e-1722-4e53-b4c1-758916560817',
  programmingPlanId: pfasValidatedProgrammingPlanId,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01RJ',
  stages: ['STADE10']
});
export const porcin = genPrescription({
  id: 'a9229604-17ed-445b-b791-5e460abc5ccb',
  programmingPlanId: pfasValidatedProgrammingPlanId,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01RG',
  stages: ['STADE10']
});
export const volaille = genPrescription({
  id: '3489e7d2-fd2d-4a66-873d-cab4dc81b89a',
  programmingPlanId: pfasValidatedProgrammingPlanId,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01SN',
  stages: ['STADE10']
});
export const oeufs = genPrescription({
  id: '7a6a847e-f2d1-472d-a7c9-9ad56e65e295',
  programmingPlanId: pfasValidatedProgrammingPlanId,
  programmingPlanKind: 'PFAS_EGGS',
  context: 'Control',
  matrixKind: 'A031E',
  stages: ['STADE11', 'STADE12']
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

  await Prescriptions().insert([bovin, caprin, ovin, porcin, volaille, oeufs]);

  await RegionalPrescriptions().insert([
    ...genRegionalPrescriptions(
      bovin.id,
      [3, 2, 5, 0, 0, 1, 2, 0, 3, 3, 2, 0, 4, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      caprin.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      ovin.id,
      [1, 1, 2, 0, 0, 1, 0, 1, 6, 0, 6, 3, 2, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      porcin.id,
      [2, 0, 14, 1, 0, 0, 1, 0, 2, 0, 1, 0, 2, 0, 0, 0, 1, 0]
    ),
    ...genRegionalPrescriptions(
      volaille.id,
      [2, 3, 8, 1, 0, 1, 0, 0, 2, 1, 1, 0, 6, 0, 0, 0, 0, 0]
    ),
    ...genRegionalPrescriptions(
      oeufs.id,
      [12, 2, 54, 3, 0, 10, 15, 3, 11, 6, 4, 1, 27, 1, 0, 0, 1, 0]
    )
  ]);
};
