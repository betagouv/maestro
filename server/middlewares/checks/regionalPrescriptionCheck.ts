import { NextFunction, Request, Response } from 'express';
import RegionalPrescriptionMissingError from '../../../shared/errors/regionalPrescriptionPlanMissingError';
import { RegionalPrescriptionKey } from '../../../shared/schema/RegionalPrescription/RegionalPrescription';
import regionalPrescriptionRepository from '../../repositories/regionalPrescriptionRepository';

export const regionalPrescriptionCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const { region, prescriptionId } =
      request.params as RegionalPrescriptionKey;

    const regionalPrescription =
      await regionalPrescriptionRepository.findUnique({
        prescriptionId,
        region
      });

    if (!regionalPrescription) {
      throw new RegionalPrescriptionMissingError(prescriptionId, region);
    }

    request.regionalPrescription = regionalPrescription;

    next();
  };
