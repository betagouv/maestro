import { format } from 'date-fns';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import ProgrammingPlanMissingError from '../../../shared/errors/promgrammingPlanMissingError';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../../shared/referential/QuantityUnit';
import { Region, Regions } from '../../../shared/referential/Region';
import { StageLabels } from '../../../shared/referential/Stage';
import { SubstanceLabel } from '../../../shared/referential/Substance/SubstanceLabels';
import { SubstanceListByMatrix } from '../../../shared/referential/Substance/SubstanceListByMatrix';
import { getSampleRegion, Sample } from '../../../shared/schema/Sample/Sample';
import { SampleItem } from '../../../shared/schema/Sample/SampleItem';
import { UserInfos } from '../../../shared/schema/User/User';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import {
  Template,
  templateContent,
  templateStylePath,
} from '../../templates/templates';
import config from '../../utils/config';

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
  sampleItem: SampleItem,
  sampler: UserInfos
) => {
  //TODO : handle sample outside any programming plan (ie sample.programmingPlanId is null)

  const programmingPlan = await programmingPlanRepository.findUnique(
    sample.programmingPlanId as string
  );

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(sample.programmingPlanId as string);
  }

  const laboratory = await laboratoryRepository.findUnique(sample.laboratoryId);

  const substances = SubstanceListByMatrix[sample.matrix]?.map(
    (substance) => SubstanceLabel[substance]
  );

  return generateDocument('supportDocument', {
    ...sample,
    ...sampleItem,
    sampler,
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
    establishment: Regions[getSampleRegion(sample) as Region].establishment,
  });
};

export default {
  generateSupportDocument,
};
