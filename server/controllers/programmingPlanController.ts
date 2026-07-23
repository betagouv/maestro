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
import { isModifiedSinceSent } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import {
  NextProgrammingPlanStatus,
  type ProgrammingPlanStatus,
  ProgrammingPlanStatusPermissions
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  hasPermission,
  programmingSubPlanIdsIsRequired,
  userDepartmentsForRole,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  isNationalRole,
  isRegionalRole
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

      return { status: HttpStatus.OK, response: programmingPlans };
    }
  },
  '/programming-plans/send-to-regions': {
    post: async ({ userRole, body: { programmingPlanIds } }) => {
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      for (const plan of plans) {
        const link = AppRouteLinks.ProgrammingRoute.link({
          year: plan.year,
          planIds: plan.id
        });
        const isModified = isModifiedSinceSent(
          plan.nationalStatus.sentAt ?? null,
          plan.nationalStatus.lastModifiedAt ?? null
        );

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

        // A resend after modification is a National-only action: the admin's
        // role stops at the first send, only the national coordinator can
        // push a subsequent modification out to the regions.
        if (userRole === 'Administrator' && isModified) {
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

      return { status: HttpStatus.OK, response: updatedPlans };
    }
  },
  '/programming-plans/send-to-departments': {
    post: async ({ user, body: { programmingPlanIds } }) => {
      const region = user.region as Region;
      const plans = await programmingPlanRepository.findMany({
        ids: programmingPlanIds
      });

      for (const plan of plans) {
        // Only SLAUGHTERHOUSE plans cascade to a department echelon; REGIONAL
        // plans go SubmittedToRegion → ApprovedByRegion → Validated instead,
        // a separate approval workflow this action has no bearing on.
        if (plan.distributionKind !== 'SLAUGHTERHOUSE') {
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
        const isModified = isModifiedSinceSent(
          regionalStatus.sentAt ?? null,
          regionalStatus.lastModifiedAt ?? null
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

      return { status: HttpStatus.OK, response: updatedPlans };
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

      const filterProgrammingPlanStatus =
        isNationalRole(userRole) ||
        isRegionalRole(userRole) ||
        programmingPlan.distributionKind === 'REGIONAL'
          ? programmingPlan.regionalStatus.filter(
              (_) =>
                userStatusAuthorized.includes(_.status) &&
                userRegionsForRole(user, userRole).includes(_.region)
            )
          : programmingPlan.departmentalStatus.filter(
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
          ...programmingPlan,
          regionalStatus: filterProgrammingPlanStatus
        }
      };
    },
    put: async ({ user, body }, { programmingPlanId }) => {
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
        response: updatedProgrammingPlan
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

      if (
        programmingPlanLocalStatusList.some(
          (programmingPlanLocalStatus) =>
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
                ]) !== programmingPlanLocalStatus.status
        )
      )
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
                {
                  category: 'ProgrammingPlanValidated',
                  link
                },
                samplers,
                {
                  object: NotificationCategoryTitles.ProgrammingPlanValidated,
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
                programmingPlanLocalStatus.status === 'ApprovedByRegion'
              ) {
                const nationalCoordinators = await userRepository.findMany({
                  roles: ['NationalCoordinator'],
                  programmingSubPlanIds: programmingPlan.subPlans.map(
                    (sp) => sp.id
                  )
                });

                await notificationService.sendNotification(
                  {
                    category: 'ProgrammingPlanApprovedByRegion',
                    link
                  },
                  nationalCoordinators,
                  {
                    region:
                      Regions[programmingPlanLocalStatus.region as Region].name
                  }
                );
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
        response: updatedProgrammingPlan
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
