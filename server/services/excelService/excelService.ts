import { format } from 'date-fns';
import exceljs from 'exceljs';
import { LegalContextLabels } from '../../../shared/referential/LegalContext';
import { Regions } from '../../../shared/referential/Region';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { UserInfos } from '../../../shared/schema/User/User';
import { isDefined } from '../../../shared/utils/utils';
import Workbook = exceljs.Workbook;

const writeToWorkbook = async (
  sample: Sample,
  // sampleItem: SampleItem,
  sampler: UserInfos,
  workbook: Workbook
) => {
  // const programmingPlan = await programmingPlanRepository.findUnique(
  //   sample.programmingPlanId as string
  // );
  //
  // if (!programmingPlan) {
  //   throw new ProgrammingPlanMissingError(sample.programmingPlanId as string);
  // }
  //
  // const laboratory = sample.laboratoryId
  //   ? await laboratoryRepository.findUnique(sample.laboratoryId)
  //   : null;
  //
  // const prescriptionSubstances = sample.prescriptionId
  //   ? await prescriptionSubstanceRepository.findMany(sample.prescriptionId)
  //   : undefined;
  //
  // const laboratories = await laboratoryRepository.findMany();

  const establishment = Regions[sample.region].establishment;

  const worksheet = workbook.addWorksheet('Prélèvement');
  const firstColumn = 'A';
  const lastColumn = 'B';

  const headerRow = worksheet.addRow(["Demande d'Analyse Informatisée"]);
  headerRow.getCell(1).alignment = {
    horizontal: 'center'
  };
  headerRow.getCell(1).border = thickBorders;
  worksheet.mergeCells(
    `${firstColumn}${headerRow.number}:${lastColumn}${headerRow.number}`
  );

  addEmptyRow(worksheet, firstColumn, lastColumn);

  const establishmentHeaderRow = worksheet.addRow([
    "Donneur d'ordre",
    'Adresse'
  ]);
  addHeaderStyle(establishmentHeaderRow);
  worksheet.addRow([
    establishment?.name,
    [
      establishment?.additionalAddress,
      establishment?.street,
      `${establishment?.postalCode} ${establishment?.city}`
    ]
      .filter(isDefined)
      .join('\n')
  ]);

  addEmptyRow(worksheet, firstColumn, lastColumn);

  const samplerHeaderRow = worksheet.addRow(['Préleveur', 'Email']);
  addHeaderStyle(samplerHeaderRow);
  worksheet.addRow([`${sampler.firstName} ${sampler.lastName}`, sampler.email]);

  addEmptyRow(worksheet, firstColumn, lastColumn);

  const sampleHeaderRow1 = worksheet.addRow([
    'Date de prélèvement',
    'Contexte juridique'
  ]);
  addHeaderStyle(sampleHeaderRow1);
  worksheet.addRow([
    format(sample.sampledAt, 'dd/MM/yyyy'),
    LegalContextLabels[sample.legalContext]
  ]);

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { ...cell.alignment, vertical: 'middle' };
    });
  });

  worksheet.getColumn(1).width = 50;
  worksheet.getColumn(2).width = 50;
  worksheet.getRow(1).height = 50;
};

const thickBorders = {
  top: { style: 'thick' },
  left: { style: 'thick' },
  bottom: { style: 'thick' },
  right: { style: 'thick' }
} as exceljs.Borders;

const thinBorders = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
} as exceljs.Borders;

const greyFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD9D9D9' }
} as exceljs.Fill;

const addEmptyRow = (
  worksheet: exceljs.Worksheet,
  firstColumn: string,
  lastColumn: string
) => {
  const emptyRow = worksheet.addRow([]);
  worksheet.mergeCells(
    `${firstColumn}${emptyRow.number}:${lastColumn}${emptyRow.number}`
  );
};

const addHeaderStyle = (row: exceljs.Row) => {
  row.eachCell((cell) => {
    cell.border = thinBorders;
    cell.fill = greyFill;
  });
};

export default {
  writeToWorkbook
};
