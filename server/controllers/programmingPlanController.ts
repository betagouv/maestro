import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import { intersection } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import ProgrammingPlanMissingError from '../../shared/errors/programmingPlanMissingError';
import { isDromRegion } from '../../shared/referential/Region';
import { ContextList } from '../../shared/schema/ProgrammingPlan/Context';
import { FindProgrammingPlanOptions } from '../../shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  getNextProgrammingPlanStatus,
  ProgrammingPlanStatusUpdate
} from '../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList,
  ProgrammingPlanStatusPermissions
} from '../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { hasPermission } from '../../shared/schema/User/User';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
import { userRepository } from '../repositories/userRepository';
import { mailService } from '../services/mailService';
import config from '../utils/config';

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
    isDrom: findOptions.isDrom || isDromRegion(user.region)
  });

  console.info('Found programmingPlans', programmingPlans);

  response.status(constants.HTTP_STATUS_OK).send(programmingPlans);
};

const getProgrammingPlanByYear = async (
  request: Request,
  response: Response
) => {
  const user = (request as AuthenticatedRequest).user;
  const year = parseInt(request.params.year);

  console.info('Get programming plan for year', year);

  const programmingPlan = await programmingPlanRepository.findOne(year);

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(String(year));
  }

  console.info('Found programming plan', programmingPlan);

  const userStatusAuthorized = Object.entries(ProgrammingPlanStatusPermissions)
    .filter(([, permission]) => hasPermission(user, permission))
    .map(([status]) => status);

  if (
    isDromRegion(user.region)
      ? !userStatusAuthorized.includes(programmingPlan.statusDrom)
      : !userStatusAuthorized.includes(programmingPlan.status)
  ) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  response.status(constants.HTTP_STATUS_OK).send(programmingPlan);
};

const createProgrammingPlan = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const year = parseInt(request.params.year);

  const previousProgrammingPlan = await programmingPlanRepository.findOne(
    year - 1
  );

  if (
    !previousProgrammingPlan ||
    previousProgrammingPlan.status !== 'Validated'
  ) {
    throw new ProgrammingPlanMissingError(String(year - 1));
  }

  const newProgrammingPlan = {
    id: uuidv4(),
    createdAt: new Date(),
    createdBy: user.id,
    year,
    status: 'InProgress' as ProgrammingPlanStatus,
    statusDrom: 'InProgress' as ProgrammingPlanStatus
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

const updateProgrammingPlan = async (request: Request, response: Response) => {
  const { programmingPlan } = request as ProgrammingPlanRequest;
  const programmingPlanUpdate = request.body as ProgrammingPlanStatusUpdate;

  console.info('Update programming plan', programmingPlan.id);

  const regionalCoordinators = await userRepository.findMany({
    role: 'RegionalCoordinator'
  });

  if (
    programmingPlanUpdate.status !==
    getNextProgrammingPlanStatus(programmingPlan, programmingPlanUpdate.isDrom)
  ) {
    return response.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }

  if (
    getNextProgrammingPlanStatus(
      programmingPlan,
      programmingPlanUpdate.isDrom
    ) === 'Submitted'
  ) {
    await mailService.sendSubmittedProgrammingPlan({
      recipients: [
        ...regionalCoordinators
          .filter(
            (regionalCoordinator) =>
              regionalCoordinator.region &&
              ((programmingPlanUpdate.isDrom &&
                isDromRegion(regionalCoordinator.region)) ||
                (!programmingPlanUpdate.isDrom &&
                  !isDromRegion(regionalCoordinator.region)))
          )
          .map((regionalCoordinator) => regionalCoordinator.email),
        config.mail.from
      ]
    });
  } else if (
    getNextProgrammingPlanStatus(
      programmingPlan,
      programmingPlanUpdate.isDrom
    ) === 'Validated'
  ) {
    await mailService.sendValidatedProgrammingPlan({
      recipients: [
        ...regionalCoordinators
          .filter(
            (regionalCoordinator) =>
              regionalCoordinator.region &&
              ((programmingPlanUpdate.isDrom &&
                isDromRegion(regionalCoordinator.region)) ||
                (!programmingPlanUpdate.isDrom &&
                  !isDromRegion(regionalCoordinator.region)))
          )
          .map((regionalCoordinator) => regionalCoordinator.email),
        config.mail.from
      ]
    });
  } else {
    return response.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }

  const updatedProgrammingPlan = {
    ...programmingPlan,
    status: !programmingPlanUpdate.isDrom
      ? programmingPlanUpdate.status
      : programmingPlan.status,
    statusDrom: programmingPlanUpdate.isDrom
      ? programmingPlanUpdate.status
      : programmingPlan.statusDrom
  };

  console.info('Updated programming plan', updatedProgrammingPlan);

  await programmingPlanRepository.update(updatedProgrammingPlan);

  response.status(constants.HTTP_STATUS_OK).send(updatedProgrammingPlan);
};

export default {
  getProgrammingPlanByYear,
  findProgrammingPlans,
  createProgrammingPlan,
  updateProgrammingPlan
};
