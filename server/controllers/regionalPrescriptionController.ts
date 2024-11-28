import { Request, Response } from 'express';
import {
  AuthenticatedRequest,
  ProgrammingPlanRequest,
  RegionalPrescriptionRequest
} from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  hasRegionalPrescriptionPermission,
  RegionalPrescriptionKey,
  RegionalPrescriptionUpdate
} from '../../shared/schema/RegionalPrescription/RegionalPrescription';
import {
  RegionalPrescriptionComment,
  RegionalPrescriptionCommentToCreate
} from '../../shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import regionalPrescriptionCommentRepository from '../repositories/regionalPrescriptionCommentRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
const findRegionalPrescriptions = async (
  request: Request,
  response: Response
) => {
  const { user } = request as AuthenticatedRequest;
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
  const { user } = request as AuthenticatedRequest;
  const { regionalPrescription } = request as RegionalPrescriptionRequest;
  const { programmingPlan } = request as ProgrammingPlanRequest;
  const { region, prescriptionId } = request.params as RegionalPrescriptionKey;
  const regionalPrescriptionUpdate = request.body as RegionalPrescriptionUpdate;

  console.info('Update regional prescription', prescriptionId, region);

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
  const { user } = request as AuthenticatedRequest;
  const { regionalPrescription } = request as RegionalPrescriptionRequest;
  const { programmingPlan } = request as ProgrammingPlanRequest;
  const draftPrescriptionComment =
    request.body as RegionalPrescriptionCommentToCreate;

  console.info(
    'Comment regional prescription',
    RegionalPrescriptionKey.parse(regionalPrescription)
  );

  const canComment = hasRegionalPrescriptionPermission(
    user,
    programmingPlan,
    regionalPrescription
  ).comment;

  if (!canComment) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const prescriptionComment: RegionalPrescriptionComment = {
    id: uuidv4(),
    prescriptionId: regionalPrescription.prescriptionId,
    region: regionalPrescription.region,
    comment: draftPrescriptionComment.comment,
    createdAt: new Date(),
    createdBy: user.id
  };

  await regionalPrescriptionCommentRepository.insert(prescriptionComment);

  response.status(constants.HTTP_STATUS_CREATED).send(prescriptionComment);
};

export default {
  findRegionalPrescriptions,
  updateRegionalPrescription,
  commentRegionalPrescription
};
