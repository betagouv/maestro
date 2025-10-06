import { constants } from 'http2';
import { isNil } from 'lodash-es';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { hasLocalPrescriptionPermission } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { hasNationalRole } from 'maestro-shared/schema/User/User';
import { isDefined } from 'maestro-shared/utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { getAndCheckLocalPrescription } from '../middlewares/checks/localPrescriptionCheck';
import { getAndCheckPrescription } from '../middlewares/checks/prescriptionCheck';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import localPrescriptionCommentRepository from '../repositories/localPrescriptionCommentRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import { userRepository } from '../repositories/userRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import { notificationService } from '../services/notificationService';

export const localPrescriptionsRouter = {
  '/prescriptions/regions': {
    get: async ({ query: queryFindOptions, user }) => {
      const region = hasNationalRole(user)
        ? queryFindOptions.region
        : user.region;

      const findOptions = {
        ...queryFindOptions,
        region
      };

      console.info('Find local prescriptions', user.id, findOptions);

      const localPrescriptions =
        await localPrescriptionRepository.findMany(findOptions);

      const filterEmptyLocalPrescriptions = region
        ? localPrescriptions.filter((localPrescription) =>
            isNil(localPrescription.department)
              ? localPrescription.sampleCount > 0
              : localPrescriptions.some(
                  (_) =>
                    _.region === localPrescription.region &&
                    isNil(_.department) &&
                    _.sampleCount > 0
                )
          )
        : localPrescriptions;

      return {
        status: constants.HTTP_STATUS_OK,
        response: filterEmptyLocalPrescriptions
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region': {
    put: async ({ user, body: localPrescriptionUpdate }, params) => {
      console.info(
        'Update local prescription',
        params.prescriptionId,
        params.region
      );

      const programmingPlan = await getAndCheckProgrammingPlan(
        localPrescriptionUpdate.programmingPlanId
      );
      await getAndCheckPrescription(params.prescriptionId, programmingPlan);
      const localPrescription = await getAndCheckLocalPrescription(params);

      const canUpdateSampleCount = hasLocalPrescriptionPermission(
        user,
        programmingPlan,
        localPrescription
      ).updateSampleCount;

      const canUpdateLaboratory = hasLocalPrescriptionPermission(
        user,
        programmingPlan,
        localPrescription
      ).updateLaboratory;

      if (!canUpdateSampleCount && !canUpdateLaboratory) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedLocalPrescription = {
        ...localPrescription,
        sampleCount:
          canUpdateSampleCount && isDefined(localPrescriptionUpdate.sampleCount)
            ? localPrescriptionUpdate.sampleCount
            : localPrescription.sampleCount,
        laboratoryId: canUpdateLaboratory
          ? localPrescriptionUpdate.laboratoryId
          : localPrescription.laboratoryId
      };

      await localPrescriptionRepository.update(updatedLocalPrescription);
      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedLocalPrescription
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department': {
    put: async ({ user, body: localPrescriptionUpdate }, params) => {
      console.info(
        'Update local prescription for department',
        params.prescriptionId,
        params.region,
        params.department
      );

      const programmingPlan = await getAndCheckProgrammingPlan(
        localPrescriptionUpdate.programmingPlanId
      );
      await getAndCheckPrescription(params.prescriptionId, programmingPlan);
      const localPrescription = await getAndCheckLocalPrescription(params);

      // TODO: check department belongs to user region?

      const canDistributeToDepartments = hasLocalPrescriptionPermission(
        user,
        programmingPlan,
        localPrescription
      ).distributeToDepartments;

      const canUpdateLaboratory = hasLocalPrescriptionPermission(
        user,
        programmingPlan,
        localPrescription
      ).updateLaboratory;

      if (!canDistributeToDepartments && !canUpdateLaboratory) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedLocalPrescription = {
        ...localPrescription,
        sampleCount:
          canDistributeToDepartments &&
          isDefined(localPrescriptionUpdate.sampleCount)
            ? localPrescriptionUpdate.sampleCount
            : localPrescription.sampleCount,
        laboratoryId: canUpdateLaboratory
          ? localPrescriptionUpdate.laboratoryId
          : localPrescription.laboratoryId
      };

      await localPrescriptionRepository.update(updatedLocalPrescription);
      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedLocalPrescription
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/comments': {
    post: async ({ user, body: draftPrescriptionComment }, params) => {
      console.info('Comment local prescription');

      const programmingPlan = await getAndCheckProgrammingPlan(
        draftPrescriptionComment.programmingPlanId
      );
      const { prescription } = await getAndCheckPrescription(
        params.prescriptionId,
        programmingPlan
      );
      const localPrescription = await getAndCheckLocalPrescription(params);

      const canComment = hasLocalPrescriptionPermission(
        user,
        programmingPlan,
        localPrescription
      ).comment;

      if (!canComment) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const prescriptionComment: LocalPrescriptionComment = {
        id: uuidv4(),
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        comment: draftPrescriptionComment.comment,
        createdAt: new Date(),
        createdBy: user.id
      };

      await localPrescriptionCommentRepository.insert(prescriptionComment);

      const recipients = await userRepository.findMany(
        user.role === 'NationalCoordinator'
          ? {
              region: localPrescription.region,
              roles: ['LocalCoordinator']
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
            commentsRegion: localPrescription.region
          }).toString()}`
        },
        recipients,
        {
          matrix: MatrixKindLabels[prescription.matrixKind as MatrixKind],
          sampleCount: localPrescription.sampleCount,
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
