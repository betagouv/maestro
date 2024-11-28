import { NextFunction, Request, Response } from 'express';
import { ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import PrescriptionMissingError from '../../../shared/errors/prescriptionPlanMissingError';
import RegionalPrescriptionMissingError from '../../../shared/errors/regionalPrescriptionPlanMissingError';
import { RegionalPrescriptionKey } from '../../../shared/schema/RegionalPrescription/RegionalPrescription';
import prescriptionRepository from '../../repositories/prescriptionRepository';
import regionalPrescriptionRepository from '../../repositories/regionalPrescriptionRepository';

export const regionalPrescriptionCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const { region, prescriptionId } =
      request.params as RegionalPrescriptionKey;
    const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;

    const regionalPrescription =
      await regionalPrescriptionRepository.findUnique({
        prescriptionId,
        region
      });

    if (!regionalPrescription) {
      throw new RegionalPrescriptionMissingError(prescriptionId, region);
    }

    const prescription = await prescriptionRepository.findUnique(
      regionalPrescription.prescriptionId
    );

    if (!prescription) {
      throw new PrescriptionMissingError(regionalPrescription.prescriptionId);
    }

    if (prescription.programmingPlanId !== programmingPlan.id) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    request.regionalPrescription = regionalPrescription;

    next();
  };
