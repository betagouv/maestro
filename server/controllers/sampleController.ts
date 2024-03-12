import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import { SampleToCreate } from '../../shared/schema/Sample';
import sampleRepository from '../repositories/sampleRepository';

const createSample = async (request: Request, response: Response) => {
  const { userId } = (request as AuthenticatedRequest).auth;
  const sampleToCreate = request.body as SampleToCreate;

  console.info('Create sample', sampleToCreate);

  const sample = {
    id: uuidv4(),
    reference: '1231', //TODO
    createdBy: userId,
    createdAt: new Date(),
    ...sampleToCreate,
  };
  await sampleRepository.insert(sample);

  response.status(constants.HTTP_STATUS_CREATED).send(sample);
};

export default {
  createSample,
};
