import { DeleteObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { format } from 'date-fns';
import { Request, Response } from 'express';
import { AuthenticatedRequest, SampleRequest } from 'express-jwt';
import { constants } from 'http2';
import fp from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Regions } from '../../shared/referential/Region';
import { Laboratory } from '../../shared/schema/Laboratory/Laboratory';
import { FindSampleOptions } from '../../shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  PartialSampleToCreate,
  Sample,
} from '../../shared/schema/Sample/Sample';
import { SampleItem } from '../../shared/schema/Sample/SampleItem';
import { DraftStatusList } from '../../shared/schema/Sample/SampleStatus';
import { UserInfos } from '../../shared/schema/User/User';
import companyRepository from '../repositories/companyRepository';
import documentRepository from '../repositories/documentRepository';
import laboratoryRepository from '../repositories/laboratoryRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import sampleRepository from '../repositories/sampleRepository';
import documentService from '../services/documentService/documentService';
import exportSamplesService from '../services/exportService/exportSamplesService';
import mailService from '../services/mailService';
import config from '../utils/config';
import workbookUtils from '../utils/workbookUtils';

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
  const { user } = request as AuthenticatedRequest;

  console.info('Get sample document', sample.id);

  const sampleItem = await sampleItemRepository.findUnique(
    sample.id,
    itemNumber
  );

  const pdfBuffer = await documentService.generateSupportDocument(
    sample,
    sampleItem ?? null,
    user
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

const exportSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = request.query as FindSampleOptions;

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region,
  };

  console.info('Export samples for user', user.id, findOptions);

  const samples = await sampleRepository.findMany(findOptions);

  const fileName = `prelevements-${format(
    new Date(),
    'yyyy-MM-dd-HH-mm-ss'
  )}.xlsx`;

  const workbook = workbookUtils.init(fileName, response);

  await exportSamplesService.writeToWorkbook(samples, workbook);
};

const createSample = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const sampleToCreate = request.body as PartialSampleToCreate;

  console.info('Create sample', sampleToCreate);

  if (!user.region) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  if (sampleToCreate.company) {
    await companyRepository.upsert(sampleToCreate.company);
  }

  const serial = await sampleRepository.getNextSequence(
    user.region,
    new Date().getFullYear()
  );

  const sample = {
    ...sampleToCreate,
    reference: `${Regions[user.region].shortName}-${
      sampleToCreate.department
    }-${format(new Date(), 'yy')}-${String(serial).padStart(4, '0')}-${
      sampleToCreate.legalContext
    }`,
    sampler: fp.pick(user, ['id', 'firstName', 'lastName']),
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
  };
  await sampleRepository.insert(sample);

  if (sampleToCreate.items) {
    await sampleItemRepository.insertMany(sampleToCreate.items);
  }

  response.status(constants.HTTP_STATUS_CREATED).send(sample);
};

const updateSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample as PartialSample;
  const sampleUpdate = request.body as PartialSample;
  const { user } = request as AuthenticatedRequest;

  console.info('Update sample', sample.id, sampleUpdate);

  if (
    sampleUpdate.company?.siret &&
    sample.company?.siret !== sampleUpdate.company?.siret
  ) {
    await companyRepository.upsert(sampleUpdate.company);
  }

  if (sampleUpdate.items) {
    await sampleItemRepository.updateMany(sample.id, sampleUpdate.items);
  }

  //TODO update only the fields concerned in relation to the status
  const updatedSample = {
    ...sample,
    ...sampleUpdate,
    lastUpdatedAt: new Date(),
  };

  if (sample.status === 'Submitted' && updatedSample.status === 'Sent') {
    const sampleItems = await sampleItemRepository.findMany(sample.id);

    await Promise.all(
      sampleItems.map(async (sampleItem) => {
        const doc = await storeSampleItemDocument(
          updatedSample as Sample,
          sampleItem as SampleItem,
          user
        );

        if (sampleItem.itemNumber === 1) {
          const laboratory = await laboratoryRepository.findUnique(
            updatedSample.laboratoryId as string
          );

          await mailService.sendAnalysisRequest({
            recipients: [(laboratory as Laboratory).email, config.mail.from],
            params: {
              region: user.region ? Regions[user.region].name : undefined,
              userMail: user.email,
              sampledAt: format(updatedSample.sampledAt, 'dd/MM/yyyy'),
            },
            attachment: [
              {
                name: `DAP-${updatedSample.reference}-${sampleItem.itemNumber}.pdf`,
                content: doc.toString('base64'),
              },
            ],
          });
        }

        if (sampleItem.ownerEmail) {
          await mailService.sendSupportDocumentCopyToOwner({
            recipients: [sampleItem.ownerEmail, config.mail.from],
            params: {
              region: user.region ? Regions[user.region].name : undefined,
              sampledAt: format(updatedSample.sampledAt, 'dd/MM/yyyy'),
            },
            attachment: [
              {
                name: `DAP-${updatedSample.reference}-${sampleItem.itemNumber}.pdf`,
                content: doc.toString('base64'),
              },
            ],
          });
        }
      })
    );
  }

  await sampleRepository.update(updatedSample);

  response.status(constants.HTTP_STATUS_OK).send(updatedSample);
};

const storeSampleItemDocument = async (
  sample: Sample,
  sampleItem: SampleItem,
  sampler: UserInfos
) => {
  const client = new S3(config.s3.client);

  const pdfBuffer = await documentService.generateSupportDocument(
    sample,
    sampleItem,
    sampler
  );

  if (sampleItem.supportDocumentId) {
    console.info('Delete previous document', sampleItem.supportDocumentId);
    const deleteCommand = new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: sampleItem.supportDocumentId,
    });
    await client.send(deleteCommand);

    await sampleItemRepository.update(sample.id, sampleItem.itemNumber, {
      ...sampleItem,
      supportDocumentId: null,
    });

    await documentRepository.deleteOne(sampleItem.supportDocumentId);
  }

  const filename = `DAP-${sample.reference}-${sampleItem.itemNumber}.pdf`;
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
    kind: 'SupportDocument',
    createdBy: sample.sampler.id, //TODO : check if it's the right user
    createdAt: new Date(),
  });

  await sampleItemRepository.update(sample.id, sampleItem.itemNumber, {
    ...sampleItem,
    supportDocumentId: id,
  });

  return pdfBuffer;
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
  exportSamples,
  createSample,
  updateSample,
  deleteSample,
};
