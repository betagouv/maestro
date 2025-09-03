import { NextFunction, Request, Response } from 'express';
import RegionalPrescriptionMissingError from 'maestro-shared/errors/regionalPrescriptionPlanMissingError';
import regionalPrescriptionRepository from '../../repositories/regionalPrescriptionRepository';

export const regionalPrescriptionCheck =
  () => async (request: Request, _response: Response, next: NextFunction) => {
    const regionalPrescriptionId = request.params.regionalPrescriptionId;

    const regionalPrescription =
      await regionalPrescriptionRepository.findUnique(regionalPrescriptionId);

    if (!regionalPrescription) {
      throw new RegionalPrescriptionMissingError(regionalPrescriptionId);
    }

    request.regionalPrescription = regionalPrescription;

    next();
  };
