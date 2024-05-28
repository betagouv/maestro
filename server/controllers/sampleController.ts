import { format } from 'date-fns';
import { Request, Response } from 'express';
import { AuthenticatedRequest, SampleRequest } from 'express-jwt';
import * as handlebars from 'handlebars';
import { constants } from 'http2';
import fp from 'lodash';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { MatrixLabels } from '../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../shared/referential/QuantityUnit';
import { StageLabels } from '../../shared/referential/Stage';
import { FindSampleOptions } from '../../shared/schema/Sample/FindSampleOptions';
import {
  CreatedSample,
  getSampleRegion,
  PartialSample,
  Sample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import { SampleItem } from '../../shared/schema/Sample/SampleItem';
import { DraftStatusList } from '../../shared/schema/Sample/SampleStatus';
import laboratoryRepository from '../repositories/laboratoryRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import sampleRepository from '../repositories/sampleRepository';
import {
  SampleItemDocumentFileContent,
  SampleItemDocumentStylePath,
} from '../templates/sampleItemDocument';
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

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  if (itemNumber > sampleItems.length) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  const programmingPlan = await programmingPlanRepository.findUnique(
    sample.programmingPlanId
  );

  if (!programmingPlan) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  const prescriptions = await prescriptionRepository.findMany({
    region: getSampleRegion(sample),
    programmingPlanId: sample.programmingPlanId,
    sampleMatrix: sample.matrix,
    sampleStage: sample.stage,
  });

  //TODO: handle prescription or laboratory not found
  // if (
  //   !prescriptions ||
  //   prescriptions.length === 0 ||
  //   !prescriptions[0].laboratoryId
  // ) {
  //   return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  // }

  const laboratory = prescriptions[0]?.laboratoryId
    ? await laboratoryRepository.findUnique(prescriptions[0].laboratoryId)
    : await laboratoryRepository
        .findMany()
        .then((laboratories) => laboratories[0]);

  const sampleItem = sampleItems[itemNumber - 1];
  const compiledTemplate = handlebars.compile(SampleItemDocumentFileContent);
  const htmlContent = compiledTemplate({
    ...sample,
    ...sampleItem,
    laboratory,
    programmingPlan,
    reference: [sample.reference, itemNumber].join('-'),
    sampledAt: format(sample.sampledAt, 'dd/MM/yyyy'),
    expiryDate: sample.expiryDate
      ? format(sample.expiryDate, 'dd/MM/yyyy')
      : '',
    stage: StageLabels[sample.stage],
    matrix: MatrixLabels[sample.matrix],
    matrixDetails: sample.matrixDetails,
    matrixPart: MatrixPartLabels[sample.matrixPart],
    quantityUnit: QuantityUnitLabels[sampleItem.quantityUnit],
    releaseControl: sample.releaseControl ? 'Oui' : 'Non',
    temperatureMaintenance: sample.temperatureMaintenance ? 'Oui' : 'Non',
    comment: sample.comment ?? 'Aucun',
    compliance200263: sampleItem.compliance200263 ? 'Oui' : 'Non',
    dsfrLink: `${config.application.host}/dsfr/dsfr.min.css`,
  });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.emulateMediaType('screen');
  await page.setContent(htmlContent);

  const dsfrStyles = await fetch(
    `${config.application.host}/dsfr/dsfr.min.css`
  ).then((response) => response.text());

  await page.addStyleTag({
    content: dsfrStyles.replaceAll(
      '@media (min-width: 62em)',
      '@media (min-width: 48em)'
    ),
  });

  await page.addStyleTag({
    path: SampleItemDocumentStylePath,
  });

  const pdfBuffer = await page.pdf({
    printBackground: true,
  });
  await browser.close();

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader(
    'Content-Disposition',
    'inline; filename="generated-pdf.pdf"'
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
  getSampleItemDocument,
  findSamples,
  countSamples,
  createSample,
  updateSample,
  updateSampleItems,
  deleteSample,
};
