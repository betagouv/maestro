import { readFileSync } from 'node:fs';
import XLSX from '@e965/xlsx';

export type ActeDescriptorRow = {
  acte: string;
  sigle: string;
  inputType: string;
  required: boolean;
  received: boolean;
};

export type DescriptorRow = {
  sigle: string;
  label: string;
  standardized: boolean;
};

export type DescriptorValueRow = {
  sigle: string;
  value: string;
  label: string;
  status: string;
};

export type SigalSubPlanRow = {
  acte: string;
  code: string;
};

export type SigalWorkbook = {
  acteDescriptors: ActeDescriptorRow[];
  descriptors: DescriptorRow[];
  descriptorValues: DescriptorValueRow[];
  subPlans: SigalSubPlanRow[];
};

const readSheet = (
  workbook: XLSX.WorkBook,
  sheetName: string,
  columns: string[]
): Record<string, string>[] => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Onglet ${sheetName} introuvable`);
  }
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: '',
    raw: false
  });
  const missingColumn = columns.find((column) => !(column in (rows[0] ?? {})));
  if (missingColumn) {
    throw new Error(`Colonne ${missingColumn} introuvable dans ${sheetName}`);
  }
  return rows;
};

export const readSigalWorkbook = (filePath: string): SigalWorkbook => {
  const workbook = XLSX.read(readFileSync(filePath), { type: 'buffer' });

  return {
    acteDescriptors: readSheet(workbook, 'T_Acte_Desc', [
      'Acte',
      'Des',
      'TypeLib',
      'Obligatoire',
      'Recu'
    ]).map((row) => ({
      acte: row.Acte,
      sigle: row.Des,
      inputType: row.TypeLib,
      required: row.Obligatoire === 'Oui',
      received: row.Recu === 'Oui'
    })),
    descriptors: readSheet(workbook, 'T_Descripteurs', [
      'Sigle',
      'Libelle',
      'Standardise'
    ]).map((row) => ({
      sigle: row.Sigle,
      label: row.Libelle,
      standardized: row.Standardise.startsWith('Oui')
    })),
    descriptorValues: readSheet(workbook, 'T_Desc_Valeurs', [
      'Des',
      'Val',
      'Libelle',
      'Statut'
    ]).map((row) => ({
      sigle: row.Des,
      value: row.Val,
      label: row.Libelle,
      status: row.Statut
    })),
    subPlans: readSheet(workbook, 'T_SousPlans', ['Acte', 'Code']).map(
      (row) => ({ acte: row.Acte, code: row.Code })
    )
  };
};
