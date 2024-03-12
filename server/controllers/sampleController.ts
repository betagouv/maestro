import { logger } from 'bs-logger';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import { SampleToCreate } from '../../shared/schema/Sample';
import sampleRepository from '../repositories/sampleRepository';

const createSample = async (request: Request, response: Response) => {
  const { userId } = (request as AuthenticatedRequest).auth;
  const draft = request.body as SampleToCreate;

  logger.info('Create sample', draft);

  await sampleRepository.insert({
    id: uuidv4(),
    reference: '1231', //TODO
    createdBy: userId,
    createdAt: new Date(),
    ...draft,
  });

  response.status(constants.HTTP_STATUS_CREATED).send();
};

export default {
  createSample,
};
