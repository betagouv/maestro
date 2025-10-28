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
} from 'maestro-shared/schema/User/UserRole';
import { v4 as uuidv4 } from 'uuid';
import { getAndCheckLocalPrescription } from '../middlewares/checks/localPrescriptionCheck';
import { getAndCheckPrescription } from '../middlewares/checks/prescriptionCheck';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import localPrescriptionCommentRepository from '../repositories/localPrescriptionCommentRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import localPrescriptionLaboratoryRepository from '../repositories/localPrescriptionSubstanceKindLaboratoryRepository';
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
        region,
        department
      };

      console.info('Find local prescriptions', user.id, findOptions);

      const localPrescriptions =
        await localPrescriptionRepository.findMany(findOptions);

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
          if (isNil(queryFindOptions.companySiret)) {
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
          return localPrescription.sampleCount > 0;
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

      const canUpdateLaboratories =
        hasLocalPrescriptionPermission(user, programmingPlan, localPrescription)
          .updateLaboratories && localPrescriptionUpdate.key === 'laboratories';

      if (!canUpdateSampleCount && !canUpdateLaboratories) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      if (canUpdateSampleCount) {
        await localPrescriptionRepository.update({
          ...localPrescription,
          sampleCount: localPrescriptionUpdate.sampleCount
        });
      }

      if (canUpdateLaboratories) {
        await localPrescriptionLaboratoryRepository.updateMany(
          localPrescription,
          localPrescriptionUpdate.substanceKindsLaboratories
        );
      }

      const updatedLocalPrescription =
        await localPrescriptionRepository.findUnique(params);

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
        params.department,
        localPrescriptionUpdate
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

      const canUpdateLaboratories =
        hasLocalPrescriptionPermission(user, programmingPlan, localPrescription)
          .updateLaboratories && localPrescriptionUpdate.key === 'laboratories';

      const canDistributePrescriptionToSlaughterhouses =
        hasLocalPrescriptionPermission(user, programmingPlan, localPrescription)
          .distributeToSlaughterhouses &&
        localPrescriptionUpdate.key === 'slaughterhouseSampleCounts';

      if (
        !canDistributeToDepartments &&
        !canUpdateLaboratories &&
        !canDistributePrescriptionToSlaughterhouses
      ) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      if (canDistributeToDepartments) {
        await localPrescriptionRepository.update({
          ...localPrescription,
          sampleCount: localPrescriptionUpdate.sampleCount
        });
      }

      if (canUpdateLaboratories) {
        await localPrescriptionLaboratoryRepository.updateMany(
          localPrescription,
          localPrescriptionUpdate.substanceKindsLaboratories
        );
      }

      if (canDistributePrescriptionToSlaughterhouses) {
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

        console.log(
          'updatedSubLocalPrescriptions',
          updatedSubLocalPrescriptions
        );

        await localPrescriptionRepository.updateMany(
          localPrescription as Omit<
            Required<LocalPrescriptionKey>,
            'companySiret'
          >,
          updatedSubLocalPrescriptions
        );
      }

      const updatedLocalPrescription =
        await localPrescriptionRepository.findUnique(params);

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
