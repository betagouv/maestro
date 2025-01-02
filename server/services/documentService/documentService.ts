import { format } from 'date-fns';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import ProgrammingPlanMissingError from '../../../shared/errors/programmingPlanMissingError';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../../shared/referential/QuantityUnit';
import { Regions } from '../../../shared/referential/Region';
import { StageLabels } from '../../../shared/referential/Stage';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { PartialSampleItem } from '../../../shared/schema/Sample/SampleItem';
import { UserInfos } from '../../../shared/schema/User/User';
import { isDefinedAndNotNull } from '../../../shared/utils/utils';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import prescriptionSubstanceRepository from '../../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import {
  Template,
  templateContent,
  templateStylePath
} from '../../templates/templates';
import config from '../../utils/config';

const generateDocument = async (template: Template, data: any) => {
  const compiledTemplate = handlebars.compile(templateContent(template));
  const htmlContent = compiledTemplate(data);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
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
    )
  });

  await page.addStyleTag({
    path: templateStylePath(template)
  });

  const pdfBuffer = await page.pdf({
    printBackground: true
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

  const prescriptionSubstances = sample.prescriptionId
    ? await prescriptionSubstanceRepository.findMany(sample.prescriptionId)
    : undefined;

  return generateDocument('supportDocument', {
    ...sample,
    ...sampleItem,
    sampler,
    laboratory,
    programmingPlan,
    monoSubstances: prescriptionSubstances
      ?.filter((substance) => substance.analysisKind === 'Mono')
      .map((substance) => substance.substance.label),
    multiSubstances: prescriptionSubstances
      ?.filter((substance) => substance.analysisKind === 'Multi')
      .map((substance) => substance.substance.label),
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
    establishment: Regions[sample.region].establishment
  });
};

export default {
  generateSupportDocument
};
