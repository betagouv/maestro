import { NextFunction, Request, Response } from 'express';
import { ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import PrescriptionMissingError from '../../../shared/errors/prescriptionPlanMissingError';
import prescriptionRepository from '../../repositories/prescriptionRepository';

export const prescriptionCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const prescriptionId = request.params.prescriptionId;
    const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;

    const prescription =
      await prescriptionRepository.findUnique(prescriptionId);

    if (!prescription) {
      throw new PrescriptionMissingError(prescriptionId);
    }

    if (prescription.programmingPlanId !== programmingPlan.id) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    request.prescription = prescription;

    next();
  };
