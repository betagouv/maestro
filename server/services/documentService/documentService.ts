import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { format } from 'date-fns';
import handlebars from 'handlebars';
import { Readable } from 'node:stream';
import pdf from 'pdf-parse';
import puppeteer from 'puppeteer';
import DocumentMissingError from '../../../shared/errors/documentMissingError';
import ProgrammingPlanMissingError from '../../../shared/errors/promgrammingPlanMissingError';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../../shared/referential/QuantityUnit';
import { Region, Regions } from '../../../shared/referential/Region';
import { StageLabels } from '../../../shared/referential/Stage';
import { getSampleRegion, Sample } from '../../../shared/schema/Sample/Sample';
import { PartialSampleItem } from '../../../shared/schema/Sample/SampleItem';
import { UserInfos } from '../../../shared/schema/User/User';
import { isDefinedAndNotNull } from '../../../shared/utils/utils';
import documentRepository from '../../repositories/documentRepository';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import substanceAnalysisRepository from '../../repositories/substanceRepository';
import {
  Template,
  templateContent,
  templateStylePath,
} from '../../templates/templates';
import config from '../../utils/config';
import { streamToBuffer } from '../../utils/steamUtils';

const generateDocument = async (template: Template, data: any) => {
  const compiledTemplate = handlebars.compile(templateContent(template));
  const htmlContent = compiledTemplate(data);

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
    path: templateStylePath(template),
  });

  const pdfBuffer = await page.pdf({
    printBackground: true,
  });
  await browser.close();

  return pdfBuffer;
};

const generateSupportDocument = async (
  sample: Sample,
  sampleItem: PartialSampleItem | null,
  sampler: UserInfos
) => {
  const programmingPlan = await programmingPlanRepository.findUnique(
    sample.programmingPlanId as string
  );

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(sample.programmingPlanId as string);
  }

  const laboratory = sample.laboratoryId
    ? await laboratoryRepository.findUnique(sample.laboratoryId)
    : null;

  const substanceAnalysis =
    sample.matrix && sample.sampledAt
      ? await substanceAnalysisRepository.findMany({
          matrix: sample.matrix,
          year: sample.sampledAt.getFullYear(),
        })
      : null;

  return generateDocument('supportDocument', {
    ...sample,
    ...sampleItem,
    sampler,
    laboratory,
    programmingPlan,
    monoSubstances: substanceAnalysis
      ?.filter((analysis) => analysis.kind === 'Mono')
      .map((analysis) => analysis.substance.label),
    multiSubstances: substanceAnalysis
      ?.filter((analysis) => analysis.kind === 'Multi')
      .map((analysis) => analysis.substance.label),
    reference: [sample.reference, sampleItem?.itemNumber]
      .filter(isDefinedAndNotNull)
      .join('-'),
    sampledAt: format(sample.sampledAt, 'dd/MM/yyyy'),
    stage: StageLabels[sample.stage],
    matrix: MatrixLabels[sample.matrix],
    matrixDetails: sample.matrixDetails,
    matrixPart: MatrixPartLabels[sample.matrixPart],
    quantityUnit: sampleItem?.quantityUnit
      ? QuantityUnitLabels[sampleItem.quantityUnit]
      : '',
    releaseControl: sample.releaseControl ? 'Oui' : 'Non',
    compliance200263: sampleItem
      ? sampleItem.compliance200263
        ? 'Oui'
        : 'Non'
      : '',
    dsfrLink: `${config.application.host}/dsfr/dsfr.min.css`,
    establishment: Regions[getSampleRegion(sample) as Region].establishment,
  });
};

const getDocumentContent = async (reportDocumentId: string) => {
  const document = await documentRepository.findUnique(reportDocumentId);

  if (!document) {
    throw new DocumentMissingError(reportDocumentId);
  }

  const client = new S3(config.s3.client);
  const key = `${document.id}_${document.filename}`;

  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });

  const responseStream = await client.send(command);

  const data = await streamToBuffer(responseStream.Body as Readable);

  const result = await pdf(data);

  return result.text;
};

export default {
  generateSupportDocument,
  getDocumentContent,
};
