import { Request, Response } from 'express';
import { AuthenticatedRequest, ProgrammingPlanRequest } from 'express-jwt';
import { constants } from 'http2';
import _, { isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import ProgrammingPlanMissingError from '../../shared/errors/programmingPlanMissingError';
import { ContextList } from '../../shared/schema/ProgrammingPlan/Context';
import { FindProgrammingPlanOptions } from '../../shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanUpdate } from '../../shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList,
  ProgrammingPlanStatusPermissions,
} from '../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { hasPermission } from '../../shared/schema/User/User';
import prescriptionRepository from '../repositories/prescriptionRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import userRepository from '../repositories/userRepository';
import mailService from '../services/mailService';
import config from '../utils/config';

const findProgrammingPlans = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const findOptions = request.query as FindProgrammingPlanOptions;

  console.info('Find programmingPlans for user', user.id, findOptions);

  const userStatusAuthorized = Object.entries(ProgrammingPlanStatusPermissions)
    .filter(([, permission]) => hasPermission(user, permission))
    .map(([status]) => status);

  const findOptionsStatus = (
    isArray(findOptions.status)
      ? findOptions.status
      : findOptions.status
      ? [findOptions.status]
      : ProgrammingPlanStatusList
  ) as ProgrammingPlanStatus[];

  const programmingPlans = await programmingPlanRepository.findMany({
    ...findOptions,
    status: _.intersection(
      findOptionsStatus,
      userStatusAuthorized
    ) as ProgrammingPlanStatus[],
  });

  console.info('Found programmingPlans', programmingPlans);

  response.status(constants.HTTP_STATUS_OK).send(programmingPlans);
};

const getProgrammingPlanByYear = async (
  request: Request,
  response: Response
) => {
  const year = parseInt(request.params.year);

  console.info('Get programming plan for year', year);

  const programmingPlan = await programmingPlanRepository.findOne(year);

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(String(year));
  }

  console.info('Found programming plan', programmingPlan);
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
  };

  await Promise.all([
    ContextList.map(async (context) => {
      const previousPrescriptions = await prescriptionRepository.findMany({
        programmingPlanId: previousProgrammingPlan.id,
        context,
      });

      await prescriptionRepository.insertMany(
        previousPrescriptions.map((prescription) => ({
          ...prescription,
          id: uuidv4(),
          programmingPlanId: newProgrammingPlan.id,
          laboratoryId: null,
        }))
      );
    }),
  ]);

  await programmingPlanRepository.insert(newProgrammingPlan);

  response.status(constants.HTTP_STATUS_CREATED).send(newProgrammingPlan);
};

const updateProgrammingPlan = async (request: Request, response: Response) => {
  const programmingPlan = (request as ProgrammingPlanRequest).programmingPlan;
  const programmingPlanUpdate = request.body as ProgrammingPlanUpdate;

  console.info('Update programming plan', programmingPlan.id);

  const regionalCoordinators = await userRepository.findMany({
    role: 'RegionalCoordinator',
  });

  if (
    programmingPlan.status === 'InProgress' &&
    programmingPlanUpdate.status === 'Submitted'
  ) {
    await mailService.sendSubmittedProgrammingPlan({
      recipients: [
        ...regionalCoordinators.map(
          (regionalCoordinator) => regionalCoordinator.email
        ),
        config.mail.from,
      ],
      // params: {}, //TODO : add params
    });
  } else if (
    programmingPlan.status === 'Submitted' &&
    programmingPlanUpdate.status === 'Validated'
  ) {
    await mailService.sendValidatedProgrammingPlan({
      recipients: [
        ...regionalCoordinators.map(
          (regionalCoordinator) => regionalCoordinator.email
        ),
        config.mail.from,
      ],
      // params: {}, //TODO : add params
    });
  } else {
    return response.sendStatus(constants.HTTP_STATUS_BAD_REQUEST);
  }

  const updatedProgrammingPlan = {
    ...programmingPlan,
    status: programmingPlanUpdate.status,
  };

  await programmingPlanRepository.update(updatedProgrammingPlan);

  response.status(constants.HTTP_STATUS_OK).send(updatedProgrammingPlan);
};

export default {
  getProgrammingPlanByYear,
  findProgrammingPlans,
  createProgrammingPlan,
  updateProgrammingPlan,
};
