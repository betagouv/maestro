import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import PrescriptionMissingError from '../../shared/errors/prescriptionPlanMissingError';
import RegionalPrescriptionMissingError from '../../shared/errors/regionalPrescriptionPlanMissingError';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  hasRegionalPrescriptionPermission,
  RegionalPrescriptionKey,
  RegionalPrescriptionUpdate
} from '../../shared/schema/RegionalPrescription/RegionalPrescription';
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
    region: user.region ?? queryFindOptions.region
  };

  console.info('Find regional prescriptions', user.id, findOptions);

  const regionalPrescriptions =
    await regionalPrescriptionRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(regionalPrescriptions);
};

const updateRegionalPrescription = async (
  request: Request,
  response: Response
) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const { region, prescriptionId } = request.params as RegionalPrescriptionKey;
  const regionalPrescriptionUpdate = request.body as RegionalPrescriptionUpdate;

  console.info('Update regional prescription', prescriptionId, region);

  const regionalPrescription = await regionalPrescriptionRepository.findUnique({
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

  const canUpdateSampleCount = hasRegionalPrescriptionPermission(
    user,
    programmingPlan,
    regionalPrescription
  ).updateSampleCount;

  const canUpdateLaboratory = hasRegionalPrescriptionPermission(
    user,
    programmingPlan,
    regionalPrescription
  ).updateLaboratory;

  if (!canUpdateSampleCount && !canUpdateLaboratory) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedRegionalPrescription = {
    ...regionalPrescription,
    sampleCount:
      canUpdateSampleCount && regionalPrescriptionUpdate.sampleCount
        ? regionalPrescriptionUpdate.sampleCount
        : regionalPrescription.sampleCount,
    laboratoryId: canUpdateLaboratory
      ? regionalPrescriptionUpdate.laboratoryId
      : regionalPrescription.laboratoryId
  };

  await regionalPrescriptionRepository.update(updatedRegionalPrescription);

  response.status(constants.HTTP_STATUS_OK).send(updatedRegionalPrescription);
};

const commentRegionalPrescription = async (
  request: Request,
  response: Response
) => {
  // const { user } = request as AuthenticatedRequest;
  // const draftPrescriptionComment = request.body as PrescriptionCommentToCreate;
  // const prescriptionId = request.params.prescriptionId;
  //
  // const prescription = await prescriptionRepository.findUnique(prescriptionId);
  //
  // if (!prescription) {
  //   throw new PrescriptionMissingError(prescriptionId);
  // }
  // console.info(
  //   'Comment prescription with id',
  //   userRegions(user),
  //   prescription.region
  // );
  //
  // if (!userRegions(user).includes(prescription.region)) {
  //   return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  // }
  //
  // const prescriptionComment: PrescriptionComment = {
  //   id: uuidv4(),
  //   prescriptionId,
  //   comment: draftPrescriptionComment.comment,
  //   createdAt: new Date(),
  //   createdBy: user.id,
  // };
  //
  // await prescriptionCommentRepository.insert(prescriptionComment);

  response.status(constants.HTTP_STATUS_CREATED); //.send(prescriptionComment);
};

export default {
  findRegionalPrescriptions,
  updateRegionalPrescription,
  commentRegionalPrescription
};
