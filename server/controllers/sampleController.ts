import { getYear } from 'date-fns';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import {
  CreatedSample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import sampleRepository from '../repositories/sampleRepository';

const getSample = async (request: Request, response: Response) => {
  const { sampleId } = request.params;

  console.info('Get sample', sampleId);

  const sample = await sampleRepository.findUnique(sampleId);

  if (!sample) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (sample.createdBy !== (request as AuthenticatedRequest).auth.userId) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  response.status(constants.HTTP_STATUS_OK).send(sample);
};

const findSamples = async (request: Request, response: Response) => {
  const { userId } = (request as AuthenticatedRequest).auth;

  console.info('Find samples for user', userId);

  const samples = await sampleRepository.findMany(userId);

  response.status(constants.HTTP_STATUS_OK).send(samples);
};

const createSample = async (request: Request, response: Response) => {
  const { userId } = (request as AuthenticatedRequest).auth;
  const sampleToCreate = request.body as SampleToCreate;

  console.info('Create sample', sampleToCreate);

  const serial = await sampleRepository.getSerial();

  const sample: CreatedSample = {
    id: uuidv4(),
    reference: `GES-${sampleToCreate.department}-${getYear(
      new Date()
    )}-${serial}`,
    createdBy: userId,
    createdAt: new Date(),
    status: 'Draft',
    ...sampleToCreate,
  };
  await sampleRepository.insert(sample);

  response.status(constants.HTTP_STATUS_CREATED).send(sample);
};

const updateSample = async (request: Request, response: Response) => {
  const { sampleId } = request.params;
  const sampleUpdate = request.body;

  console.info('Update sample', sampleId, sampleUpdate);

  const sample = await sampleRepository.findUnique(sampleId);

  if (!sample) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (sample.createdBy !== (request as AuthenticatedRequest).auth.userId) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedSample = {
    ...sample,
    ...sampleUpdate,
  };

  await sampleRepository.update(updatedSample);

  response.status(constants.HTTP_STATUS_OK).send(updatedSample);
};

export default {
  getSample,
  findSamples,
  createSample,
  updateSample,
};
