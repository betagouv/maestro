import { constants } from 'node:http2';
import { HttpError } from 'maestro-shared/errors/httpError';
import PrescriptionMissingError from 'maestro-shared/errors/prescriptionPlanMissingError';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import prescriptionRepository from '../../repositories/prescriptionRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';

export const getAndCheckPrescription = async (
  prescriptionId: string,
  currentProgrammingPlan: ProgrammingPlanChecked | undefined
): Promise<{
  prescription: Prescription;
  programmingPlan: ProgrammingPlanChecked;
}> => {
  const prescription = await prescriptionRepository.findUnique(prescriptionId);

  if (!prescription) {
    throw new PrescriptionMissingError(prescriptionId);
  }
  const programmingPlan =
    currentProgrammingPlan ??
    (
      await programmingPlanRepository.findMany({
        subPlanIds: [prescription.programmingSubPlanId]
      })
    )[0];

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(prescription.programmingSubPlanId);
  }

  if (
    !programmingPlan.subPlans.some(
      (subPlan) => subPlan.id === prescription.programmingSubPlanId
    )
  ) {
    throw new HttpError({
      status: constants.HTTP_STATUS_FORBIDDEN,
      message: 'Bad programming plan',
      name: 'BadProgrammingPlanError'
    });
  }

  return { prescription, programmingPlan };
};
