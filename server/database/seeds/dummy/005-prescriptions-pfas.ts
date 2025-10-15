import {
  genLocalPrescriptions,
  genPrescription
} from 'maestro-shared/test/prescriptionFixtures';
import { PFASValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { LocalPrescriptions } from '../../../repositories/localPrescriptionRepository';
import { Prescriptions } from '../../../repositories/prescriptionRepository';
import { ProgrammingPlans } from '../../../repositories/programmingPlanRepository';

const bovin = genPrescription({
  id: '1ac599c4-1241-445e-a4eb-09d353810e10',
  programmingPlanId: PFASValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01QX',
  stages: ['STADE10']
});
const caprin = genPrescription({
  id: '2f133d43-c18d-4c15-bb78-22afa128ccfc',
  programmingPlanId: PFASValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01RL',
  stages: ['STADE10']
});
const ovin = genPrescription({
  id: 'f3949b9e-1722-4e53-b4c1-758916560817',
  programmingPlanId: PFASValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01RJ',
  stages: ['STADE10']
});
const porcin = genPrescription({
  id: 'a9229604-17ed-445b-b791-5e460abc5ccb',
  programmingPlanId: PFASValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01RG',
  stages: ['STADE10']
});
const volaille = genPrescription({
  id: '3489e7d2-fd2d-4a66-873d-cab4dc81b89a',
  programmingPlanId: PFASValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PFAS_MEAT',
  context: 'Control',
  matrixKind: 'A01SN',
  stages: ['STADE10']
});
const oeufs = genPrescription({
  id: '7a6a847e-f2d1-472d-a7c9-9ad56e65e295',
  programmingPlanId: PFASValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PFAS_EGGS',
  context: 'Control',
  matrixKind: 'A031E',
  stages: ['STADE11', 'STADE12']
});

export const seed = async function () {
  const validatedProgrammingPlan = await ProgrammingPlans()
    .where({ id: PFASValidatedProgrammingPlanFixture.id })
    .first();

  if (!validatedProgrammingPlan) {
    return;
  }

  await Prescriptions().insert([bovin, caprin, ovin, porcin, volaille, oeufs]);

  await LocalPrescriptions().insert([
    ...genLocalPrescriptions(
      bovin.id,
      [3, 2, 5, 0, 0, 1, 2, 0, 3, 3, 2, 0, 4, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      caprin.id,
      [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      ovin.id,
      [1, 1, 2, 0, 0, 1, 0, 1, 6, 0, 6, 3, 2, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      porcin.id,
      [2, 0, 14, 1, 0, 0, 1, 0, 2, 0, 1, 0, 2, 0, 0, 0, 1, 0]
    ),
    ...genLocalPrescriptions(
      volaille.id,
      [2, 3, 8, 1, 0, 1, 0, 0, 2, 1, 1, 0, 6, 0, 0, 0, 0, 0]
    ),
    ...genLocalPrescriptions(
      oeufs.id,
      [12, 2, 54, 3, 0, 10, 15, 3, 11, 6, 4, 1, 27, 1, 0, 0, 1, 0]
    )
  ]);
};
