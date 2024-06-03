import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { format } from 'date-fns';
import { Request, Response } from 'express';
import { AuthenticatedRequest, SampleRequest } from 'express-jwt';
import { constants } from 'http2';
import fp from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { FindSampleOptions } from '../../shared/schema/Sample/FindSampleOptions';
import {
  CreatedSample,
  PartialSample,
  Sample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import { SampleItem } from '../../shared/schema/Sample/SampleItem';
import { DraftStatusList } from '../../shared/schema/Sample/SampleStatus';
import documentRepository from '../repositories/documentRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import sampleRepository from '../repositories/sampleRepository';
import documentService from '../services/documentService/documentService';
import config from '../utils/config';

const getSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample;

  console.info('Get sample', sample.id);

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  response.status(constants.HTTP_STATUS_OK).send({
    ...sample,
    items: sampleItems.map((item) => fp.omitBy(item, fp.isNil)),
  });
};

const getSampleItemDocument = async (request: Request, response: Response) => {
  const sample: Sample = (request as SampleRequest).sample;
  const itemNumber = Number(request.params.itemNumber);

  console.info('Get sample document', sample.id);

  const sampleItem = await sampleItemRepository.findUnique(
    sample.id,
    itemNumber
  );

  if (!sampleItem) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  const pdfBuffer = await documentService.generateSampleItemDocument(
    sample,
    sampleItem
  );

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader(
    'Content-Disposition',
    `inline; filename="DAP-${sample.reference}-${itemNumber}.pdf"`
  );
  response.send(pdfBuffer);
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
  const { user } = request as AuthenticatedRequest;
  const sampleToCreate = request.body as SampleToCreate;

  console.info('Create sample', sampleToCreate);

  if (!user.region) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  const serial = await sampleRepository.getNextSequence(
    user.region,
    new Date().getFullYear()
  );

  const sample: CreatedSample = {
    id: uuidv4(),
    reference: `${user.region}-${sampleToCreate.department}-${format(
      new Date(),
      'yy'
    )}-${String(serial).padStart(4, '0')}-${sampleToCreate.legalContext}`,
    createdBy: user.id,
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    status: 'DraftCompany',
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

  if (sampleUpdate.status === 'Sent') {
    const sampleItems = await sampleItemRepository.findMany(sample.id);

    await Promise.all(
      sampleItems.map(async (sampleItem) => {
        const pdfBuffer = await documentService.generateSampleItemDocument(
          updatedSample,
          sampleItem
        );

        const filename = `DAP-${sample.reference}-${sampleItem.itemNumber}.pdf`;
        const client = new S3(config.s3.client);
        const id = uuidv4();
        const key = `${id}_${filename}`;
        const command = new PutObjectCommand({
          Bucket: config.s3.bucket,
          Key: key,
          Body: pdfBuffer,
        });
        await client.send(command);

        await documentRepository.insert({
          id,
          filename,
          kind: 'SampleItemDocument',
          createdBy: updatedSample.createdBy,
          createdAt: new Date(),
        });

        await sampleItemRepository.update(
          updatedSample.id,
          sampleItem.itemNumber,
          {
            ...sampleItem,
            documentId: id,
          }
        );
      })
    );
  }

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
  getSampleItemDocument,
  findSamples,
  countSamples,
  createSample,
  updateSample,
  updateSampleItems,
  deleteSample,
};
