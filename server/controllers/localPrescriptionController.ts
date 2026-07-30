import { isNil, uniq } from 'lodash-es';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import {
  hasLocalPrescriptionPermission,
  type LocalPrescription
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { getPrescriptionTitle } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanEchelon } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import {
  companiesIsRequired,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  editingEchelonForRole,
  isNationalRole,
  isRegionalRole
} from 'maestro-shared/schema/User/UserRole';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckLocalPrescription } from '../middlewares/checks/localPrescriptionCheck';
import { getAndCheckPrescription } from '../middlewares/checks/prescriptionCheck';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import localPrescriptionChangeRepository from '../repositories/localPrescriptionChangeRepository';
import localPrescriptionCommentRepository from '../repositories/localPrescriptionCommentRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { notificationService } from '../services/notificationService';

const localPrescriptionPendingKey = (row: {
  prescriptionId: string;
  region: string;
  department?: string | null;
  companySiret?: string | null;
}) =>
  [
    row.prescriptionId,
    row.region,
    row.department ?? 'None',
    row.companySiret ?? 'None'
  ].join(':');

const withPendingLocalPrescriptionChanges = async (
  localPrescriptions: LocalPrescription[],
  echelon: ProgrammingPlanEchelon
): Promise<LocalPrescription[]> => {
  const pendingRows = await localPrescriptionChangeRepository.findLatestPending(
    uniq(localPrescriptions.map((lp) => lp.prescriptionId)),
    echelon
  );
  const pendingByKey = new Map(
    pendingRows.map((row) => [
      `${localPrescriptionPendingKey(row)}:${row.kind}`,
      row
    ])
  );
  return localPrescriptions.map((localPrescription) => {
    const key = localPrescriptionPendingKey(localPrescription);
    const pendingSampleCount = pendingByKey.get(`${key}:sampleCount`);
    const pendingLaboratories = pendingByKey.get(`${key}:laboratories`);
    if (!pendingSampleCount && !pendingLaboratories) {
      return localPrescription;
    }
    return {
      ...localPrescription,
      sampleCount:
        pendingSampleCount?.sampleCount ?? localPrescription.sampleCount,
      substanceKindsLaboratories:
        pendingLaboratories?.substanceKindsLaboratories ??
        localPrescription.substanceKindsLaboratories
    };
  });
};

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

      const viewerEchelon = editingEchelonForRole(userRole);

      const liveLocalPrescriptions = await localPrescriptionRepository.findMany(
        findOptions,
        viewerEchelon ?? undefined
      );

      const localPrescriptions = viewerEchelon
        ? await withPendingLocalPrescriptionChanges(
            liveLocalPrescriptions,
            viewerEchelon
          )
        : liveLocalPrescriptions;

      const filterEmptyLocalPrescriptions = findOptions.allLevels
        ? localPrescriptions
        : localPrescriptions.filter((localPrescription) => {
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
          });

      return {
        status: HttpStatus.OK,
        response: filterEmptyLocalPrescriptions
      };
    }
  },
  '/prescriptions/regions/:region/changes-viewed': {
    put: async (
      { user, userRole, body: { prescriptionIds, department } },
      { region }
    ) => {
      if (!userRegionsForRole(user, userRole).includes(region)) {
        return { status: HttpStatus.FORBIDDEN };
      }

      await localPrescriptionChangeRepository.markManyViewed({
        region,
        department,
        prescriptionIds,
        viewedBy: user.id
      });

      return { status: HttpStatus.NO_CONTENT };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region': {
    get: async ({ userRole, query: { includes } }, params) => {
      console.info(
        'Get local prescription for region',
        params.prescriptionId,
        params.region
      );

      const localPrescription = await getAndCheckLocalPrescription({
        ...params,
        includes
      });

      const viewerEchelon = editingEchelonForRole(userRole);
      const response = viewerEchelon
        ? (
            await withPendingLocalPrescriptionChanges(
              [localPrescription],
              viewerEchelon
            )
          )[0]
        : localPrescription;

      return {
        status: HttpStatus.OK,
        response
      };
    },
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
        return { status: HttpStatus.FORBIDDEN };
      }

      if (canUpdateSampleCount) {
        await localPrescriptionChangeRepository.insert({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          echelon: 'National',
          kind: 'sampleCount',
          sampleCount: localPrescriptionUpdate.sampleCount,
          previousSampleCount: localPrescription.sampleCount,
          changedAt: new Date()
        });
      }

      if (canUpdateLaboratories) {
        await localPrescriptionChangeRepository.insert({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          echelon: editingEchelonForRole(userRole) as ProgrammingPlanEchelon,
          kind: 'laboratories',
          substanceKindsLaboratories:
            localPrescriptionUpdate.substanceKindsLaboratories,
          previousSampleCount: null,
          changedAt: new Date()
        });
        await localPrescriptionChangeRepository.markViewed({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          kind: 'laboratories',
          viewedBy: user.id
        });
      }

      if (canUpdateSampleCount || canUpdateLaboratories) {
        await programmingPlanRepository.touchLocalStatus(programmingPlan.id, {
          region: params.region
        });
      }

      const updatedLocalPrescription =
        await localPrescriptionRepository.findUnique(params);

      if (!updatedLocalPrescription) {
        throw new Error('Local prescription not found after update');
      }
      if (canUpdateSampleCount) {
        updatedLocalPrescription.sampleCount =
          localPrescriptionUpdate.sampleCount;
      }
      if (canUpdateLaboratories) {
        updatedLocalPrescription.substanceKindsLaboratories =
          localPrescriptionUpdate.substanceKindsLaboratories;
      }
      return {
        status: HttpStatus.OK,
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
        return { status: HttpStatus.FORBIDDEN };
      }

      if (canDistributeToDepartments) {
        await localPrescriptionChangeRepository.insert({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          department: params.department,
          echelon: 'Regional',
          kind: 'sampleCount',
          sampleCount: localPrescriptionUpdate.sampleCount,
          previousSampleCount: localPrescription.sampleCount,
          changedAt: new Date()
        });
      }

      if (canUpdateLaboratories) {
        await localPrescriptionChangeRepository.insert({
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          department: params.department,
          echelon: editingEchelonForRole(userRole) as ProgrammingPlanEchelon,
          kind: 'laboratories',
          substanceKindsLaboratories:
            localPrescriptionUpdate.substanceKindsLaboratories,
          previousSampleCount: null,
          changedAt: new Date()
        });
      }

      if (canDistributePrescriptionToSlaughterhouses) {
        const existingSubLocalPrescriptions =
          await localPrescriptionRepository.findMany({
            prescriptionId: localPrescription.prescriptionId,
            region: localPrescription.region,
            department: params.department,
            allLevels: true
          });
        const existingSampleCountByCompany = new Map(
          existingSubLocalPrescriptions
            .filter((_) => !isNil(_.companySiret))
            .map((_) => [_.companySiret, _.sampleCount])
        );

        await localPrescriptionChangeRepository.insertMany(
          localPrescriptionUpdate.slaughterhouseSampleCounts.map(
            (slaughterhouse) => ({
              prescriptionId: localPrescription.prescriptionId,
              region: localPrescription.region,
              department: params.department,
              companySiret: slaughterhouse.companySiret,
              echelon: 'Departmental',
              kind: 'sampleCount',
              sampleCount: slaughterhouse.sampleCount,
              previousSampleCount:
                existingSampleCountByCompany.get(slaughterhouse.companySiret) ??
                0,
              changedAt: new Date()
            })
          )
        );
      }

      if (
        canDistributeToDepartments ||
        canUpdateLaboratories ||
        canDistributePrescriptionToSlaughterhouses
      ) {
        await programmingPlanRepository.touchLocalStatus(programmingPlan.id, {
          region: params.region,
          department: params.department
        });
      }

      if (
        canDistributeToDepartments ||
        canDistributePrescriptionToSlaughterhouses
      ) {
        await localPrescriptionChangeRepository.markViewed({
          prescriptionId: params.prescriptionId,
          region: params.region,
          department: params.department,
          kind: 'sampleCount',
          viewedBy: user.id
        });
      }

      if (canUpdateLaboratories) {
        await localPrescriptionChangeRepository.markViewed({
          prescriptionId: params.prescriptionId,
          region: params.region,
          department: params.department,
          kind: 'laboratories',
          viewedBy: user.id
        });
      }

      const updatedLocalPrescription =
        await localPrescriptionRepository.findUnique(params);

      if (!updatedLocalPrescription) {
        throw new Error('Local prescription not found after update');
      }
      if (canDistributeToDepartments) {
        updatedLocalPrescription.sampleCount =
          localPrescriptionUpdate.sampleCount;
      }
      if (canUpdateLaboratories) {
        updatedLocalPrescription.substanceKindsLaboratories =
          localPrescriptionUpdate.substanceKindsLaboratories;
      }
      return {
        status: HttpStatus.OK,
        response: updatedLocalPrescription
      };
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department/companies/:companySiret':
    {
      get: async ({ userRole, query: { includes } }, params) => {
        console.info(
          'Get local prescription for company',
          params.prescriptionId,
          params.region,
          params.department,
          params.companySiret
        );

        const localPrescription = await getAndCheckLocalPrescription({
          ...params,
          includes
        });

        const viewerEchelon = editingEchelonForRole(userRole);
        const response = viewerEchelon
          ? (
              await withPendingLocalPrescriptionChanges(
                [localPrescription],
                viewerEchelon
              )
            )[0]
          : localPrescription;

        return {
          status: HttpStatus.OK,
          response
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
        return { status: HttpStatus.FORBIDDEN };
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

      const recipients = await userRepository.findMany({
        programmingSubPlanIds: programmingPlan.subPlans.map((sp) => sp.id),
        ...(userRole === 'NationalCoordinator'
          ? {
              region: localPrescription.region,
              roles: ['RegionalCoordinator']
            }
          : {
              roles: ['NationalCoordinator']
            })
      });

      await notificationService.sendNotification(
        {
          category: prescription.context,
          author: user,
          link: AppRouteLinks.ProgrammingRoute.link({
            year: programmingPlan.year,
            context: prescription.context,
            prescriptionId: prescription.id,
            commentsRegion: localPrescription.region
          })
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
        status: HttpStatus.CREATED,
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
          return { status: HttpStatus.FORBIDDEN };
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

        const recipients = await userRepository.findMany({
          programmingSubPlanIds: programmingPlan.subPlans.map((sp) => sp.id),
          ...(userRole === 'RegionalCoordinator'
            ? {
                region: localPrescription.region,
                department: localPrescription.department,
                roles: ['DepartmentalCoordinator']
              }
            : {
                roles: ['RegionalCoordinator'],
                region: localPrescription.region
              })
        });

        await notificationService.sendNotification(
          {
            category: prescription.context,
            author: user,
            link: AppRouteLinks.ProgrammingRoute.link({
              year: programmingPlan.year,
              context: prescription.context,
              prescriptionId: prescription.id,
              commentsRegion: localPrescription.region
            })
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
          status: HttpStatus.CREATED,
          response: prescriptionComment
        };
      }
    }
} as const satisfies ProtectedSubRouter;
