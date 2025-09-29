import { constants } from 'http2';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { hasRegionalPrescriptionPermission } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionComment } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { hasNationalRole } from 'maestro-shared/schema/User/User';
import { isDefined } from 'maestro-shared/utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { getAndCheckPrescription } from '../middlewares/checks/prescriptionCheck';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import { getAndCheckRegionalPrescription } from '../middlewares/checks/regionalPrescriptionCheck';
import regionalPrescriptionCommentRepository from '../repositories/regionalPrescriptionCommentRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
import { userRepository } from '../repositories/userRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import { notificationService } from '../services/notificationService';

export const regionalPrescriptionsRouter = {
  '/prescriptions/regions': {
    get: async ({ query: queryFindOptions, user }) => {
      const findOptions = {
        ...queryFindOptions,
        region: hasNationalRole(user) ? queryFindOptions.region : user.region
      };

      console.info('Find regional prescriptions', user.id, findOptions);

      const regionalPrescriptions =
        await regionalPrescriptionRepository.findMany(findOptions);

      return {
        status: constants.HTTP_STATUS_OK,
        response: regionalPrescriptions
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region': {
    put: async ({ user, body: regionalPrescriptionUpdate }, params) => {
      console.info(
        'Update regional prescription',
        params.prescriptionId,
        params.region
      );

      const programmingPlan = await getAndCheckProgrammingPlan(
        regionalPrescriptionUpdate.programmingPlanId
      );
      await getAndCheckPrescription(params.prescriptionId, programmingPlan);
      const regionalPrescription =
        await getAndCheckRegionalPrescription(params);

      const canDistributeToRegions = hasRegionalPrescriptionPermission(
        user,
        programmingPlan,
        regionalPrescription
      ).distributeToRegions;

      const canUpdateLaboratory = hasRegionalPrescriptionPermission(
        user,
        programmingPlan,
        regionalPrescription
      ).updateLaboratory;

      if (!canDistributeToRegions && !canUpdateLaboratory) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedRegionalPrescription = {
        ...regionalPrescription,
        sampleCount:
          canDistributeToRegions &&
          isDefined(regionalPrescriptionUpdate.sampleCount)
            ? regionalPrescriptionUpdate.sampleCount
            : regionalPrescription.sampleCount,
        laboratoryId: canUpdateLaboratory
          ? regionalPrescriptionUpdate.laboratoryId
          : regionalPrescription.laboratoryId
      };

      await regionalPrescriptionRepository.update(updatedRegionalPrescription);
      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedRegionalPrescription
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department': {
    put: async ({ user, body: regionalPrescriptionUpdate }, params) => {
      console.info(
        'Update regional prescription for department',
        params.prescriptionId,
        params.region,
        params.department
      );

      const programmingPlan = await getAndCheckProgrammingPlan(
        regionalPrescriptionUpdate.programmingPlanId
      );
      await getAndCheckPrescription(params.prescriptionId, programmingPlan);
      const regionalPrescription =
        await getAndCheckRegionalPrescription(params);

      // TODO: check department belongs to user region?

      const canDistributeToDepartments = hasRegionalPrescriptionPermission(
        user,
        programmingPlan,
        regionalPrescription
      ).distributeToDepartments;

      const canUpdateLaboratory = hasRegionalPrescriptionPermission(
        user,
        programmingPlan,
        regionalPrescription
      ).updateLaboratory;

      if (!canDistributeToDepartments && !canUpdateLaboratory) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedRegionalPrescription = {
        ...regionalPrescription,
        sampleCount:
          canDistributeToDepartments &&
          isDefined(regionalPrescriptionUpdate.sampleCount)
            ? regionalPrescriptionUpdate.sampleCount
            : regionalPrescription.sampleCount,
        laboratoryId: canUpdateLaboratory
          ? regionalPrescriptionUpdate.laboratoryId
          : regionalPrescription.laboratoryId
      };

      await regionalPrescriptionRepository.update(updatedRegionalPrescription);
      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedRegionalPrescription
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/comments': {
    post: async ({ user, body: draftPrescriptionComment }, params) => {
      console.info('Comment regional prescription');

      const programmingPlan = await getAndCheckProgrammingPlan(
        draftPrescriptionComment.programmingPlanId
      );
      const { prescription } = await getAndCheckPrescription(
        params.prescriptionId,
        programmingPlan
      );
      const regionalPrescription =
        await getAndCheckRegionalPrescription(params);

      const canComment = hasRegionalPrescriptionPermission(
        user,
        programmingPlan,
        regionalPrescription
      ).comment;

      if (!canComment) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
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
              roles: ['RegionalCoordinator']
            }
          : {
              roles: ['NationalCoordinator']
            }
      );

      await notificationService.sendNotification(
        {
          category: prescription.context,
          author: user,
          link: `${AppRouteLinks.ProgrammingRoute.link}?${new URLSearchParams({
            year: programmingPlan.year.toString(),
            context: prescription.context,
            prescriptionId: prescription.id,
            commentsRegion: regionalPrescription.region
          }).toString()}`
        },
        recipients,
        {
          matrix: MatrixKindLabels[prescription.matrixKind as MatrixKind],
          sampleCount: regionalPrescription.sampleCount,
          comment: draftPrescriptionComment.comment,
          author: user ? `${user.name}` : 'Anonyme'
        }
      );

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: prescriptionComment
      };
    }
  }
} as const satisfies ProtectedSubRouter;
