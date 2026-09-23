import XLSX from '@e965/xlsx';
import { parse } from 'csv-parse/sync';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';

interface ImportedCell {
  rowNumber: number;
  subPlanNumber: string;
  region: Region;
  sampleCount: number;
}

interface ImportedTotal {
  rowNumber: number;
  subPlanNumber: string;
  sampleCount: number;
}

interface ParsedImportFile {
  cells: ImportedCell[];
  totals: ImportedTotal[];
  unrecognized: string[];
}

const HEADER_ROW_NUMBER = 1;

const TOTAL_COLUMN_HEADER = 'total national programmé';

const IGNORED_COLUMN_HEADERS = [
  'domaine',
  'plan',
  'contexte',
  'matrice',
  'stade(s) de prélèvement',
  'consignes de répartition',
  'notes'
];

const columnLetter = (columnIndex: number): string => {
  let index = columnIndex;
  let letter = '';
  do {
    letter = String.fromCharCode(65 + (index % 26)) + letter;
    index = Math.floor(index / 26) - 1;
  } while (index >= 0);
  return letter;
};

const regionByShortName = new Map(
  RegionList.map((region) => [Regions[region].shortName.toLowerCase(), region])
);

const normalizeHeader = (header: unknown): string =>
  `${header ?? ''}`.replace(/\s+/g, ' ').trim().toLowerCase();

const headerRegion = (label: string): Region | undefined =>
  regionByShortName.get(label) ??
  regionByShortName.get(
    label.replace(/^région /, '').replace(/ programmés$/, '')
  );

const toRows = (content: Buffer, filename: string): string[][] => {
  if (filename.toLowerCase().endsWith('.csv')) {
    return parse(content, {
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true,
      delimiter: [';', ',', '\t']
    }) as string[][];
  }

  const workbook = XLSX.read(content, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    blankrows: false,
    defval: ''
  });
};

export const parsePrescriptionImportFile = (
  content: Buffer,
  filename: string
): ParsedImportFile => {
  const rows = toRows(content, filename);
  const unrecognized: string[] = [];

  if (rows.length === 0) {
    return { cells: [], totals: [], unrecognized: ['Le fichier est vide'] };
  }

  const [headerRow, ...dataRows] = rows;

  const regionByColumnIndex = new Map<number, Region>();
  let totalColumnIndex: number | undefined;

  headerRow.forEach((header, columnIndex) => {
    if (columnIndex === 0) {
      return;
    }
    const label = normalizeHeader(header);
    if (label === '' || IGNORED_COLUMN_HEADERS.includes(label)) {
      return;
    }
    if (label.includes('laboratoire')) {
      return;
    }
    if (label === TOTAL_COLUMN_HEADER) {
      totalColumnIndex = columnIndex;
      return;
    }
    const region = headerRegion(label);
    if (region) {
      regionByColumnIndex.set(columnIndex, region);
    } else {
      unrecognized.push(`Colonne ${columnLetter(columnIndex)}`);
    }
  });

  const cells: ImportedCell[] = [];
  const totals: ImportedTotal[] = [];

  const readSampleCount = (
    row: string[] | undefined,
    columnIndex: number,
    rowNumber: number
  ): number | undefined => {
    const rawValue = `${row?.[columnIndex] ?? ''}`.trim();
    if (rawValue === '') {
      return undefined;
    }
    const sampleCount = Number(rawValue.replace(',', '.'));
    if (!Number.isInteger(sampleCount) || sampleCount < 0) {
      unrecognized.push(`Cellule ${columnLetter(columnIndex)}${rowNumber}`);
      return undefined;
    }
    return sampleCount;
  };

  dataRows.forEach((row, dataRowIndex) => {
    const rowNumber = dataRowIndex + HEADER_ROW_NUMBER + 1;
    const subPlanNumber = `${row?.[0] ?? ''}`.trim();

    if (subPlanNumber === '') {
      return;
    }

    for (const [columnIndex, region] of regionByColumnIndex) {
      const sampleCount = readSampleCount(row, columnIndex, rowNumber);
      if (sampleCount !== undefined) {
        cells.push({ rowNumber, subPlanNumber, region, sampleCount });
      }
    }

    if (totalColumnIndex !== undefined) {
      const sampleCount = readSampleCount(row, totalColumnIndex, rowNumber);
      if (sampleCount !== undefined) {
        totals.push({ rowNumber, subPlanNumber, sampleCount });
      }
    }
  });

  return { cells, totals, unrecognized };
};
