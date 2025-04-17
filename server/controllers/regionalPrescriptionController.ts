import { Request, Response } from 'express';
import {
  AuthenticatedRequest,
  PrescriptionRequest,
  RegionalPrescriptionRequest
} from 'express-jwt';
import { constants } from 'http2';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { FindRegionalPrescriptionOptions } from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  hasRegionalPrescriptionPermission,
  RegionalPrescriptionKey,
  RegionalPrescriptionUpdate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import {
  RegionalPrescriptionComment,
  RegionalPrescriptionCommentToCreate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { hasNationalRole } from 'maestro-shared/schema/User/User';
import { isDefined } from 'maestro-shared/utils/utils';
import { v4 as uuidv4 } from 'uuid';
import regionalPrescriptionCommentRepository from '../repositories/regionalPrescriptionCommentRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
import { userRepository } from '../repositories/userRepository';
import { notificationService } from '../services/notificationService';
const findRegionalPrescriptions = async (
  request: Request,
  response: Response
) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = request.query as FindRegionalPrescriptionOptions;

  const findOptions = {
    ...queryFindOptions,
    region: hasNationalRole(user) ? queryFindOptions.region : user.region
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
    user.role === 'NationalCoordinator'
      ? {
          region: regionalPrescription.region,
          role: 'RegionalCoordinator'
        }
      : {
          role: 'NationalCoordinator'
        }
  );

  await notificationService.sendNotification(
    {
      category: prescription.context,
      message: `Nouveau commentaire sur la matrice **${MatrixKindLabels[prescription.matrixKind].toLowerCase()}**`,
      author: user,
      link: `/prescriptions/${programmingPlan.year}?context=${prescription.context}&prescriptionId=${prescription.id}&commentsRegion=${regionalPrescription.region}`
    },
    recipients,
    {
      matrix: MatrixKindLabels[prescription.matrixKind as MatrixKind],
      sampleCount: regionalPrescription.sampleCount,
      comment: draftPrescriptionComment.comment,
      author: user ? `${user.firstName} ${user.lastName}` : 'Anonyme'
    }
  );

  response.status(constants.HTTP_STATUS_CREATED).send(prescriptionComment);
};

export default {
  findRegionalPrescriptions,
  updateRegionalPrescription,
  commentRegionalPrescription
};
