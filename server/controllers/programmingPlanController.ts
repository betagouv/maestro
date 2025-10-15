import { constants } from 'http2';
import { intersection } from 'lodash-es';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { ProgrammingPlanKindList } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList,
  ProgrammingPlanStatusPermissions
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { hasPermission, userRegions } from 'maestro-shared/schema/User/User';
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
    get: async ({ query: findOptions, user }) => {
      console.info('Find programmingPlans for user', user.id, findOptions);

      const userStatusAuthorized = Object.entries(
        ProgrammingPlanStatusPermissions
      )
        .filter(([, permission]) => hasPermission(user, permission))
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
          user?.role === 'Administrator'
            ? ProgrammingPlanKindList
            : user.programmingPlanKinds,
        region: user.region || findOptions.region
      });

      console.info('Found programmingPlans', programmingPlans);

      return { status: constants.HTTP_STATUS_OK, response: programmingPlans };
    }
  },
  '/programming-plans/:programmingPlanId': {
    get: async ({ user }, { programmingPlanId }) => {
      console.info('Get programming plan', programmingPlanId);

      const programmingPlan =
        await programmingPlanRepository.findUnique(programmingPlanId);

      if (!programmingPlan) {
        throw new ProgrammingPlanMissingError(programmingPlanId);
      }

      console.info('Found programming plan', programmingPlan);

      if (!intersection(user.programmingPlanKinds, programmingPlan.kinds)) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const userStatusAuthorized = Object.entries(
        ProgrammingPlanStatusPermissions
      )
        .filter(([, permission]) => hasPermission(user, permission))
        .map(([status]) => status);

      const filterProgrammingPlanStatus = programmingPlan.regionalStatus.filter(
        (_) =>
          userStatusAuthorized.includes(_.status) &&
          userRegions(user).includes(_.region)
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
          (programmingPlanRegionalStatus) =>
            NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlanRegionalStatus.status
            ] !== newProgrammingPlanStatus
        )
      ) {
        return { status: constants.HTTP_STATUS_BAD_REQUEST };
      }

      await Promise.all(
        RegionList.map((region) => {
          programmingPlanRepository.updateRegionalStatus(programmingPlan.id, {
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
  '/programming-plans/:programmingPlanId/regional-status': {
    put: async (
      { user, body: programmingPlanRegionalStatusList },
      { programmingPlanId }
    ) => {
      const programmingPlan =
        await getAndCheckProgrammingPlan(programmingPlanId);

      console.info(
        'Update programming plan regional status',
        programmingPlanId,
        programmingPlanRegionalStatusList
      );

      if (
        programmingPlanRegionalStatusList.some(
          (programmingPlanRegionalStatus) =>
            NextProgrammingPlanStatus[programmingPlan.distributionKind][
              programmingPlan.regionalStatus.find(
                (_) => _.region === programmingPlanRegionalStatus.region
              )?.status as ProgrammingPlanStatus
            ] !== programmingPlanRegionalStatus.status
        )
      ) {
        return { status: constants.HTTP_STATUS_BAD_REQUEST };
      }

      if (
        programmingPlanRegionalStatusList.some(
          (programmingPlanRegionalStatus) =>
            !userRegions(user).includes(programmingPlanRegionalStatus.region)
        )
      ) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      await Promise.all(
        programmingPlanRegionalStatusList.map(
          async (programmingPlanRegionalStatus) => {
            if (
              ['SubmittedToRegion', 'Validated'].includes(
                programmingPlanRegionalStatus.status
              )
            ) {
              //TODO cas validation DAOA par département

              const regionalCoordinators = await userRepository.findMany({
                roles: ['RegionalCoordinator'],
                region: programmingPlanRegionalStatus.region
              });

              const category =
                programmingPlanRegionalStatus.status === 'SubmittedToRegion'
                  ? 'ProgrammingPlanSubmittedToRegion'
                  : 'ProgrammingPlanValidated';

              await notificationService.sendNotification(
                {
                  category,
                  link: `${AppRouteLinks.ProgrammingRoute.link}?${new URLSearchParams(
                    {
                      year: programmingPlan.year.toString(),
                      planIds: programmingPlan.id
                    }
                  ).toString()}`
                },
                regionalCoordinators,
                undefined
              );
            } else if (
              programmingPlanRegionalStatus.status === 'ApprovedByRegion'
            ) {
              const nationalCoordinators = await userRepository.findMany({
                roles: ['NationalCoordinator']
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
                  region: Regions[programmingPlanRegionalStatus.region].name
                }
              );
            } else if (
              programmingPlanRegionalStatus.status === 'SubmittedToDepartments'
            ) {
              const departmentalCoordinators = await userRepository.findMany({
                roles: ['DepartmentalCoordinator'],
                region: programmingPlanRegionalStatus.region
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
                undefined
              );
            } else {
              return { status: constants.HTTP_STATUS_BAD_REQUEST };
            }

            await programmingPlanRepository.updateRegionalStatus(
              programmingPlanId,
              programmingPlanRegionalStatus
            );
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
    get: async ({ user }, { year }) => {
      console.info('Get programming plan for year', year);

      const programmingPlan = await programmingPlanRepository.findOne(
        year,
        user.programmingPlanKinds,
        user.region
      );

      if (!programmingPlan) {
        throw new ProgrammingPlanMissingError(String(year));
      }

      console.info('Found programming plan', programmingPlan);

      const userStatusAuthorized = Object.entries(
        ProgrammingPlanStatusPermissions
      )
        .filter(([, permission]) => hasPermission(user, permission))
        .map(([status]) => status);

      const filterProgrammingPlanStatus = programmingPlan.regionalStatus.filter(
        (_) => userStatusAuthorized.includes(_.status)
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
        samplesOutsidePlanAllowed:
          previousProgrammingPlan.samplesOutsidePlanAllowed,
        distributionKind: previousProgrammingPlan.distributionKind,
        year,
        regionalStatus: RegionList.map((region) => ({
          region,
          status: 'InProgress' as const
        })),
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
