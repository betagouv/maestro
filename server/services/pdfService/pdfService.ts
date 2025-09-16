import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import fs from 'fs';
import handlebars from 'handlebars';
import { isNil } from 'lodash-es';
import PdfGenerationError from 'maestro-shared/errors/pdfGenerationError';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import UserMissingError from 'maestro-shared/errors/userMissingError';
import { getCultureKindLabel } from 'maestro-shared/referential/CultureKind';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { getMatrixPartLabel } from 'maestro-shared/referential/Matrix/MatrixPart';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { Regions } from 'maestro-shared/referential/Region';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  getSampleMatrixLabel,
  PartialSample
} from 'maestro-shared/schema/Sample/Sample';
import { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { formatWithTz, isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import puppeteer from 'puppeteer-core';
import { documentRepository } from '../../repositories/documentRepository';
import { laboratoryRepository } from '../../repositories/laboratoryRepository';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';
import { userRepository } from '../../repositories/userRepository';
import {
  assetsPath,
  Template,
  templateContent,
  templateStylePath
} from '../../templates/templates';
import config from '../../utils/config';

const generatePDF = async (template: Template, data: unknown) => {
  handlebars.registerHelper(
    'breaklines',
    (text) =>
      new handlebars.SafeString(
        handlebars.escapeExpression(text).replace(/(\r\n|\n|\r)/gm, '<br>')
      )
  );
  handlebars.registerHelper('eq', (a, b) => a === b);

  handlebars.registerHelper('inlineImage', (relativePath) => {
    const imagePath = assetsPath(relativePath);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/svg+xml;base64,${base64Image}`;
  });

  handlebars.registerHelper('inc', function (value) {
    return parseInt(value) + 1;
  });

  handlebars.registerHelper('or', function (a, b) {
    return a || b;
  });

  handlebars.registerHelper('and', function (a, b) {
    return a && b;
  });

  handlebars.registerHelper(
    'isDefinedArray',
    function (this: any, arr: any, options: any) {
      return Array.isArray(arr) ? options.fn(this) : options.inverse(this);
    }
  );

  const compiledTemplate = handlebars.compile(templateContent(template));
  const htmlContent = compiledTemplate(data);

  const launchArgs = JSON.stringify({
    args: ['--disable-web-security']
  });

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: `${config.browserlessUrl}&launch=${launchArgs}`
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
          .replaceAll('icons', `${config.serverUrl}/dsfr/dist/icons`)
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

    const pdfBuffer = Buffer.from(
      await page.pdf({
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
      })
    );
    await browser.close();
    return pdfBuffer;
  } catch (e: any) {
    console.error(e);
    throw new PdfGenerationError();
  }
};

const generateSampleSupportPDF = async (
  sample: PartialSample,
  sampleItems: PartialSampleItem[],
  itemNumber: number,
  fullVersion: boolean
) => {
  const programmingPlan = await programmingPlanRepository.findUnique(
    sample.programmingPlanId as string
  );

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(sample.programmingPlanId as string);
  }

  const sampler = await userRepository.findUnique(sample.sampler.id);
  if (!sampler) {
    throw new UserMissingError(sample.sampler.id);
  }

  const emptySampleItems: PartialSampleItem[] = new Array(
    programmingPlan.substanceKinds.length * 3
  )
    .fill(null)
    .map((_, index) => ({
      sampleId: sample.id,
      itemNumber: (index % programmingPlan.substanceKinds.length) + 1,
      copyNumber: Math.floor(index / programmingPlan.substanceKinds.length) + 1
    }));

  const sampleDocuments = await documentRepository.findMany({
    sampleId: sample.id
  });

  const currentSampleItem = sampleItems.find(
    (item) => item.itemNumber === itemNumber && item.copyNumber === 1
  );

  const laboratory = currentSampleItem?.laboratoryId
    ? await laboratoryRepository.findUnique(currentSampleItem.laboratoryId)
    : null;

  return generatePDF('supportDocument', {
    fullVersion,
    ...sample,
    sampleItems: (sampleItems.length > 0 ? sampleItems : emptySampleItems).map(
      (sampleItem) => ({
        ...sampleItem,
        quantityUnit: sampleItem?.quantityUnit
          ? QuantityUnitLabels[sampleItem.quantityUnit]
          : '',
        currentItem:
          sampleItem.itemNumber === itemNumber && sampleItem.copyNumber === 1
      })
    ),
    itemNumber,
    sampler,
    laboratory: !isNil(laboratory)
      ? {
          ...laboratory,
          fullName: getLaboratoryFullName(laboratory)
        }
      : null,
    monoSubstances: sample.monoSubstances?.map(
      (substance) => SSD2IdLabel[substance]
    ),
    multiSubstances: sample.multiSubstances?.map(
      (substance) => SSD2IdLabel[substance]
    ),
    reference: [sample.reference, itemNumber] //TODO
      .filter(isDefinedAndNotNull)
      .join('-'),
    ...(sample.sampledAt
      ? {
          sampledAt: formatWithTz(
            sample.sampledAt,
            "eeee dd MMMM yyyy à HH'h'mm"
          ),
          sampledAtDate: format(sample.sampledAt, 'dd/MM/yyyy', { locale: fr }),
          sampledAtTime: formatWithTz(sample.sampledAt, 'HH:mm')
        }
      : {}),
    context: sample.context ? ContextLabels[sample.context] : '',
    legalContext: sample.legalContext
      ? LegalContextLabels[sample.legalContext]
      : '',
    stage: sample.stage ? StageLabels[sample.stage] : '',
    matrixKind: sample.matrixKind ? MatrixKindLabels[sample.matrixKind] : '',
    matrix: getSampleMatrixLabel(sample),
    matrixDetails:
      sample.specificData?.programmingPlanKind === 'PPV'
        ? sample.specificData?.matrixDetails
        : undefined,
    matrixPart: getMatrixPartLabel(sample),
    cultureKind: getCultureKindLabel(sample),
    releaseControl:
      sample.specificData?.programmingPlanKind === 'PPV'
        ? sample.specificData.releaseControl
          ? 'Oui'
          : 'Non'
        : undefined,
    establishment: Regions[sample.region].establishment,
    department: sample.department ? DepartmentLabels[sample.department] : '',
    hasNoteToSampler:
      sampleItems.some(
        (sampleItem) => sampleItem.recipientKind === 'Sampler'
      ) || sampleItems.length === 0,
    sampleDocuments
  });
};

export const pdfService = {
  generateSampleSupportPDF
};
