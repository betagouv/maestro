import { intersection, isNil } from 'lodash-es';
import { Brand } from 'maestro-shared/constants';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import type { Department } from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { NotificationCategoryTitles } from 'maestro-shared/schema/Notification/NotificationCategory';
import { buildFindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  hasSentOnward,
  type ProgrammingPlanEchelon
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import {
  NextProgrammingPlanStatus,
  type ProgrammingPlanStatus,
  ProgrammingPlanStatusPermissions
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  hasPermission,
  programmingSubPlanIdsIsRequired,
  type UserRefined,
  userDepartmentsForRole,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  editingEchelonForRole,
  isNationalRole,
  isRegionalRole,
  type UserRole
} from 'maestro-shared/schema/User/UserRole';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { notificationService } from '../services/notificationService';
import prescriptionDiffusionService from '../services/prescriptionDiffusionService';

const maskHasPendingChangeForViewer = (
  plan: ProgrammingPlanChecked,
  userRole: UserRole,
  user: UserRefined
): ProgrammingPlanChecked => {
  const viewerEchelon = editingEchelonForRole(userRole);
  const isOwner = (
    echelon: ProgrammingPlanEchelon,
    region?: string,
    department?: string
  ) =>
    viewerEchelon === echelon &&
    (echelon !== 'Regional' || user.region === region) &&
    (echelon !== 'Departmental' ||
      (user.region === region && user.department === department));

  return {
    ...plan,
    nationalStatus: {
      ...plan.nationalStatus,
      hasPendingChange: isOwner('National')
        ? plan.nationalStatus.hasPendingChange
        : false
    },
    regionalStatus: plan.regionalStatus.map((regionalStatus) => ({
      ...regionalStatus,
      hasPendingChange: isOwner('Regional', regionalStatus.region)
        ? Boolean(regionalStatus.hasPendingChange || regionalStatus.needsResend)
        : false
    })),
    departmentalStatus: plan.departmentalStatus.map((departmentalStatus) => ({
      ...departmentalStatus,
      hasPendingChange: isOwner(
        'Departmental',
        departmentalStatus.region,
        departmentalStatus.department
      )
        ? Boolean(
            departmentalStatus.hasPendingChange ||
              departmentalStatus.needsResend
          )
        : false
    }))
  };
};

export const programmingPlanRouter = {
  '/programming-plans': {
    get: async ({ query: findOptions, user, userRole }) => {
      console.info('Find programmingPlans for user', user.id, findOptions);

      const userLaboratory =
        userRole === 'LaboratoryUser'
          ? await laboratoryRepository.findUnique(user.laboratoryId as string)
          : undefined;

      const programmingPlans = await programmingPlanRepository.findMany(
        buildFindProgrammingPlanOptions(
          user,
          userRole,
          findOptions,
          userLaboratory
        )
      );

      console.info('Found programmingPlans', programmingPlans);

      return {
        status: HttpStatus.OK,
        response: programmingPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/send-to-regions': {
    post: async ({ user, userRole, body: { programmingPlanIds } }) => {
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      for (const plan of plans) {
        const link = AppRouteLinks.ProgrammingRoute.link({
          year: plan.year,
          planIds: plan.id
        });
        const isModified = plan.nationalStatus.hasPendingChange === true;

        if (userRole === 'NationalCoordinator') {
          await prescriptionDiffusionService.commitPendingNationalChanges(
            plan.id
          );
        }

        if (userRole === 'NationalCoordinator' && !isModified) {
          await programmingPlanRepository.updateNationalStatus(
            plan.id,
            'SubmittedToAdmin',
            plan.distributionKind
          );

          const admins = await userRepository.findMany({
            roles: ['Administrator'],
            programmingSubPlanIds: plan.subPlans.map((sp) => sp.id)
          });

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanReadyForAdminReview', link },
            admins,
            {
              object:
                NotificationCategoryTitles.ProgrammingPlanReadyForAdminReview,
              content: `Le plan « ${plan.title} » est prêt à être diffusé aux régions.`
            }
          );
          continue;
        }

        if (userRole === 'Administrator' && isModified) {
          continue;
        }

        if (
          userRole === 'Administrator' &&
          plan.nationalStatus.status !== 'SubmittedToAdmin'
        ) {
          continue;
        }

        if (!isModified) {
          await Promise.all(
            plan.regionalStatus.map((regionalStatus) =>
              programmingPlanRepository.updateLocalStatus(
                plan.id,
                { region: regionalStatus.region, status: 'SubmittedToRegion' },
                plan.distributionKind
              )
            )
          );
          await programmingPlanRepository.updateNationalStatus(
            plan.id,
            'SubmittedToRegion',
            plan.distributionKind
          );

          const regionalCoordinators = await userRepository.findMany({
            roles: ['RegionalCoordinator'],
            programmingSubPlanIds: plan.subPlans.map((sp) => sp.id)
          });

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanSubmittedToRegion', link },
            regionalCoordinators,
            {
              sender:
                userRole === 'Administrator'
                  ? 'administration'
                  : 'coordination nationale'
            }
          );
        } else {
          const previousSentAt = plan.nationalStatus.sentAt as Date;
          await programmingPlanRepository.touchNationalSentAt(plan.id);

          const affectedRegions = plan.regionalStatus.filter(
            (regionalStatus) =>
              regionalStatus.lastModifiedAt &&
              regionalStatus.lastModifiedAt > previousSentAt
          );

          for (const affectedRegion of affectedRegions) {
            const regionalCoordinators = await userRepository.findMany({
              roles: ['RegionalCoordinator'],
              region: affectedRegion.region,
              programmingSubPlanIds: plan.subPlans.map((sp) => sp.id)
            });

            await notificationService.sendNotification(
              { category: 'ProgrammingPlanModifiedAfterSubmission', link },
              regionalCoordinators,
              {
                object:
                  NotificationCategoryTitles.ProgrammingPlanModifiedAfterSubmission,
                content: `Le plan « ${plan.title} » a été modifié et renvoyé.`
              }
            );
          }
        }
      }

      const updatedPlans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      return {
        status: HttpStatus.OK,
        response: updatedPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/send-to-departments': {
    post: async ({ user, userRole, body: { programmingPlanIds } }) => {
      const region = user.region as Region;
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      for (const plan of plans) {
        const regionalStatus = plan.regionalStatus.find(
          (_) => _.region === region
        );
        if (!regionalStatus) {
          continue;
        }

        const link = AppRouteLinks.ProgrammingRoute.link({
          year: plan.year,
          planIds: plan.id
        });
        const isModified =
          regionalStatus.hasPendingChange === true ||
          regionalStatus.needsResend === true;

        if (plan.distributionKind === 'REGIONAL') {
          continue;
        }

        await prescriptionDiffusionService.commitPendingRegionalChanges(
          plan.id,
          region
        );

        if (!isModified) {
          await programmingPlanRepository.insertManyLocalStatus(
            plan.id,
            Regions[region].departments.map((department) => ({
              region,
              department,
              status: 'SubmittedToDepartments' as const
            }))
          );
          await programmingPlanRepository.updateLocalStatus(
            plan.id,
            { region, status: 'SubmittedToDepartments' },
            plan.distributionKind
          );

          const departmentalCoordinators = await userRepository.findMany({
            roles: ['DepartmentalCoordinator'],
            region,
            programmingSubPlanIds: plan.subPlans.map((sp) => sp.id)
          });

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanSubmittedToDepartments', link },
            departmentalCoordinators,
            { sender: 'coordination régionale' }
          );
        } else {
          const previousSentAt = regionalStatus.sentAt as Date;
          await programmingPlanRepository.touchRegionalSentAt(plan.id, region);

          const affectedDepartments = plan.departmentalStatus.filter(
            (departmentalStatus) =>
              departmentalStatus.region === region &&
              departmentalStatus.lastModifiedAt &&
              departmentalStatus.lastModifiedAt > previousSentAt
          );

          if (affectedDepartments.length > 0) {
            const departmentalCoordinators = await userRepository.findMany({
              roles: ['DepartmentalCoordinator'],
              region,
              programmingSubPlanIds: plan.subPlans.map((sp) => sp.id)
            });

            await notificationService.sendNotification(
              { category: 'ProgrammingPlanModifiedAfterSubmission', link },
              departmentalCoordinators,
              {
                object:
                  NotificationCategoryTitles.ProgrammingPlanModifiedAfterSubmission,
                content: `Le plan « ${plan.title} » a été modifié et renvoyé.`
              }
            );
          }
        }
      }

      const updatedPlans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      return {
        status: HttpStatus.OK,
        response: updatedPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/send-to-samplers': {
    post: async ({ user, userRole, body: { programmingPlanIds } }) => {
      const region = user.region as Region;
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      for (const plan of plans) {
        if (plan.distributionKind !== 'REGIONAL') {
          continue;
        }

        const regionalStatus = plan.regionalStatus.find(
          (_) => _.region === region
        );
        if (!regionalStatus) {
          continue;
        }

        const link = AppRouteLinks.ProgrammingRoute.link({
          year: plan.year,
          planIds: plan.id
        });
        const isModified =
          regionalStatus.hasPendingChange === true ||
          regionalStatus.needsResend === true;

        await prescriptionDiffusionService.commitPendingRegionalChanges(
          plan.id,
          region
        );

        const samplers = await userRepository.findMany({
          roles: ['Sampler'],
          region,
          programmingSubPlanIds: plan.subPlans.map((sp) => sp.id)
        });

        if (regionalStatus.status === 'SubmittedToRegion') {
          await programmingPlanRepository.updateLocalStatus(
            plan.id,
            { region, status: 'Validated' },
            plan.distributionKind
          );

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanValidated', link },
            samplers,
            {
              object: NotificationCategoryTitles.ProgrammingPlanValidated,
              content: `
L’étape de la répartition de la programmation a été réalisée par votre coordinateur. La campagne est lancée !

Vous pouvez dorénavant consulter la programmation, vous concernant, dans l’onglet "Programmation" et saisir des prélèvements.`
            }
          );
        } else if (
          isModified &&
          hasSentOnward(
            'Regional',
            plan.distributionKind,
            regionalStatus.status
          )
        ) {
          await programmingPlanRepository.touchRegionalSentAt(plan.id, region);

          const nationalCoordinators = await userRepository.findMany({
            roles: ['NationalCoordinator'],
            programmingSubPlanIds: plan.subPlans.map((sp) => sp.id)
          });

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanModifiedAfterSubmission', link },
            nationalCoordinators,
            {
              object:
                NotificationCategoryTitles.ProgrammingPlanModifiedAfterSubmission,
              content: `Le plan « ${plan.title} » a été modifié et renvoyé.`
            }
          );

          await notificationService.sendNotification(
            { category: 'ProgrammingPlanModifiedAfterSubmission', link },
            samplers,
            {
              object:
                NotificationCategoryTitles.ProgrammingPlanModifiedAfterSubmission,
              content: `Le plan « ${plan.title} » a été modifié, les prélèvements concernés ont été mis à jour.`
            }
          );
        }
      }

      const updatedPlans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      return {
        status: HttpStatus.OK,
        response: updatedPlans.map((plan) =>
          maskHasPendingChangeForViewer(plan, userRole, user)
        )
      };
    }
  },
  '/programming-plans/:programmingPlanId': {
    get: async ({ user, userRole }, { programmingPlanId }) => {
      console.info('Get programming plan', programmingPlanId);

      const programmingPlan =
        await programmingPlanRepository.findUnique(programmingPlanId);

      if (!programmingPlan) {
        throw new ProgrammingPlanMissingError(programmingPlanId);
      }

      if (
        programmingSubPlanIdsIsRequired(user) &&
        !intersection(
          user.programmingSubPlans.map((sp) => sp.id),
          programmingPlan.subPlans.map((sp) => sp.id)
        ).length
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      const userStatusAuthorized = Object.entries(
        ProgrammingPlanStatusPermissions
      )
        .filter(([, permission]) => hasPermission(userRole, permission))
        .map(([status]) => status);

      const maskedProgrammingPlan = maskHasPendingChangeForViewer(
        programmingPlan,
        userRole,
        user
      );

      const filterProgrammingPlanStatus =
        isNationalRole(userRole) ||
        isRegionalRole(userRole) ||
        maskedProgrammingPlan.distributionKind === 'REGIONAL'
          ? maskedProgrammingPlan.regionalStatus.filter(
              (_) =>
                userStatusAuthorized.includes(_.status) &&
                userRegionsForRole(user, userRole).includes(_.region)
            )
          : maskedProgrammingPlan.departmentalStatus.filter(
              (_) =>
                userStatusAuthorized.includes(_.status) &&
                userRegionsForRole(user, userRole).includes(_.region) &&
                userDepartmentsForRole(user, userRole).includes(_.department)
            );
      if (filterProgrammingPlanStatus.length === 0) {
        return { status: HttpStatus.FORBIDDEN };
      }

      return {
        status: HttpStatus.OK,
        response: {
          ...maskedProgrammingPlan,
          regionalStatus: filterProgrammingPlanStatus
        }
      };
    },
    put: async ({ user, userRole, body }, { programmingPlanId }) => {
      const programmingPlan =
        await getAndCheckProgrammingPlan(programmingPlanId);
      const newProgrammingPlanStatus = body.status;

      console.info(
        'Update programming plan status',
        programmingPlan.id,
        newProgrammingPlanStatus
      );

      if (
        newProgrammingPlanStatus !== 'Closed' ||
        programmingPlan.regionalStatus.some(
          (programmingPlanLocalStatus) =>
            NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlanLocalStatus.status
            ] !== newProgrammingPlanStatus
        )
      ) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      await Promise.all(
        RegionList.map((region) =>
          programmingPlanRepository.updateLocalStatus(
            programmingPlan.id,
            {
              region,
              status: newProgrammingPlanStatus
            },
            programmingPlan.distributionKind
          )
        )
      );

      await programmingPlanRepository.update({
        ...programmingPlan,
        closedAt: new Date(),
        closedBy: user.id
      });

      await sampleRepository.deleteDraftOnProgrammingPlan(programmingPlan.id);

      const updatedProgrammingPlan = await programmingPlanRepository.findUnique(
        programmingPlan.id
      );

      if (!updatedProgrammingPlan) {
        throw new Error('Programming plan not found after update');
      }
      return {
        status: HttpStatus.OK,
        response: maskHasPendingChangeForViewer(
          updatedProgrammingPlan,
          userRole,
          user
        )
      };
    }
  },
  '/programming-plans/:programmingPlanId/local-status': {
    put: async (
      { user, userRole, body: { programmingPlanLocalStatusList } },
      { programmingPlanId }
    ) => {
      const programmingPlan =
        await getAndCheckProgrammingPlan(programmingPlanId);

      console.info(
        'Update programming plan regional status',
        programmingPlanId,
        programmingPlanLocalStatusList
      );

      const isValidTransition = (
        programmingPlanLocalStatus: (typeof programmingPlanLocalStatusList)[number]
      ) =>
        (programmingPlanLocalStatus.department
          ? NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlan.departmentalStatus?.find(
                (_) =>
                  _.region === programmingPlanLocalStatus.region &&
                  _.department === programmingPlanLocalStatus.department
              )?.status as ProgrammingPlanStatus
            ]
          : NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlan.regionalStatus.find(
                (_) => _.region === programmingPlanLocalStatus.region
              )?.status as ProgrammingPlanStatus
            ]) === programmingPlanLocalStatus.status;

      const isAllowedDepartmentalReDiffusion = (
        programmingPlanLocalStatus: (typeof programmingPlanLocalStatusList)[number]
      ) =>
        Boolean(programmingPlanLocalStatus.department) &&
        programmingPlanLocalStatus.status === 'Validated' &&
        programmingPlan.departmentalStatus?.some(
          (_) =>
            _.region === programmingPlanLocalStatus.region &&
            _.department === programmingPlanLocalStatus.department &&
            _.status === 'Validated'
        );

      if (
        programmingPlanLocalStatusList.some(
          (programmingPlanLocalStatus) =>
            !userRegionsForRole(user, userRole).includes(
              programmingPlanLocalStatus.region as Region
            ) ||
            (programmingPlanLocalStatus.department &&
              !Regions[user.region as Region].departments.includes(
                programmingPlanLocalStatus.department
              ))
        )
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      if (
        programmingPlanLocalStatusList.some(
          (programmingPlanLocalStatus) =>
            !isValidTransition(programmingPlanLocalStatus) &&
            !isAllowedDepartmentalReDiffusion(programmingPlanLocalStatus)
        )
      ) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      if (
        programmingPlanLocalStatusList.some(
          (_) => _.status === 'SubmittedToRegion'
        )
      ) {
        await prescriptionDiffusionService.commitPendingNationalChanges(
          programmingPlanId
        );
      }

      const regionsSubmittingToDepartments = new Set(
        programmingPlanLocalStatusList
          .filter((_) => !_.department && _.status === 'SubmittedToDepartments')
          .map((_) => _.region as Region)
      );
      for (const region of regionsSubmittingToDepartments) {
        await prescriptionDiffusionService.commitPendingRegionalChanges(
          programmingPlanId,
          region
        );
      }

      const departmentsLaunchingCampaign =
        programmingPlanLocalStatusList.filter(
          (_) => _.department && _.status === 'Validated'
        ) as { region: Region; department: Department; status: 'Validated' }[];
      for (const { region, department } of departmentsLaunchingCampaign) {
        await prescriptionDiffusionService.commitPendingDepartmentalChanges(
          programmingPlanId,
          region,
          department
        );
      }

      await Promise.all(
        programmingPlanLocalStatusList.map(
          async (programmingPlanLocalStatus) => {
            const link = AppRouteLinks.ProgrammingRoute.link({
              year: programmingPlan.year,
              planIds: programmingPlan.id
            });

            if (
              programmingPlanLocalStatus.department &&
              programmingPlanLocalStatus.status === 'Validated'
            ) {
              const isRedeployment = programmingPlan.departmentalStatus?.some(
                (_) =>
                  _.region === programmingPlanLocalStatus.region &&
                  _.department === programmingPlanLocalStatus.department &&
                  _.status === 'Validated'
              );

              const localPrescriptions =
                await localPrescriptionRepository.findMany({
                  programmingPlanIds: [programmingPlanId],
                  region: programmingPlanLocalStatus.region,
                  department: programmingPlanLocalStatus.department
                });

              const samplers = await userRepository.findMany({
                roles: ['Sampler'],
                region: programmingPlanLocalStatus.region,
                department: programmingPlanLocalStatus.department as Department,
                programmingSubPlanIds: programmingPlan.subPlans.map(
                  (sp) => sp.id
                ),
                companySirets: localPrescriptions
                  .map((localPrescription) => localPrescription.companySiret)
                  .filter((_) => !isNil(_))
              });

              await notificationService.sendNotification(
                isRedeployment
                  ? { category: 'ProgrammingPlanModifiedAfterSubmission', link }
                  : { category: 'ProgrammingPlanValidated', link },
                samplers,
                isRedeployment
                  ? {
                      object:
                        NotificationCategoryTitles.ProgrammingPlanModifiedAfterSubmission,
                      content: `Le plan « ${programmingPlan.title} » a été modifié, les prélèvements concernés ont été mis à jour.`
                    }
                  : {
                      object:
                        NotificationCategoryTitles.ProgrammingPlanValidated,
                      content: `
L’étape de la répartition de la programmation a été réalisée par votre coordinateur. La campagne est lancée !

Vous pouvez dorénavant consulter la programmation, vous concernant, dans l’onglet "Programmation" et saisir des prélèvements.`
                    }
              );
            } else {
              if (
                ['SubmittedToRegion', 'Validated'].includes(
                  programmingPlanLocalStatus.status
                )
              ) {
                const regionalCoordinators = await userRepository.findMany({
                  roles: ['RegionalCoordinator'],
                  region: programmingPlanLocalStatus.region,
                  programmingSubPlanIds: programmingPlan.subPlans.map(
                    (sp) => sp.id
                  )
                });

                if (programmingPlanLocalStatus.status === 'SubmittedToRegion') {
                  await programmingPlanRepository.updateNationalStatus(
                    programmingPlanId,
                    'SubmittedToRegion',
                    programmingPlan.distributionKind
                  );
                }

                await (programmingPlanLocalStatus.status === 'SubmittedToRegion'
                  ? notificationService.sendNotification(
                      {
                        category: 'ProgrammingPlanSubmittedToRegion',
                        link
                      },
                      regionalCoordinators,
                      {
                        sender: 'coordination nationale'
                      }
                    )
                  : notificationService.sendNotification(
                      {
                        category: 'ProgrammingPlanValidated',
                        link
                      },
                      regionalCoordinators,
                      {
                        object:
                          NotificationCategoryTitles.ProgrammingPlanValidated,
                        content: `
L’étape de programmation a été clôturée par la coordination nationale.  

En tant que coordinateur régional, vous pouvez dorénavant vous connecter à ${Brand} sur l’espace "programmation" afin d’attribuer le/les laboratoires responsables des analyses officielles en lien avec les matrices programmées pour la prochaine campagne du dispositif PSPC dans votre région.  

Une fois le/les laboratoires attribués, la campagne sera officiellement lancée et les inspecteurs/préleveurs de vos régions pourront initier leurs prélèvements.`
                      }
                    ));
              } else if (
                programmingPlanLocalStatus.status === 'SubmittedToDepartments'
              ) {
                await programmingPlanRepository.insertManyLocalStatus(
                  programmingPlanId,
                  Regions[
                    programmingPlanLocalStatus.region as Region
                  ].departments.map((department) => ({
                    region: programmingPlanLocalStatus.region as Region,
                    department,
                    status: 'SubmittedToDepartments' as const
                  }))
                );

                const departmentalCoordinators = await userRepository.findMany({
                  roles: ['DepartmentalCoordinator'],
                  region: programmingPlanLocalStatus.region,
                  programmingSubPlanIds: programmingPlan.subPlans.map(
                    (sp) => sp.id
                  )
                });

                await notificationService.sendNotification(
                  {
                    category: 'ProgrammingPlanSubmittedToDepartments',
                    link
                  },
                  departmentalCoordinators,
                  {
                    sender: 'coordination régionale'
                  }
                );
              } else {
                return { status: HttpStatus.BAD_REQUEST };
              }
            }

            await programmingPlanRepository.updateLocalStatus(
              programmingPlanId,
              programmingPlanLocalStatus,
              programmingPlan.distributionKind
            );

            //TODO notif + test
            if (
              programmingPlanLocalStatus.department &&
              programmingPlanLocalStatus.status === 'Validated'
            ) {
              const updatedProgrammingPlan =
                await programmingPlanRepository.findUnique(programmingPlanId);

              if (updatedProgrammingPlan) {
                const allDepartmentsApproved = Regions[
                  programmingPlanLocalStatus.region as Region
                ].departments.every(
                  (department) =>
                    updatedProgrammingPlan.departmentalStatus?.find(
                      (_) =>
                        _.region === programmingPlanLocalStatus.region &&
                        _.department === department
                    )?.status === 'Validated'
                );

                if (allDepartmentsApproved) {
                  await programmingPlanRepository.updateLocalStatus(
                    programmingPlanId,
                    {
                      region: programmingPlanLocalStatus.region,
                      status: 'Validated'
                    },
                    programmingPlan.distributionKind
                  );
                }
              }
            }
          }
        )
      );

      const updatedProgrammingPlan =
        await programmingPlanRepository.findUnique(programmingPlanId);

      if (!updatedProgrammingPlan) {
        throw new Error('Programming plan not found after update');
      }
      return {
        status: HttpStatus.OK,
        response: maskHasPendingChangeForViewer(
          updatedProgrammingPlan,
          userRole,
          user
        )
      };
    }
  },
  '/programming-plans/years/:year': {
    post: async ({ user }, { year }) => {
      const previousProgrammingPlan = await programmingPlanRepository.findOne(
        year - 1,
        user.programmingSubPlans.map((sp) => sp.id)
      );

      if (
        !previousProgrammingPlan ||
        previousProgrammingPlan.regionalStatus.some(
          (_) => _.status !== 'Validated'
        )
      ) {
        throw new ProgrammingPlanMissingError(String(year - 1));
      }

      const newPlanId = uuidv4();
      const newProgrammingPlan = {
        id: newPlanId,
        createdAt: new Date(),
        createdBy: user.id,
        title: previousProgrammingPlan.title,
        domain: previousProgrammingPlan.domain,
        subPlans: previousProgrammingPlan.subPlans.map((subPlan) => ({
          ...subPlan,
          id: ProgrammingSubPlanId.parse(uuidv4()),
          programmingPlanId: newPlanId
        })),
        contexts: previousProgrammingPlan.contexts,
        legalContexts: previousProgrammingPlan.legalContexts,
        samplesOutsidePlanAllowed:
          previousProgrammingPlan.samplesOutsidePlanAllowed,
        distributionKind: previousProgrammingPlan.distributionKind,
        year,
        nationalStatus: { status: 'InProgress' as const },
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'InProgress' as const
        })),
        departmentalStatus: []
      };

      await programmingPlanRepository.insert(newProgrammingPlan);

      const previousPrescriptions = await prescriptionRepository.findMany({
        programmingPlanId: previousProgrammingPlan.id
      });
      const previousLocalPrescriptions =
        await localPrescriptionRepository.findMany({
          programmingPlanIds: [previousProgrammingPlan.id]
        });

      await Promise.all(
        previousPrescriptions.map(async (prescription) => {
          const newPrescription = {
            ...prescription,
            id: uuidv4(),
            programmingPlanId: newProgrammingPlan.id
          };

          await prescriptionRepository.insert(newPrescription);

          await localPrescriptionRepository.insertMany(
            previousLocalPrescriptions
              .filter(
                (localPrescription) =>
                  localPrescription.prescriptionId === prescription.id
              )
              .map((localPrescription) => ({
                ...localPrescription,
                prescriptionId: newPrescription.id
              }))
          );

          const previousPrescriptionSubstances =
            await prescriptionSubstanceRepository.findMany(prescription.id);

          await prescriptionSubstanceRepository.insertMany(
            previousPrescriptionSubstances.map((prescriptionSubstance) => ({
              ...prescriptionSubstance,
              prescriptionId: newPrescription.id
            }))
          );
        })
      );

      return {
        status: HttpStatus.CREATED,
        response: newProgrammingPlan
      };
    }
  }
} as const satisfies ProtectedSubRouter;
