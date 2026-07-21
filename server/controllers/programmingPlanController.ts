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
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
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

      const isRegionalView =
        isNationalRole(userRole) ||
        isRegionalRole(userRole) ||
        programmingPlan.distributionKind === 'REGIONAL';

      const filteredSubPlans = programmingPlan.subPlans.map((subPlan) => ({
        ...subPlan,
        regionalStatus: isRegionalView
          ? subPlan.regionalStatus.filter(
              (_) =>
                userStatusAuthorized.includes(_.status) &&
                userRegionsForRole(user, userRole).includes(_.region)
            )
          : subPlan.regionalStatus,
        departmentalStatus: !isRegionalView
          ? subPlan.departmentalStatus.filter(
              (_) =>
                userStatusAuthorized.includes(_.status) &&
                userRegionsForRole(user, userRole).includes(_.region) &&
                userDepartmentsForRole(user, userRole).includes(_.department)
            )
          : subPlan.departmentalStatus
      }));

      const hasAnyAuthorizedStatus = filteredSubPlans.some((subPlan) =>
        isRegionalView
          ? subPlan.regionalStatus.length > 0
          : subPlan.departmentalStatus.length > 0
      );

      if (!hasAnyAuthorizedStatus) {
        return { status: HttpStatus.FORBIDDEN };
      }

      return {
        status: HttpStatus.OK,
        response: { ...programmingPlan, subPlans: filteredSubPlans }
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
        programmingPlan.subPlans.some((subPlan) =>
          subPlan.regionalStatus.some(
            (programmingPlanLocalStatus) =>
              NextProgrammingPlanStatus[programmingPlan.distributionKind][
                programmingPlanLocalStatus.status
              ] !== newProgrammingPlanStatus
          )
        )
      ) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      await Promise.all(
        programmingPlan.subPlans.flatMap((subPlan) =>
          RegionList.map((region) =>
            programmingSubPlanRepository.updateLocalStatus(subPlan.id, {
              region,
              status: newProgrammingPlanStatus
            })
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
        programmingPlanLocalStatusList.some((programmingPlanLocalStatus) => {
          const subPlan = programmingPlan.subPlans.find(
            (sp) => sp.id === programmingPlanLocalStatus.programmingSubPlanId
          );
          return (
            (programmingPlanLocalStatus.department
              ? NextProgrammingPlanStatus[programmingPlan.distributionKind][
                  subPlan?.departmentalStatus.find(
                    (_) =>
                      _.region === programmingPlanLocalStatus.region &&
                      _.department === programmingPlanLocalStatus.department
                  )?.status as ProgrammingPlanStatus
                ]
              : NextProgrammingPlanStatus[programmingPlan.distributionKind][
                  subPlan?.regionalStatus.find(
                    (_) => _.region === programmingPlanLocalStatus.region
                  )?.status as ProgrammingPlanStatus
                ]) !== programmingPlanLocalStatus.status
          );
        })
      )
        if (
          programmingPlanLocalStatusList.some(
            (programmingPlanLocalStatus) =>
              !userRegionsForRole(user, userRole).includes(
                programmingPlanLocalStatus.region
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
            const subPlan = programmingPlan.subPlans.find(
              (sp) => sp.id === programmingPlanLocalStatus.programmingSubPlanId
            );

            if (!subPlan) {
              return { status: HttpStatus.BAD_REQUEST };
            }

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
                programmingSubPlanIds: [subPlan.id],
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
                  programmingSubPlanIds: [subPlan.id]
                });

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
                  programmingSubPlanIds: [subPlan.id]
                });

                await notificationService.sendNotification(
                  {
                    category: 'ProgrammingPlanApprovedByRegion',
                    link
                  },
                  nationalCoordinators,
                  {
                    region: Regions[programmingPlanLocalStatus.region].name
                  }
                );
              } else if (
                programmingPlanLocalStatus.status === 'SubmittedToDepartments'
              ) {
                await programmingSubPlanRepository.insertManyLocalStatus(
                  subPlan.id,
                  Regions[programmingPlanLocalStatus.region].departments.map(
                    (department) => ({
                      region: programmingPlanLocalStatus.region,
                      department,
                      status: 'SubmittedToDepartments' as const
                    })
                  )
                );

                const departmentalCoordinators = await userRepository.findMany({
                  roles: ['DepartmentalCoordinator'],
                  region: programmingPlanLocalStatus.region,
                  programmingSubPlanIds: [subPlan.id]
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

            await programmingSubPlanRepository.updateLocalStatus(
              subPlan.id,
              programmingPlanLocalStatus
            );

            //TODO notif + test
            if (
              programmingPlanLocalStatus.department &&
              programmingPlanLocalStatus.status === 'Validated'
            ) {
              const updatedProgrammingPlan =
                await programmingPlanRepository.findUnique(programmingPlanId);

              const updatedSubPlan = updatedProgrammingPlan?.subPlans.find(
                (sp) => sp.id === subPlan.id
              );

              if (updatedSubPlan) {
                const allDepartmentsApproved = Regions[
                  programmingPlanLocalStatus.region
                ].departments.every(
                  (department) =>
                    updatedSubPlan.departmentalStatus.find(
                      (_) =>
                        _.region === programmingPlanLocalStatus.region &&
                        _.department === department
                    )?.status === 'Validated'
                );

                if (allDepartmentsApproved) {
                  await programmingSubPlanRepository.updateLocalStatus(
                    subPlan.id,
                    {
                      region: programmingPlanLocalStatus.region,
                      status: 'Validated'
                    }
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
        previousProgrammingPlan.subPlans.some((subPlan) =>
          subPlan.regionalStatus.some((_) => _.status !== 'Validated')
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
          programmingPlanId: newPlanId,
          nationalStatus: 'InProgress' as const,
          regionalStatus: RegionList.map((region) => ({
            region,
            status: 'InProgress' as const
          })),
          departmentalStatus: []
        })),
        contexts: previousProgrammingPlan.contexts,
        legalContexts: previousProgrammingPlan.legalContexts,
        samplesOutsidePlanAllowed:
          previousProgrammingPlan.samplesOutsidePlanAllowed,
        distributionKind: previousProgrammingPlan.distributionKind,
        year
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
