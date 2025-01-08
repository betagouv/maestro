import { format } from 'date-fns';
import { default as exceljs, default as ExcelJS } from 'exceljs';
import { CultureKindLabels } from '../../../shared/referential/CultureKind';
import { LegalContextLabels } from '../../../shared/referential/LegalContext';
import { MatrixLabels } from '../../../shared/referential/Matrix/MatrixLabels';
import { MatrixPartLabels } from '../../../shared/referential/MatrixPart';
import { QuantityUnitLabels } from '../../../shared/referential/QuantityUnit';
import { Regions } from '../../../shared/referential/Region';
import { StageLabels } from '../../../shared/referential/Stage';
import { ContextLabels } from '../../../shared/schema/ProgrammingPlan/Context';
import { Sample } from '../../../shared/schema/Sample/Sample';
import { SampleItem } from '../../../shared/schema/Sample/SampleItem';
import { UserInfos } from '../../../shared/schema/User/User';
import { isDefined } from '../../../shared/utils/utils';
import laboratoryRepository from '../../repositories/laboratoryRepository';
import prescriptionSubstanceRepository from '../../repositories/prescriptionSubstanceRepository';

const generateAnalysisRequestExcel = async (
  sample: Sample,
  sampleItem: SampleItem,
  sampler: UserInfos
) => {
  const workbook = new ExcelJS.Workbook();

  const laboratory = await laboratoryRepository.findUnique(sample.laboratoryId);

  const prescriptionSubstances = await prescriptionSubstanceRepository.findMany(
    sample.prescriptionId
  );

  const establishment = Regions[sample.region].establishment;

  const worksheet = workbook.addWorksheet('Prélèvement');

  addRow(worksheet, ["Demande d'Analyse Informatisée"]);
  worksheet.getRow(1).getCell(1).alignment = {
    horizontal: 'center'
  };
  worksheet.getRow(1).getCell(1).border = thickBorders;

  addEmptyRow(worksheet);

  addHeaderRow(worksheet, ["Donneur d'ordre", 'Adresse']);
  addRow(worksheet, [
    establishment.name,
    [
      establishment.additionalAddress,
      establishment.street,
      `${establishment.postalCode} ${establishment.city}`
    ]
      .filter(isDefined)
      .join('\n')
  ]);

  addEmptyRow(worksheet);

  addHeaderRow(worksheet, ['Préleveur', 'Email']);
  addRow(worksheet, [
    `${sampler.firstName} ${sampler.lastName}`,
    sampler.email
  ]);

  addEmptyRow(worksheet);

  addHeaderRow(worksheet, [
    'Date de prélèvement',
    'Heure de prélèvement',
    'Contexte du prélèvement'
  ]);
  addRow(worksheet, [
    format(sample.sampledAt, 'dd/MM/yyyy'),
    format(sample.sampledAt, 'HH:mm'),
    ContextLabels[sample.context]
  ]);
  addHeaderRow(worksheet, ['Numéro de prélèvement', 'Cadre juridique']);
  addRow(worksheet, [
    sample.reference,
    LegalContextLabels[sample.legalContext]
  ]);

  addEmptyRow(worksheet);

  addHeaderRow(worksheet, ['Entité contrôlée', 'Siret']);
  addRow(worksheet, [sample.company.name, sample.company.siret]);
  addHeaderRow(worksheet, ['Identifiant Resytal', 'Département']);
  addRow(worksheet, [sample.resytalId, sample.department]);
  addHeaderRow(worksheet, ['Adresse', 'N° ou appellation de la parcelle']);
  addRow(worksheet, [
    [
      sample.company.address,
      `${sample.company.postalCode} ${sample.company.city}`
    ].join('\n'),
    sample.parcel
  ]);

  //TODO note additionnelle ?

  addEmptyRow(worksheet);

  addHeaderRow(worksheet, ['Matrice', 'Code matrice']);
  addRow(worksheet, [MatrixLabels[sample.matrix], sample.matrix]);
  addHeaderRow(worksheet, [
    'LMR/ Partie du végétal concernée',
    'Détails de la matrice'
  ]);
  addRow(worksheet, [
    MatrixPartLabels[sample.matrixPart],
    sample.matrixDetails
  ]);
  addHeaderRow(worksheet, ['Type de culture', 'Stade de prélèvement']);
  addRow(worksheet, [
    sample.cultureKind ? CultureKindLabels[sample.cultureKind] : EmptyCell,
    StageLabels[sample.stage]
  ]);
  addHeaderRow(worksheet, [
    sample.releaseControl ? 'Type de contrôle' : EmptyCell,
    'Laboratoire destinataire'
  ]);
  addRow(worksheet, [
    sample.releaseControl ? 'Contrôle libératoire' : EmptyCell,
    laboratory?.name
  ]);

  addEmptyRow(worksheet);

  addHeaderRow(worksheet, ['Analyses mono-résidu']);
  prescriptionSubstances
    .filter((_) => _.analysisKind === 'Mono')
    .forEach((prescriptionSubstance) => {
      addRow(worksheet, [prescriptionSubstance.substance.label]);
    });
  addHeaderRow(worksheet, ['Analyses multi-résidus dont :']);
  prescriptionSubstances
    .filter((_) => _.analysisKind === 'Multi')
    .forEach((prescriptionSubstance) => {
      addRow(worksheet, [prescriptionSubstance.substance.label]);
    });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { ...cell.alignment, vertical: 'middle' };
    });
  });

  addEmptyRow(worksheet);

  addHeaderRow(worksheet, [`Échantillon n°${sampleItem.itemNumber}`]);
  addHeaderRow(worksheet, [
    'Nombre',
    'Unité de mesure',
    'Numéro de scellé',
    'Directive 2002/63'
  ]);
  addRow(worksheet, [
    sampleItem.quantity.toString(),
    QuantityUnitLabels[sampleItem.quantityUnit],
    sampleItem.sealId,
    sampleItem.compliance200263 ? 'Respectée' : 'Non respectée'
  ]);

  worksheet.getColumn(1).width = 25;
  worksheet.getColumn(2).width = 25;
  worksheet.getColumn(3).width = 25;
  worksheet.getColumn(4).width = 25;
  worksheet.getRow(1).height = 50;

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
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

const addHeaderStyle = (row: exceljs.Row) => {
  row.eachCell((cell) => {
    cell.border = thinBorders;
    cell.fill = greyFill;
  });
};

const EmptyCell = '';

type CellRangeKey = 'AB' | 'CD' | 'AD';

const CellRange: Record<
  CellRangeKey,
  {
    start: string;
    end: string;
  }
> = {
  AB: {
    start: 'A',
    end: 'B'
  },
  CD: {
    start: 'C',
    end: 'D'
  },
  AD: {
    start: 'A',
    end: 'D'
  }
};

const mergeCells = (
  worksheet: exceljs.Worksheet,
  rowNumber: number,
  cellRangeKey: CellRangeKey
) => {
  worksheet.mergeCells(
    `${CellRange[cellRangeKey].start}${rowNumber}:${CellRange[cellRangeKey].end}${rowNumber}`
  );
};

const addEmptyRow = (worksheet: exceljs.Worksheet) => {
  const emptyRow = worksheet.addRow([]);
  mergeCells(worksheet, emptyRow.number, 'AD');
};

const completeColumns = (columns: string[]) =>
  columns.length === 1
    ? [columns[0], EmptyCell, EmptyCell, EmptyCell]
    : columns.length === 2
      ? [columns[0], EmptyCell, columns[1], EmptyCell]
      : columns.length === 3
        ? [columns[0], columns[1], columns[2], EmptyCell]
        : columns;

const mergeColumns = (
  worksheet: exceljs.Worksheet,
  rowNumber: number,
  columnLength: number
) => {
  if (columnLength === 1) {
    mergeCells(worksheet, rowNumber, 'AD');
  } else if (columnLength === 2) {
    mergeCells(worksheet, rowNumber, 'AB');
    mergeCells(worksheet, rowNumber, 'CD');
  } else if (columnLength === 3) {
    mergeCells(worksheet, rowNumber, 'CD');
  }
};

const addHeaderRow = (worksheet: exceljs.Worksheet, columns: string[]) => {
  const headerRow = worksheet.addRow(completeColumns(columns));
  addHeaderStyle(headerRow);
  mergeColumns(worksheet, headerRow.number, columns.length);
};

const addRow = (
  worksheet: exceljs.Worksheet,
  columns: (string | null | undefined)[]
) => {
  const row = worksheet.addRow(
    completeColumns(columns.map((_) => _ || EmptyCell))
  );
  mergeColumns(worksheet, row.number, columns.length);
};

export default {
  generateAnalysisRequestExcel
};
