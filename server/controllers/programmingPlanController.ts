import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import { intersection } from 'lodash-es';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import { RegionList } from 'maestro-shared/referential/Region';
import { AppRouteLinks } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import { NotificationCategoryMessages } from 'maestro-shared/schema/Notification/NotificationCategory';
import { ContextList } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanRegionalStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanRegionalStatus';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList,
  ProgrammingPlanStatusPermissions
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { hasPermission, userRegions } from 'maestro-shared/schema/User/User';
import { v4 as uuidv4 } from 'uuid';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
import { userRepository } from '../repositories/userRepository';
import { notificationService } from '../services/notificationService';

const findProgrammingPlans = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const findOptions = request.query as FindProgrammingPlanOptions;

  console.info('Find programmingPlans for user', user.id, findOptions);

  const userStatusAuthorized = Object.entries(ProgrammingPlanStatusPermissions)
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
    kinds: user.programmingPlanKinds,
    region: user.region || findOptions.region
  });

  console.info('Found programmingPlans', programmingPlans);

  response.status(constants.HTTP_STATUS_OK).send(programmingPlans);
};

const getProgrammingPlan = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const programmingPlanId = request.params.programmingPlanId;

  console.info('Get programming plan', programmingPlanId);

  const programmingPlan =
    await programmingPlanRepository.findUnique(programmingPlanId);

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(programmingPlanId);
  }

  console.info('Found programming plan', programmingPlan);

  if (!intersection(user.programmingPlanKinds, programmingPlan.kinds)) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const userStatusAuthorized = Object.entries(ProgrammingPlanStatusPermissions)
    .filter(([, permission]) => hasPermission(user, permission))
    .map(([status]) => status);

  const filterProgrammingPlanStatus = programmingPlan.regionalStatus.filter(
    (_) =>
      userStatusAuthorized.includes(_.status) &&
      userRegions(user).includes(_.region)
  );
  if (filterProgrammingPlanStatus.length === 0) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  response.status(constants.HTTP_STATUS_OK).send({
    ...programmingPlan,
    regionalStatus: filterProgrammingPlanStatus
  });
};

const getProgrammingPlanByYear = async (
  request: Request,
  response: Response
) => {
  const user = (request as AuthenticatedRequest).user;
  const year = parseInt(request.params.year);

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

  const userStatusAuthorized = Object.entries(ProgrammingPlanStatusPermissions)
    .filter(([, permission]) => hasPermission(user, permission))
    .map(([status]) => status);

  const filterProgrammingPlanStatus = programmingPlan.regionalStatus.filter(
    (_) => userStatusAuthorized.includes(_.status)
  );

  if (filterProgrammingPlanStatus.length === 0) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  response.status(constants.HTTP_STATUS_OK).send({
    ...programmingPlan,
    regionalStatus: filterProgrammingPlanStatus
  });
};

const createProgrammingPlan = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const year = parseInt(request.params.year);

  const previousProgrammingPlan = await programmingPlanRepository.findOne(
    year - 1,
    user.programmingPlanKinds
  );

  if (
    !previousProgrammingPlan ||
    previousProgrammingPlan.regionalStatus.some((_) => _.status !== 'Validated')
  ) {
    throw new ProgrammingPlanMissingError(String(year - 1));
  }

  const newProgrammingPlan = {
    id: uuidv4(),
    createdAt: new Date(),
    createdBy: user.id,
    kinds: previousProgrammingPlan.kinds,
    contexts: previousProgrammingPlan.contexts,
    year,
    regionalStatus: RegionList.map((region) => ({
      region,
      status: 'InProgress' as const
    }))
  };

  await programmingPlanRepository.insert(newProgrammingPlan);

  await Promise.all(
    ContextList.map(async (context) => {
      const previousPrescriptions = await prescriptionRepository.findMany({
        programmingPlanId: previousProgrammingPlan.id,
        context
      });
      const previousRegionalPrescriptions =
        await regionalPrescriptionRepository.findMany({
          programmingPlanId: previousProgrammingPlan.id,
          context
        });

      await Promise.all(
        previousPrescriptions.map(async (prescription) => {
          const newPrescription = {
            ...prescription,
            id: uuidv4(),
            programmingPlanId: newProgrammingPlan.id
          };

          await prescriptionRepository.insert(newPrescription);

          await regionalPrescriptionRepository.insertMany(
            previousRegionalPrescriptions
              .filter(
                (regionalPrescription) =>
                  regionalPrescription.prescriptionId === prescription.id
              )
              .map((regionalPrescription) => ({
                ...regionalPrescription,
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
    })
  );

  response.status(constants.HTTP_STATUS_CREATED).send(newProgrammingPlan);
};

const updateRegionalStatus = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const { programmingPlan } = request as ProgrammingPlanRequest;
  const programmingPlanRegionalStatusList =
    request.body as ProgrammingPlanRegionalStatus[];

  console.info(
    'Update programming plan regional status',
    programmingPlan.id,
    programmingPlanRegionalStatusList
  );

  if (
    programmingPlanRegionalStatusList.some(
      (programmingPlanRegionalStatus) =>
        NextProgrammingPlanStatus[
          programmingPlan.regionalStatus.find(
            (_) => _.region === programmingPlanRegionalStatus.region
          )?.status as ProgrammingPlanStatus
        ] !== programmingPlanRegionalStatus.status
    )
  ) {
    return response.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }

  if (
    hasPermission(user, 'approveProgrammingPlan') &&
    !hasPermission(user, 'manageProgrammingPlan') &&
    programmingPlanRegionalStatusList.some(
      (programmingPlanRegionalStatus) =>
        programmingPlanRegionalStatus.status !== 'Approved' ||
        !userRegions(user).includes(programmingPlanRegionalStatus.region)
    )
  ) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await Promise.all(
    programmingPlanRegionalStatusList.map(
      async (programmingPlanRegionalStatus) => {
        if (
          ['Submitted', 'Validated'].includes(
            programmingPlanRegionalStatus.status
          )
        ) {
          const regionalCoordinators = await userRepository.findMany({
            roles: ['RegionalCoordinator'],
            region: programmingPlanRegionalStatus.region
          });

          const category =
            programmingPlanRegionalStatus.status === 'Submitted'
              ? 'ProgrammingPlanSubmitted'
              : 'ProgrammingPlanValidated';

          await notificationService.sendNotification(
            {
              category,
              message: NotificationCategoryMessages[category],
              link: AppRouteLinks.ProgrammationByYearRoute.link(
                programmingPlan.year
              )
            },
            regionalCoordinators,
            undefined
          );
        } else if (programmingPlanRegionalStatus.status === 'Approved') {
          const nationalCoordinators = await userRepository.findMany({
            roles: ['NationalCoordinator']
          });

          await notificationService.sendNotification(
            {
              category: 'ProgrammingPlanApproved',
              message: NotificationCategoryMessages['ProgrammingPlanApproved'](
                programmingPlanRegionalStatus.region
              ),
              link: AppRouteLinks.ProgrammationByYearRoute.link(
                programmingPlan.year
              )
            },
            nationalCoordinators,
            {
              region: programmingPlanRegionalStatus.region
            }
          );
        } else {
          return response.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
        }

        await programmingPlanRepository.updateRegionalStatus(
          programmingPlan.id,
          programmingPlanRegionalStatus
        );
      }
    )
  );

  const updatedProgrammingPlan = await programmingPlanRepository.findUnique(
    programmingPlan.id
  );

  response.status(constants.HTTP_STATUS_OK).send(updatedProgrammingPlan);
};

export default {
  getProgrammingPlan,
  getProgrammingPlanByYear,
  findProgrammingPlans,
  createProgrammingPlan,
  updateRegionalStatus
};
