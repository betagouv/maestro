import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import PrescriptionMissingError from '../../shared/errors/prescriptionPlanMissingError';
import RegionalPrescriptionMissingError from '../../shared/errors/regionalPrescriptionPlanMissingError';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescriptionUpdate } from '../../shared/schema/RegionalPrescription/RegionalPrescription';
import { hasPermission } from '../../shared/schema/User/User';
import prescriptionRepository from '../repositories/prescriptionRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
const findRegionalPrescriptions = async (
  request: Request,
  response: Response
) => {
  const user = (request as AuthenticatedRequest).user;
  const queryFindOptions = request.query as FindRegionalPrescriptionOptions;

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region,
  };

  console.info('Find regional prescriptions', user.id, findOptions);

  const regionalPrescriptions = await regionalPrescriptionRepository.findMany(
    findOptions
  );

  response.status(constants.HTTP_STATUS_OK).send(regionalPrescriptions);
};

const updateRegionalPrescription = async (
  request: Request,
  response: Response
) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const { regionalPrescriptionId } = request.params;
  const regionalPrescriptionUpdate = request.body as RegionalPrescriptionUpdate;

  console.info('Update regional prescription with id', regionalPrescriptionId);

  const regionalPrescription = await regionalPrescriptionRepository.findUnique(
    regionalPrescriptionId
  );

  if (!regionalPrescription) {
    throw new RegionalPrescriptionMissingError(regionalPrescriptionId);
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

  const updatedRegionalPrescription = {
    ...regionalPrescription,
    sampleCount:
      hasPermission(user, 'updatePrescription') &&
      regionalPrescriptionUpdate.sampleCount !== undefined
        ? regionalPrescriptionUpdate.sampleCount
        : regionalPrescription.sampleCount,
    laboratoryId: hasPermission(user, 'updatePrescriptionLaboratory')
      ? regionalPrescriptionUpdate.laboratoryId
      : regionalPrescription.laboratoryId,
  };

  await regionalPrescriptionRepository.update(updatedRegionalPrescription);

  response.status(constants.HTTP_STATUS_OK).send(updatedRegionalPrescription);
};

export default {
  findRegionalPrescriptions,
  updateRegionalPrescription,
};
