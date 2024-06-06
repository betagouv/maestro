import { format } from 'date-fns';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import ProgrammingPlanMissingError from '../../../shared/errors/promgrammingPlanMissingError';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../../shared/referential/QuantityUnit';
import { StageLabels } from '../../../shared/referential/Stage';
import { SubstanceLabel } from '../../../shared/referential/Substance/SubstanceLabels';
import { SubstanceListByMatrix } from '../../../shared/referential/Substance/SubstanceListByMatrix';
import { getSampleRegion, Sample } from '../../../shared/schema/Sample/Sample';
import { SampleItem } from '../../../shared/schema/Sample/SampleItem';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import prescriptionRepository from '../../repositories/prescriptionRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import {
  SampleItemDocumentFileContent,
  SampleItemDocumentStylePath,
} from '../../templates/sampleItemDocument';
import config from '../../utils/config';

const generateSampleItemDocument = async (
  sample: Sample,
  sampleItem: SampleItem
) => {
  //TODO : handle sample outside any programming plan (ie sample.programmingPlanId is null)

  const programmingPlan = await programmingPlanRepository.findUnique(
    sample.programmingPlanId as string
  );

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(sample.programmingPlanId as string);
  }

  const prescriptions = await prescriptionRepository.findMany({
    region: getSampleRegion(sample),
    programmingPlanId: sample.programmingPlanId as string,
    matrix: sample.matrix,
    stage: sample.stage,
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

  const substances = SubstanceListByMatrix[sample.matrix]?.map(
    (substance) => SubstanceLabel[substance]
  );

  const compiledTemplate = handlebars.compile(SampleItemDocumentFileContent);
  const htmlContent = compiledTemplate({
    ...sample,
    ...sampleItem,
    laboratory,
    programmingPlan,
    substances,
    reference: [sample.reference, sampleItem.itemNumber].join('-'),
    sampledAt: format(sample.sampledAt, 'dd/MM/yyyy'),
    stage: StageLabels[sample.stage],
    matrix: MatrixLabels[sample.matrix],
    matrixDetails: sample.matrixDetails,
    matrixPart: MatrixPartLabels[sample.matrixPart],
    quantityUnit: QuantityUnitLabels[sampleItem.quantityUnit],
    releaseControl: sample.releaseControl ? 'Oui' : 'Non',
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

  return pdfBuffer;
};

export default {
  generateSampleItemDocument,
};
