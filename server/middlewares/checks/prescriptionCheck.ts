import { NextFunction, Request, Response } from 'express';
import { ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import PrescriptionMissingError from 'maestro-shared/errors/prescriptionPlanMissingError';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import prescriptionRepository from '../../repositories/prescriptionRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';

export const prescriptionCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const prescriptionId = request.params.prescriptionId;

    const prescription =
      await prescriptionRepository.findUnique(prescriptionId);

    if (!prescription) {
      throw new PrescriptionMissingError(prescriptionId);
    }
    const programmingPlan =
      (request as ProgrammingPlanRequest).programmingPlan ??
      (await programmingPlanRepository.findUnique(
        prescription.programmingPlanId
      ));

    if (!programmingPlan) {
      throw new ProgrammingPlanMissingError(prescription.programmingPlanId);
    }

    if (prescription.programmingPlanId !== programmingPlan.id) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    request.prescription = prescription;
    request.programmingPlan = programmingPlan;

    next();
  };
