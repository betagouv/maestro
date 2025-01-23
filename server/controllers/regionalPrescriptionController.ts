import { Request, Response } from 'express';
import {
  AuthenticatedRequest,
  PrescriptionRequest,
  RegionalPrescriptionRequest
} from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import { MatrixLabels } from '../../shared/referential/Matrix/MatrixLabels';
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
import { isDefined } from '../../shared/utils/utils';
import regionalPrescriptionCommentRepository from '../repositories/regionalPrescriptionCommentRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
import { userRepository } from '../repositories/userRepository';
import { mailService } from '../services/mailService';
import config from '../utils/config';
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
  const { programmingPlan } = request as PrescriptionRequest;
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
      canUpdateSampleCount && isDefined(regionalPrescriptionUpdate.sampleCount)
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
  const { prescription, programmingPlan } = request as PrescriptionRequest;
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

  const recipients = await userRepository.findMany(
    user.roles.includes('NationalCoordinator')
      ? {
          region: regionalPrescription.region,
          role: 'RegionalCoordinator'
        }
      : {
          role: 'NationalCoordinator'
        }
  );

  await mailService.sendNewRegionalPrescriptionComment({
    recipients: [
      ...recipients.map((recipient) => recipient.email),
      config.mail.from
    ],
    params: {
      matrix: MatrixLabels[prescription?.matrix],
      sampleCount: regionalPrescription.sampleCount,
      comment: draftPrescriptionComment.comment,
      author: `${user.firstName} ${user.lastName}`
    }
  });

  response.status(constants.HTTP_STATUS_CREATED).send(prescriptionComment);
};

export default {
  findRegionalPrescriptions,
  updateRegionalPrescription,
  commentRegionalPrescription
};
