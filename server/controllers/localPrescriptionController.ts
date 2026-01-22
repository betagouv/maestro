import { constants } from 'http2';
import { isNil } from 'lodash-es';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { hasLocalPrescriptionPermission } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { LocalPrescriptionKey } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import { companiesIsRequired } from 'maestro-shared/schema/User/User';
import {
  isNationalRole,
  isRegionalRole
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
    get: async ({ userRole, query: queryFindOptions, user }) => {
      const region = isNationalRole(userRole)
        ? queryFindOptions.region
        : user.region;

      const department = isRegionalRole(userRole)
        ? queryFindOptions.department
        : user.department;

      const companySirets = companiesIsRequired(user)
        ? user.companies.map((company) => company.siret)
        : queryFindOptions.companySirets;

      const findOptions = {
        ...queryFindOptions,
        region,
        department,
        companySirets
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
          if (isNil(companySirets)) {
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
    put: async ({ user, userRole, body: localPrescriptionUpdate }, params) => {
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
        hasLocalPrescriptionPermission(
          user,
          userRole,
          programmingPlan,
          localPrescription
        ).updateSampleCount && localPrescriptionUpdate.key === 'sampleCount';

      const canUpdateLaboratories =
        hasLocalPrescriptionPermission(
          user,
          userRole,
          programmingPlan,
          localPrescription
        ).updateLaboratories && localPrescriptionUpdate.key === 'laboratories';

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
    put: async ({ user, userRole, body: localPrescriptionUpdate }, params) => {
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
        hasLocalPrescriptionPermission(
          user,
          userRole,
          programmingPlan,
          localPrescription
        ).distributeToDepartments &&
        localPrescriptionUpdate.key === 'sampleCount';

      const canUpdateLaboratories =
        hasLocalPrescriptionPermission(
          user,
          userRole,
          programmingPlan,
          localPrescription
        ).updateLaboratories && localPrescriptionUpdate.key === 'laboratories';

      const canDistributePrescriptionToSlaughterhouses =
        hasLocalPrescriptionPermission(
          user,
          userRole,
          programmingPlan,
          localPrescription
        ).distributeToSlaughterhouses &&
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
    post: async (
      { user, userRole, body: draftPrescriptionComment },
      params
    ) => {
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
        userRole,
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
        userRole === 'NationalCoordinator'
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
          matrix: getPrescriptionTitle(prescription),
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
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department/comments':
    {
      post: async (
        { user, userRole, body: draftPrescriptionComment },
        params
      ) => {
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
          userRole,
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
          department: localPrescription.department,
          comment: draftPrescriptionComment.comment,
          createdAt: new Date(),
          createdBy: user.id
        };

        await localPrescriptionCommentRepository.insert(prescriptionComment);

        const recipients = await userRepository.findMany(
          userRole === 'RegionalCoordinator'
            ? {
                region: localPrescription.region,
                department: localPrescription.department,
                roles: ['DepartmentalCoordinator']
              }
            : {
                roles: ['RegionalCoordinator'],
                region: localPrescription.region
              }
        );

        await notificationService.sendNotification(
          {
            category: prescription.context,
            author: user,
            link: `${AppRouteLinks.ProgrammingRoute.link}?${new URLSearchParams(
              {
                year: programmingPlan.year.toString(),
                context: prescription.context,
                prescriptionId: prescription.id,
                commentsRegion: localPrescription.region
              }
            ).toString()}`
          },
          recipients,
          {
            matrix: getPrescriptionTitle(prescription),
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
