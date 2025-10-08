import { constants } from 'http2';
import { isNil } from 'lodash-es';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { hasLocalPrescriptionPermission } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import {
  hasNationalRole,
  hasRegionalRole
} from 'maestro-shared/schema/User/User';
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

      const department = hasRegionalRole(user)
        ? queryFindOptions.department
        : user.department;

      const findOptions = {
        ...queryFindOptions,
        region
      };

      console.info('Find local prescriptions', user.id, findOptions);

      const localPrescriptions =
        await localPrescriptionRepository.findMany(findOptions);

      console.log('Found local prescriptions', localPrescriptions.length);

      const filterEmptyLocalPrescriptions = localPrescriptions.filter(
        (localPrescription) => {
          if (isNil(region)) {
            return true;
          }
          if (isNil(department)) {
            return isNil(localPrescription.department)
              ? localPrescription.sampleCount > 0
              : localPrescriptions.some(
                  (_) =>
                    _.region === localPrescription.region &&
                    isNil(_.department) &&
                    _.sampleCount > 0
                );
          }
          return isNil(localPrescription.companySiret)
            ? localPrescription.sampleCount > 0
            : localPrescriptions.some(
                (_) =>
                  _.region === localPrescription.region &&
                  _.department === localPrescription.department &&
                  isNil(_.companySiret) &&
                  _.sampleCount > 0
              );
        }
      );

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

      const canUpdateSampleCount =
        hasLocalPrescriptionPermission(user, programmingPlan, localPrescription)
          .updateSampleCount && localPrescriptionUpdate.key === 'sampleCount';

      const canUpdateLaboratory =
        hasLocalPrescriptionPermission(user, programmingPlan, localPrescription)
          .updateLaboratory && localPrescriptionUpdate.key === 'laboratory';

      if (!canUpdateSampleCount && !canUpdateLaboratory) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedLocalPrescription = {
        ...localPrescription,
        sampleCount: canUpdateSampleCount
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

      const canDistributeToDepartments =
        hasLocalPrescriptionPermission(user, programmingPlan, localPrescription)
          .distributeToDepartments &&
        localPrescriptionUpdate.key === 'sampleCount';

      if (!canDistributeToDepartments) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedLocalPrescription = {
        ...localPrescription,
        sampleCount: localPrescriptionUpdate.sampleCount
      };

      await localPrescriptionRepository.update(updatedLocalPrescription);
      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedLocalPrescription
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department/slaughterhouses':
    {
      put: async ({ user, body: localPrescriptionUpdate }, params) => {
        console.info(
          'Update slaughterhouse prescriptions for department',
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

        const canDistributePrescriptionToSlaughterhouses =
          hasLocalPrescriptionPermission(
            user,
            programmingPlan,
            localPrescription
          ).distributeToSlaughterhouses &&
          localPrescriptionUpdate.key === 'slaughterhouseSampleCounts';

        if (
          isNil(localPrescription.department) ||
          !canDistributePrescriptionToSlaughterhouses
        ) {
          return { status: constants.HTTP_STATUS_FORBIDDEN };
        }

        const updatedSubLocalPrescriptions =
          localPrescriptionUpdate.slaughterhouseSampleCounts.map(
            (slaughterhouse) => ({
              prescriptionId: localPrescription.prescriptionId,
              region: localPrescription.region,
              department: localPrescription.department,
              companySiret: slaughterhouse.companySiret,
              sampleCount: slaughterhouse.sampleCount
            })
          );

        await localPrescriptionRepository.updateMany(
          localPrescription as Omit<
            Required<LocalPrescriptionKey>,
            'companySiret'
          >,
          updatedSubLocalPrescriptions
        );

        return {
          status: constants.HTTP_STATUS_OK,
          response: localPrescription
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
