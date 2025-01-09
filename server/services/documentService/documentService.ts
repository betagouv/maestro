import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import fs from 'fs';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import ProgrammingPlanMissingError from '../../../shared/errors/programmingPlanMissingError';
import { DepartmentLabels } from '../../../shared/referential/Department';
import { LegalContextLabels } from '../../../shared/referential/LegalContext';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../../shared/referential/QuantityUnit';
import { Regions } from '../../../shared/referential/Region';
import { StageLabels } from '../../../shared/referential/Stage';
import { ContextLabels } from '../../../shared/schema/ProgrammingPlan/Context';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { PartialSampleItem } from '../../../shared/schema/Sample/SampleItem';
import { User } from '../../../shared/schema/User/User';
import { isDefinedAndNotNull } from '../../../shared/utils/utils';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import prescriptionSubstanceRepository from '../../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import {
  assetsPath,
  Template,
  templateContent,
  templateStylePath
} from '../../templates/templates';
import config from '../../utils/config';
const generateDocument = async (template: Template, data: any) => {
  handlebars.registerHelper(
    'breaklines',
    (text) =>
      new handlebars.SafeString(
        handlebars.escapeExpression(text).replace(/(\r\n|\n|\r)/gm, '<br>')
      )
  );

  handlebars.registerHelper('inlineImage', (relativePath) => {
    const imagePath = assetsPath(relativePath);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/svg+xml;base64,${base64Image}`;
  });

  const compiledTemplate = handlebars.compile(templateContent(template));
  const htmlContent = compiledTemplate(data);

  const browser = await puppeteer.launch({
    args: ['--disable-web-security']
  });
  const page = await browser.newPage();
  await page.emulateMediaType('print');
  await page.setContent(htmlContent);
  const dsfrStyleSheet = await fetch(
    `${config.serverUrl}/dsfr/dist/dsfr.min.css`
  )
    .then((response) => response.text())
    .then((utilityStyleSheet) =>
      utilityStyleSheet
        .replaceAll('../icons', `${config.serverUrl}/dsfr/dist/icons`)
        .replaceAll(
          'fonts/Marianne',
          `${config.serverUrl}/dsfr/dist/fonts/Marianne`
        )
    );

  const utilityStyleSheet = await fetch(
    `${config.serverUrl}/dsfr/dist/utility/utility.min.css`
  )
    .then((response) => response.text())
    .then((utilityStyleSheet) =>
      utilityStyleSheet.replaceAll(
        '../icons',
        `${config.serverUrl}/dsfr/dist/icons`
      )
    );

  await page.addStyleTag({
    content: dsfrStyleSheet.replaceAll(
      '@media (min-width: 62em)',
      '@media (min-width: 48em)'
    )
  });
  await page.addStyleTag({
    content: utilityStyleSheet
  });

  await page.addStyleTag({
    path: templateStylePath(template)
  });

  const pdfBuffer = await page.pdf({
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate: `
      <style>
        footer {
          text-align: center;
          width: 100%;
          font-size:14px; 
          line-height:1;
        }
      </style>
      <footer>
        <span class="pageNumber"></span> sur <span class="totalPages"></span>
      </footer>`,
    margin: {
      bottom: '40px'
    }
  });
  await browser.close();

  return pdfBuffer;
};

const generateSupportDocument = async (
  sample: Sample,
  sampleItem: PartialSampleItem | null,
  sampler: User
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
    monoSubstances: prescriptionSubstances
      ?.filter((substance) => substance.analysisMethod === 'Mono')
      .map((substance) => substance.substance.label),
    multiSubstances: prescriptionSubstances
      ?.filter((substance) => substance.analysisMethod === 'Multi')
      .map((substance) => substance.substance.label),
    reference: [sample.reference, sampleItem?.itemNumber]
      .filter(isDefinedAndNotNull)
      .join('-'),
    sampledAt: format(sample.sampledAt, "eeee dd MMMM yyyy à HH'h'mm", {
      locale: fr
    }),
    sampledAtDate: format(sample.sampledAt, 'dd/MM/yyyy', { locale: fr }),
    sampledAtTime: format(sample.sampledAt, 'HH:mm', { locale: fr }),
    context: ContextLabels[sample.context],
    legalContext: LegalContextLabels[sample.legalContext],
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
        ? 'Respectée'
        : 'Non respectée'
      : '',
    isSecondSampleItem: sampleItem?.itemNumber === 2,
    establishment: Regions[sample.region].establishment,
    department: DepartmentLabels[sample.department]
  });
};

export const documentService = {
  generateSupportDocument
};
