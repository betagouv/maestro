import { isNil, sumBy, uniq } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import {
  hasLocalPrescriptionPermission,
  type LocalPrescription,
  type LocalPrescriptionUpdate
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import {
  type LocalPrescriptionKey,
  toLocalPrescriptionKeyString
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import { stagesFromSubPlans } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { getSubPlanMatrixLabels } from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import {
  companiesIsRequired,
  type UserBase,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  changeViewAudienceForRole,
  editingEchelonForRole,
  isNationalRole,
  isRegionalRole,
  pendingChangeVisibilityForRole,
  seesUnappliedLocalPrescriptionChanges,
  type UserRole
} from 'maestro-shared/schema/User/UserRole';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckLocalPrescription } from '../middlewares/checks/localPrescriptionCheck';
import { getAndCheckPrescription } from '../middlewares/checks/prescriptionCheck';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import localPrescriptionChangeRepository from '../repositories/localPrescriptionChangeRepository';
import localPrescriptionCommentRepository from '../repositories/localPrescriptionCommentRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import { matrixRepository } from '../repositories/matrixRepository';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { notificationService } from '../services/notificationService';
import { savePrescriptions } from '../services/prescriptionSaveService';

export const withEffectiveLocalPrescriptionChanges = async (
  localPrescriptions: LocalPrescription[],
  userRole: UserRole,
  includeCompanyDrafts = false
): Promise<LocalPrescription[]> => {
  if (!seesUnappliedLocalPrescriptionChanges(userRole)) {
    return localPrescriptions;
  }
  const changes = await localPrescriptionChangeRepository.findEffectiveChanges(
    uniq(localPrescriptions.map((lp) => lp.prescriptionId)),
    editingEchelonForRole(userRole)
  );
  const changeByKey = new Map(
    changes.map((row) => [
      `${toLocalPrescriptionKeyString(row)}:${row.kind}`,
      row
    ])
  );
  const knownKeys = new Set(
    localPrescriptions.map((_) => toLocalPrescriptionKeyString(_))
  );
  const requestedScopes = new Set(
    localPrescriptions.map((_) => `${_.region}:${_.department ?? ''}`)
  );
  const draftOnlyRows: LocalPrescription[] = !includeCompanyDrafts
    ? []
    : changes
        .filter(
          (change) =>
            change.kind === 'sampleCount' &&
            !isNil(change.companySiret) &&
            !knownKeys.has(toLocalPrescriptionKeyString(change)) &&
            requestedScopes.has(`${change.region}:${change.department ?? ''}`)
        )
        .map((change) => ({
          prescriptionId: change.prescriptionId,
          region: change.region,
          department: change.department,
          companySiret: change.companySiret,
          sampleCount: change.sampleCount ?? 0,
          hasUnappliedChange: true
        }));

  return [...localPrescriptions, ...draftOnlyRows].map((localPrescription) => {
    const key = toLocalPrescriptionKeyString(localPrescription);
    const sampleCountChange = changeByKey.get(`${key}:sampleCount`);
    const laboratoriesChange = changeByKey.get(`${key}:laboratories`);
    if (!sampleCountChange && !laboratoriesChange) {
      return localPrescription;
    }
    const isDraft =
      !isNil(sampleCountChange) && isNil(sampleCountChange.diffusedAt);

    return {
      ...localPrescription,
      sampleCount:
        sampleCountChange?.sampleCount ?? localPrescription.sampleCount,
      ...(isDraft
        ? { diffusedSampleCount: localPrescription.sampleCount }
        : {}),
      ...(isNil(sampleCountChange) ? {} : { hasUnappliedChange: true }),
      substanceKindsLaboratories:
        laboratoriesChange?.substanceKindsLaboratories ??
        localPrescription.substanceKindsLaboratories
    };
  });
};

const saveSingleLocalPrescription = async (
  user: UserBase,
  userRole: UserRole,
  key: Omit<LocalPrescriptionKey, 'companySiret'>,
  update: LocalPrescriptionUpdate
): Promise<
  | { status: typeof HttpStatus.OK; response: LocalPrescription }
  | { status: typeof HttpStatus.FORBIDDEN | typeof HttpStatus.BAD_REQUEST }
> => {
  const result = await savePrescriptions({
    user,
    userRole,
    prescriptionUpdates: [],
    localPrescriptionUpdates: [{ ...key, update }]
  });

  if (result.status === HttpStatus.FORBIDDEN) {
    return { status: HttpStatus.FORBIDDEN };
  }
  if (result.status === HttpStatus.BAD_REQUEST) {
    return { status: HttpStatus.BAD_REQUEST };
  }

  const updatedLocalPrescription =
    await localPrescriptionRepository.findUnique(key);

  if (!updatedLocalPrescription) {
    throw new Error('Local prescription not found after update');
  }
  if (update.key === 'sampleCount') {
    updatedLocalPrescription.sampleCount = update.sampleCount;
  }
  if (update.key === 'laboratories') {
    updatedLocalPrescription.substanceKindsLaboratories =
      update.substanceKindsLaboratories;
  }

  return { status: HttpStatus.OK, response: updatedLocalPrescription };
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

      const liveLocalPrescriptions = await localPrescriptionRepository.findMany(
        findOptions,
        pendingChangeVisibilityForRole(userRole)
      );

      const localPrescriptions = await withEffectiveLocalPrescriptionChanges(
        liveLocalPrescriptions,
        userRole,
        !isNil(department) || findOptions.includeCompanies === true
      );

      const isRowVisible = (
        own: Pick<LocalPrescription, 'sampleCount' | 'hasUnappliedChange'>,
        children: Pick<
          LocalPrescription,
          'sampleCount' | 'hasUnappliedChange'
        >[]
      ) =>
        own.sampleCount > 0 ||
        sumBy(children, 'sampleCount') > 0 ||
        own.hasUnappliedChange === true ||
        children.some((_) => _.hasUnappliedChange === true);

      const childrenOf = (
        parent: Pick<LocalPrescription, 'prescriptionId' | 'region'> & {
          department?: Department | null;
        },
        level: 'departments' | 'companies'
      ) =>
        localPrescriptions.filter(
          (_) =>
            _.prescriptionId === parent.prescriptionId &&
            _.region === parent.region &&
            (level === 'departments'
              ? !isNil(_.department) && isNil(_.companySiret)
              : _.department === parent.department && !isNil(_.companySiret))
        );

      const filterEmptyLocalPrescriptions = findOptions.allLevels
        ? localPrescriptions
        : localPrescriptions.filter((localPrescription) => {
            if (isNil(region)) {
              return true;
            }
            if (isNil(department)) {
              const regionalRow = isNil(localPrescription.department)
                ? localPrescription
                : localPrescriptions.find(
                    (_) =>
                      _.prescriptionId === localPrescription.prescriptionId &&
                      _.region === localPrescription.region &&
                      isNil(_.department)
                  );
              return isRowVisible(
                regionalRow ?? { sampleCount: 0 },
                childrenOf(localPrescription, 'departments')
              );
            }
            if (isNil(companySirets)) {
              const departmentalRow = isNil(localPrescription.companySiret)
                ? localPrescription
                : localPrescriptions.find(
                    (_) =>
                      _.prescriptionId === localPrescription.prescriptionId &&
                      _.region === localPrescription.region &&
                      _.department === localPrescription.department &&
                      isNil(_.companySiret)
                  );
              return isRowVisible(
                departmentalRow ?? { sampleCount: 0 },
                childrenOf(
                  {
                    prescriptionId: localPrescription.prescriptionId,
                    region: localPrescription.region,
                    department: localPrescription.department
                  },
                  'companies'
                )
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
  '/prescriptions/regions/changes-viewed': {
    put: async ({
      user,
      userRole,
      body: { prescriptionIds, region, department }
    }) => {
      const allowedRegions = userRegionsForRole(user, userRole);
      if (!isNil(region) && !allowedRegions.includes(region)) {
        return { status: HttpStatus.FORBIDDEN };
      }

      await localPrescriptionChangeRepository.markManyViewed({
        regions: isNil(region) ? allowedRegions : [region],
        department,
        prescriptionIds,
        viewedBy: user.id,
        onlyApplied: !seesUnappliedLocalPrescriptionChanges(userRole),
        audience: changeViewAudienceForRole(userRole)
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

      const response = (
        await withEffectiveLocalPrescriptionChanges(
          [localPrescription],
          userRole
        )
      )[0];

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

      return saveSingleLocalPrescription(
        user,
        userRole,
        { prescriptionId: params.prescriptionId, region: params.region },
        localPrescriptionUpdate
      );
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

      return saveSingleLocalPrescription(
        user,
        userRole,
        {
          prescriptionId: params.prescriptionId,
          region: params.region,
          department: params.department
        },
        localPrescriptionUpdate
      );
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

        const response = (
          await withEffectiveLocalPrescriptionChanges(
            [localPrescription],
            userRole
          )
        )[0];

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
      const { prescription, subPlan } = await getAndCheckPrescription(
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
        id: crypto.randomUUID(),
        prescriptionId: localPrescription.prescriptionId,
        region: localPrescription.region,
        comment: draftPrescriptionComment.comment,
        createdAt: new Date(),
        createdBy: user.id
      };

      await localPrescriptionCommentRepository.insert(prescriptionComment);

      const recipients =
        userRole === 'NationalCoordinator'
          ? await userRepository.findMany({
              stages: stagesFromSubPlans(programmingPlan.subPlans),
              disabled: false,
              region: localPrescription.region,
              roles: ['RegionalCoordinator']
            })
          : await userRepository.findMany({
              ids: programmingPlan.nationalCoordinators.map(({ id }) => id),
              disabled: false
            });

      if (subPlan.context) {
        await notificationService.sendNotification(
          {
            category: subPlan.context,
            author: user,
            link: AppRouteLinks.ProgrammingRoute.link({
              year: programmingPlan.year,
              contexts: [subPlan.context],
              prescriptionId: prescription.id,
              commentsRegion: localPrescription.region
            })
          },
          recipients,
          {
            matrix: getSubPlanMatrixLabels(
              await matrixRepository.findReferential(),
              subPlan.matrices
            ).join(', '),
            sampleCount: localPrescription.sampleCount,
            comment: draftPrescriptionComment.comment,
            author: user ? `${user.name}` : 'Anonyme'
          }
        );
      }

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
        const { prescription, subPlan } = await getAndCheckPrescription(
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
          id: crypto.randomUUID(),
          prescriptionId: localPrescription.prescriptionId,
          region: localPrescription.region,
          department: localPrescription.department,
          comment: draftPrescriptionComment.comment,
          createdAt: new Date(),
          createdBy: user.id
        };

        await localPrescriptionCommentRepository.insert(prescriptionComment);

        const recipients = await userRepository.findMany({
          stages: stagesFromSubPlans(programmingPlan.subPlans),
          disabled: false,
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

        if (subPlan.context) {
          await notificationService.sendNotification(
            {
              category: subPlan.context,
              author: user,
              link: AppRouteLinks.ProgrammingRoute.link({
                year: programmingPlan.year,
                contexts: [subPlan.context],
                prescriptionId: prescription.id,
                commentsRegion: localPrescription.region
              })
            },
            recipients,
            {
              matrix: getSubPlanMatrixLabels(
                await matrixRepository.findReferential(),
                subPlan.matrices
              ).join(', '),
              sampleCount: localPrescription.sampleCount,
              comment: draftPrescriptionComment.comment,
              author: user ? `${user.name}` : 'Anonyme'
            }
          );
        }

        return {
          status: HttpStatus.CREATED,
          response: prescriptionComment
        };
      }
    }
} as const satisfies ProtectedSubRouter;
