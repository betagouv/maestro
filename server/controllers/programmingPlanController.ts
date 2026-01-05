import { constants } from 'http2';
import { intersection } from 'lodash-es';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import { Department } from 'maestro-shared/referential/Department';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { ProgrammingPlanKindList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList,
  ProgrammingPlanStatusPermissions
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  hasPermission,
  userDepartmentsForRole,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  isNationalRole,
  isRegionalRole
} from 'maestro-shared/schema/User/UserRole';
import { v4 as uuidv4 } from 'uuid';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import { userRepository } from '../repositories/userRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import { notificationService } from '../services/notificationService';

export const programmingPlanRouter = {
  '/programming-plans': {
    get: async ({ query: findOptions, user, userRole }) => {
      console.info('Find programmingPlans for user', user.id, findOptions);

      const userStatusAuthorized = Object.entries(
        ProgrammingPlanStatusPermissions
      )
        .filter(([, permission]) => hasPermission(userRole, permission))
        .map(([status]) => status);

      const findOptionsStatus = findOptions.status
        ? findOptions.status
        : ProgrammingPlanStatusList;

      const programmingPlans = await programmingPlanRepository.findMany({
        ...findOptions,
        status: intersection(
          findOptionsStatus,
          userStatusAuthorized
        ) as ProgrammingPlanStatus[],
        kinds:
          userRole === 'Administrator'
            ? ProgrammingPlanKindList
            : user.programmingPlanKinds,
        region: user.region || findOptions.region,
        department: user.department
      });

      console.info('Found programmingPlans', programmingPlans);

      return { status: constants.HTTP_STATUS_OK, response: programmingPlans };
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

      if (!intersection(user.programmingPlanKinds, programmingPlan.kinds)) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
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
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      return {
        status: constants.HTTP_STATUS_OK,
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
        return { status: constants.HTTP_STATUS_BAD_REQUEST };
      }

      await Promise.all(
        RegionList.map((region) => {
          programmingPlanRepository.updateLocalStatus(programmingPlan.id, {
            region,
            status: newProgrammingPlanStatus
          });
        })
      );

      await programmingPlanRepository.update({
        ...programmingPlan,
        closedAt: new Date(),
        closedBy: user.id
      });

      const updatedProgrammingPlan = await programmingPlanRepository.findUnique(
        programmingPlan.id
      );

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedProgrammingPlan
      };
    }
  },
  '/programming-plans/:programmingPlanId/local-status': {
    put: async (
      { user, userRole, body: programmingPlanLocalStatusList },
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
                programmingPlanLocalStatus.region
              ) ||
              (programmingPlanLocalStatus.department &&
                !Regions[user.region as Region].departments.includes(
                  programmingPlanLocalStatus.department
                ))
          )
        ) {
          return { status: constants.HTTP_STATUS_FORBIDDEN };
        }

      await Promise.all(
        programmingPlanLocalStatusList.map(
          async (programmingPlanLocalStatus) => {
            if (programmingPlanLocalStatus.department) {
              //TODO ne notifier que les préleveurs des abattoires concernés par des prélevements
              const samplers = await userRepository.findMany({
                roles: ['Sampler'],
                region: programmingPlanLocalStatus.region,
                department: programmingPlanLocalStatus.department as Department,
                programmingPlanKinds: programmingPlan.kinds
              });

              await notificationService.sendNotification(
                {
                  category: 'ProgrammingPlanValidated',
                  link: `${AppRouteLinks.ProgrammingRoute.link}?${new URLSearchParams(
                    {
                      year: programmingPlan.year.toString(),
                      planIds: programmingPlan.id
                    }
                  ).toString()}`
                },
                samplers,
                undefined
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
                  programmingPlanKinds: programmingPlan.kinds
                });

                const link = `${AppRouteLinks.ProgrammingRoute.link}?${new URLSearchParams(
                  {
                    year: programmingPlan.year.toString(),
                    planIds: programmingPlan.id
                  }
                ).toString()}`;

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
                      undefined
                    ));
              } else if (
                programmingPlanLocalStatus.status === 'ApprovedByRegion'
              ) {
                const nationalCoordinators = await userRepository.findMany({
                  roles: ['NationalCoordinator'],
                  programmingPlanKinds: programmingPlan.kinds
                });

                await notificationService.sendNotification(
                  {
                    category: 'ProgrammingPlanApprovedByRegion',
                    link: `${AppRouteLinks.ProgrammingRoute.link}?${new URLSearchParams(
                      {
                        year: programmingPlan.year.toString(),
                        planIds: programmingPlan.id
                      }
                    ).toString()}`
                  },
                  nationalCoordinators,
                  {
                    region: Regions[programmingPlanLocalStatus.region].name
                  }
                );
              } else if (
                programmingPlanLocalStatus.status === 'SubmittedToDepartments'
              ) {
                await programmingPlanRepository.insertManyLocalStatus(
                  programmingPlanId,
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
                  programmingPlanKinds: programmingPlan.kinds
                });

                await notificationService.sendNotification(
                  {
                    category: 'ProgrammingPlanSubmittedToDepartments',
                    link: `${AppRouteLinks.ProgrammingRoute.link}?${new URLSearchParams(
                      {
                        year: programmingPlan.year.toString(),
                        planIds: programmingPlan.id
                      }
                    ).toString()}`
                  },
                  departmentalCoordinators,
                  {
                    sender: 'coordination régionale'
                  }
                );
              } else {
                return { status: constants.HTTP_STATUS_BAD_REQUEST };
              }
            }

            await programmingPlanRepository.updateLocalStatus(
              programmingPlanId,
              programmingPlanLocalStatus
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
                  programmingPlanLocalStatus.region
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

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedProgrammingPlan
      };
    }
  },
  '/programming-plans/years/:year': {
    post: async ({ user }, { year }) => {
      const previousProgrammingPlan = await programmingPlanRepository.findOne(
        year - 1,
        user.programmingPlanKinds
      );

      if (
        !previousProgrammingPlan ||
        previousProgrammingPlan.regionalStatus.some(
          (_) => _.status !== 'Validated'
        )
      ) {
        throw new ProgrammingPlanMissingError(String(year - 1));
      }

      const newProgrammingPlan = {
        id: uuidv4(),
        createdAt: new Date(),
        createdBy: user.id,
        title: previousProgrammingPlan.title,
        domain: previousProgrammingPlan.domain,
        kinds: previousProgrammingPlan.kinds,
        contexts: previousProgrammingPlan.contexts,
        legalContexts: previousProgrammingPlan.legalContexts,
        samplesOutsidePlanAllowed:
          previousProgrammingPlan.samplesOutsidePlanAllowed,
        distributionKind: previousProgrammingPlan.distributionKind,
        year,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'InProgress' as const
        })),
        departmentalStatus: [],
        substanceKinds: previousProgrammingPlan.substanceKinds
      };

      await programmingPlanRepository.insert(newProgrammingPlan);

      const previousPrescriptions = await prescriptionRepository.findMany({
        programmingPlanId: previousProgrammingPlan.id
      });
      const previousLocalPrescriptions =
        await localPrescriptionRepository.findMany({
          programmingPlanId: previousProgrammingPlan.id
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
                prescriptionId: newPrescription.id,
                laboratoryId: null
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
        status: constants.HTTP_STATUS_CREATED,
        response: newProgrammingPlan
      };
    }
  }
} as const satisfies ProtectedSubRouter;
