import { getYear } from 'date-fns';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import fp from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { FindSampleOptions } from '../../shared/schema/Sample/FindSampleOptions';
import {
  CreatedSample,
  PartialSample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import { SampleItem } from '../../shared/schema/Sample/SampleItem';
import sampleItemRepository from '../repositories/sampleItemRepository';
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

  const sampleItems = await sampleItemRepository.findMany(sampleId);

  response.status(constants.HTTP_STATUS_OK).send({
    ...sample,
    items: sampleItems.map((item) => fp.omitBy(item, fp.isNil)),
  });
};

const findSamples = async (request: Request, response: Response) => {
  const { userId } = (request as AuthenticatedRequest).auth;
  const findOptions = request.query as FindSampleOptions;

  console.info('Find samples for user', userId, findOptions);

  const samples = await sampleRepository.findMany(findOptions);

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
    lastUpdatedAt: new Date(),
    status: 'DraftInfos',
    ...sampleToCreate,
  };
  await sampleRepository.insert(sample);

  response.status(constants.HTTP_STATUS_CREATED).send(sample);
};

const updateSample = async (request: Request, response: Response) => {
  const { sampleId } = request.params;
  const sampleUpdate = request.body as PartialSample;

  console.info('Update sample', sampleId, sampleUpdate);

  const sample = await sampleRepository.findUnique(sampleId);

  if (!sample) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (sample.createdBy !== (request as AuthenticatedRequest).auth.userId) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  if (sample.status === 'Sent') {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const updatedSample = {
    ...sample,
    ...sampleUpdate,
    lastUpdatedAt: new Date(),
  };

  await sampleRepository.update(updatedSample);

  response.status(constants.HTTP_STATUS_OK).send(updatedSample);
};

const updateSampleItems = async (request: Request, response: Response) => {
  const { sampleId } = request.params;
  const sampleItems = request.body as SampleItem[];

  console.info('Update sample items', sampleId, sampleItems);

  const sample = await sampleRepository.findUnique(sampleId);

  if (!sample) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  if (sample.createdBy !== (request as AuthenticatedRequest).auth.userId) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  if (sample.status === 'Sent') {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await sampleItemRepository.deleteMany(sampleId);
  await sampleItemRepository.insertMany(sampleItems);

  await sampleRepository.update({
    ...sample,
    lastUpdatedAt: new Date(),
  });

  response.status(constants.HTTP_STATUS_OK).send(sampleItems);
};

export default {
  getSample,
  findSamples,
  createSample,
  updateSample,
  updateSampleItems,
};
