import { format } from 'date-fns';
import { Request, Response } from 'express';
import { AuthenticatedRequest, SampleRequest } from 'express-jwt';
import { constants } from 'http2';
import { isNil, omitBy, pick } from 'lodash-es';
import { Regions } from 'maestro-shared/referential/Region';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  PartialSampleToCreate,
  Sample
} from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { User } from 'maestro-shared/schema/User/User';
import {
  getAnalysisReportDocumentFilename,
  getSupportDocumentFilename
} from '../../shared/schema/Document/DocumentKind';
import companyRepository from '../repositories/companyRepository';
import laboratoryRepository from '../repositories/laboratoryRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import { documentService } from '../services/documentService/documentService';
import excelService from '../services/excelService/excelService';
import exportSamplesService from '../services/exportService/exportSamplesService';
import { mailService } from '../services/mailService';
import { pdfService } from '../services/pdfService/pdfService';
import config from '../utils/config';
import workbookUtils from '../utils/workbookUtils';

const getSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample;

  console.info('Get sample', sample.id);

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  response.status(constants.HTTP_STATUS_OK).send({
    ...sample,
    items: sampleItems.map((item) => omitBy(item, isNil))
  });
};

const getSampleItemDocument = async (request: Request, response: Response) => {
  const sample: Sample = (request as SampleRequest).sample;
  const itemNumber = Number(request.params.itemNumber);
  const { user } = request as AuthenticatedRequest;

  console.info('Get sample document', sample.id);

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  const pdfBuffer = await pdfService.generateSampleSupportPDF(
    sample,
    sampleItems,
    itemNumber,
    user
  );

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader(
    'Content-Disposition',
    `inline; filename="${getSupportDocumentFilename(sample, itemNumber)}"`
  );
  response.send(pdfBuffer);
};

const findSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = FindSampleOptions.parse(request.query);

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region
  };

  console.info('Find samples for user', user.id, findOptions);

  const samples = await sampleRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(samples);
};

const countSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = FindSampleOptions.parse(request.query);

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region
  };

  console.info('Count samples for user', user.id, findOptions);

  const count = await sampleRepository.count(findOptions);

  response.status(constants.HTTP_STATUS_OK).send({ count });
};

const exportSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = FindSampleOptions.parse(request.query);

  const findOptions = {
    ...queryFindOptions,
    region: user.region ?? queryFindOptions.region
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
    region: user.region,
    reference: `${Regions[user.region].shortName}-${
      sampleToCreate.department
    }-${format(new Date(), 'yy')}-${String(serial).padStart(4, '0')}-${
      sampleToCreate.legalContext
    }`,
    sampler: pick(user, ['id', 'firstName', 'lastName']),
    createdAt: new Date(),
    lastUpdatedAt: new Date()
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
    lastUpdatedAt: new Date()
  };

  if (sample.status === 'Submitted' && updatedSample.status === 'Sent') {
    const sampleItems = await sampleItemRepository.findMany(sample.id);

    await Promise.all(
      sampleItems.map(async (sampleItem) => {
        const sampleSupportDoc = await generateAndStoreSampleSupportDocument(
          updatedSample as Sample,
          sampleItems as SampleItem[],
          sampleItem.itemNumber,
          user
        );

        if (sampleItem.itemNumber === 1) {
          const analysisRequestDoc =
            await generateAndStoreAnalysisRequestDocument(
              updatedSample as Sample,
              sampleItem as SampleItem,
              user
            );

          const laboratory = (await laboratoryRepository.findUnique(
            updatedSample.laboratoryId as string
          )) as Laboratory;

          await mailService.sendAnalysisRequest({
            recipients: [laboratory?.email, config.mail.from],
            params: {
              region: user.region ? Regions[user.region].name : undefined,
              userMail: user.email,
              sampledAt: format(updatedSample.sampledAt, 'dd/MM/yyyy')
            },
            attachment: [
              {
                name: `${getSupportDocumentFilename(
                  updatedSample,
                  sampleItem.itemNumber
                )}`,
                content: sampleSupportDoc.toString('base64')
              },
              {
                name: `${getAnalysisReportDocumentFilename(
                  updatedSample,
                  sampleItem.itemNumber
                )}`,
                content: Buffer.from(analysisRequestDoc).toString('base64')
              }
            ]
          });
        }

        if (sample.ownerEmail) {
          await mailService.sendSupportDocumentCopyToOwner({
            recipients: [sample.ownerEmail, config.mail.from],
            params: {
              region: user.region ? Regions[user.region].name : undefined,
              sampledAt: format(updatedSample.sampledAt, 'dd/MM/yyyy')
            },
            attachment: [
              {
                name: `${getSupportDocumentFilename(
                  updatedSample,
                  sampleItem.itemNumber
                )}`,
                content: sampleSupportDoc.toString('base64')
              }
            ]
          });
        }
      })
    );
  }

  await sampleRepository.update(updatedSample);

  response.status(constants.HTTP_STATUS_OK).send(updatedSample);
};

const generateAndStoreSampleSupportDocument = async (
  sample: Sample,
  sampleItems: SampleItem[],
  itemNumber: number,
  sampler: User
) => {
  const pdfBuffer = await pdfService.generateSampleSupportPDF(
    sample,
    sampleItems,
    itemNumber,
    sampler
  );

  const sampleItem = sampleItems.find((item) => item.itemNumber === itemNumber);

  if (!sampleItem) {
    throw new Error(`Sample item ${itemNumber} not found`);
  }

  if (sampleItem.supportDocumentId) {
    console.info('Delete previous document', sampleItem.supportDocumentId);
    await sampleItemRepository.update(sample.id, sampleItem.itemNumber, {
      ...sampleItem,
      supportDocumentId: null
    });
    await documentService.deleteDocument(sampleItem.supportDocumentId);
  }

  const documentId = await documentService.createDocument(
    getSupportDocumentFilename(sample, sampleItem.itemNumber),
    'SupportDocument',
    pdfBuffer,
    sampler.id
  );

  await sampleItemRepository.update(sample.id, sampleItem.itemNumber, {
    ...sampleItem,
    supportDocumentId: documentId
  });

  return pdfBuffer;
};

const generateAndStoreAnalysisRequestDocument = async (
  sample: Sample,
  sampleItem: SampleItem,
  sampler: User
) => {
  const filename = getAnalysisReportDocumentFilename(
    sample,
    sampleItem.itemNumber
  );

  const excelBuffer = await excelService.generateAnalysisRequestExcel(
    sample as Sample,
    sampleItem as SampleItem,
    sampler
  );

  await documentService.createDocument(
    filename,
    'AnalysisRequestDocument',
    new Uint8Array(excelBuffer),
    sampler.id
  );

  return excelBuffer;
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
  deleteSample
};
