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

interface ParsedImportFile {
  cells: ImportedCell[];
  unrecognized: string[];
}

const HEADER_ROW_NUMBER = 1;

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
    return { cells: [], unrecognized: ['Le fichier est vide'] };
  }

  const [headerRow, ...dataRows] = rows;

  const regionByColumnIndex = new Map<number, Region>();
  headerRow.forEach((header, columnIndex) => {
    if (columnIndex === 0) {
      return;
    }
    const label = `${header ?? ''}`.trim();
    if (label === '') {
      return;
    }
    const region = regionByShortName.get(label.toLowerCase());
    if (region) {
      regionByColumnIndex.set(columnIndex, region);
    } else {
      unrecognized.push(`Colonne ${columnLetter(columnIndex)}`);
    }
  });

  const cells: ImportedCell[] = [];

  dataRows.forEach((row, dataRowIndex) => {
    const rowNumber = dataRowIndex + HEADER_ROW_NUMBER + 1;
    const subPlanNumber = `${row?.[0] ?? ''}`.trim();

    if (subPlanNumber === '') {
      return;
    }

    for (const [columnIndex, region] of regionByColumnIndex) {
      const rawValue = `${row?.[columnIndex] ?? ''}`.trim();
      if (rawValue === '') {
        continue;
      }
      const sampleCount = Number(rawValue.replace(',', '.'));
      if (!Number.isInteger(sampleCount) || sampleCount < 0) {
        unrecognized.push(`Cellule ${columnLetter(columnIndex)}${rowNumber}`);
        continue;
      }
      cells.push({ rowNumber, subPlanNumber, region, sampleCount });
    }
  });

  return { cells, unrecognized };
};
