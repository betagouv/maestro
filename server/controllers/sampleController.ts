import { getYear } from 'date-fns';
import { Request, Response } from 'express';
import { AuthenticatedRequest, SampleRequest } from 'express-jwt';
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
import { DraftStatusList } from '../../shared/schema/Sample/SampleStatus';
import sampleItemRepository from '../repositories/sampleItemRepository';
import sampleRepository from '../repositories/sampleRepository';

const getSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample;

  console.info('Get sample', sample.id);

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  response.status(constants.HTTP_STATUS_OK).send({
    ...sample,
    items: sampleItems.map((item) => fp.omitBy(item, fp.isNil)),
  });
};

const findSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = request.query as FindSampleOptions;

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region,
  };

  console.info('Find samples for user', user.id, findOptions);

  const samples = await sampleRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(samples);
};

const countSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = request.query as FindSampleOptions;

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region,
  };

  console.info('Count samples for user', user.id, findOptions);

  const count = await sampleRepository.count(findOptions);

  response.status(constants.HTTP_STATUS_OK).send({ count });
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
  const sample = (request as SampleRequest).sample;
  const sampleUpdate = request.body as PartialSample;

  console.info('Update sample', sample.id, sampleUpdate);

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
  const sample = (request as SampleRequest).sample;
  const sampleItems = request.body as SampleItem[];

  console.info('Update sample items', sample.id, sampleItems);

  if (sample.status === 'Sent') {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await sampleItemRepository.deleteMany(sample.id);
  await sampleItemRepository.insertMany(sampleItems);

  await sampleRepository.update({
    ...sample,
    lastUpdatedAt: new Date(),
  });

  response.status(constants.HTTP_STATUS_OK).send(sampleItems);
};

const deleteSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample;

  console.info('Delete sample', sample.id);

  if (!DraftStatusList.includes(sample.status)) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await sampleRepository.deleteOne(sample.id);

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

export default {
  getSample,
  findSamples,
  countSamples,
  createSample,
  updateSample,
  updateSampleItems,
  deleteSample,
};
