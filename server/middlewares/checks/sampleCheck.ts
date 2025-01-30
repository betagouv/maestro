import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import SampleMissingError from 'maestro-shared/errors/sampleMissingError';
import { userDepartments } from 'maestro-shared/schema/User/User';
import { sampleRepository } from '../../repositories/sampleRepository';

export const sampleCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const user = (request as AuthenticatedRequest).user;
    const sampleId = request.params.sampleId;

    const sample = await sampleRepository.findUnique(sampleId);

    if (!sample) {
      throw new SampleMissingError(sampleId);
    }

    if (!userDepartments(user).includes(sample.department)) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    request.sample = sample;

    next();
  };
