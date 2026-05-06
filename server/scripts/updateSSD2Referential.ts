import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from '@e965/xlsx';
import { isNil, uniq } from 'lodash-es';
import { SSD2Hierarchy } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import type { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';

export type SSD2ParsedRow = {
  reference: string;
  name: string;
  casNumber: string | null;
  otherNames: string[];
  reportable: boolean;
};

export const parseSSD2Workbook = async (
  filePath: string
): Promise<{
  newRows: Record<string, SSD2ParsedRow>;
  rowsWithAnalytes: Record<SSD2Id, SSD2Id[]>;
}> => {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(readFileSync(filePath), { type: 'buffer' });
  } catch (_e) {
    throw new Error(
      `Fichier introuvable, veuillez télécharger la dernière version du SSD2 et mettre le fichier PARAM.xlsx à la racine du projet. Lien du catalogue SSD2 : https://zenodo.org/records/14778056`
    );
  }

  const worksheet = workbook.Sheets['term'];

  if (worksheet === undefined) {
    throw new Error('impossible de trouver une page term');
  }

  const columnNames = [
    'termCode',
    'pestParamReportable',
    'termExtendedName',
    'otherNames',
    'zooLabel',
    'CAS',
    'masterParentCode'
  ] as const;

  const sheetRows = XLSX.utils.sheet_to_json<
    Record<(typeof columnNames)[number], string | null>
  >(worksheet, { defval: null, raw: false });

  if (sheetRows.length > 0) {
    columnNames.forEach((name) => {
      if (!(name in sheetRows[0])) {
        throw new Error(`impossible de trouver la colonne ${name}`);
      }
    });
  }

  const getStringValueOrNull = (value: string | null): string | null =>
    !isNil(value) && value !== '' ? `${value}` : null;

  const rows: {
    reference: string;
    name: string;
    casNumber: string | null;
    otherNames: string[];
    masterParentCode: string;
    reportable: boolean;
  }[] = [];

  for (const sheetRow of sheetRows) {
    const isKnownId = Object.keys(SSD2Referential).includes(
      `${sheetRow.termCode}`
    );
    if (sheetRow.pestParamReportable === '1' || isKnownId) {
      const name = `${sheetRow.termExtendedName}`;
      rows.push({
        reference: `${sheetRow.termCode}`,
        name,
        casNumber: getStringValueOrNull(sheetRow.CAS),
        otherNames: [
          getStringValueOrNull(sheetRow.zooLabel),
          ...(getStringValueOrNull(sheetRow.otherNames)?.split('$') ?? [])
        ]
          .filter((s) => s !== name)
          .filter((s) => s !== null),
        masterParentCode: `${sheetRow.masterParentCode}`,
        reportable: sheetRow.pestParamReportable === '1'
      });
    }
  }

  const newRows = rows.reduce(
    (acc, r) => {
      const { masterParentCode, ...rest } = r;
      acc[r.reference] = rest;
      return acc;
    },
    {} as Record<string, SSD2ParsedRow>
  );

  const rowsWithAnalytes: Record<SSD2Id, SSD2Id[]> = rows.reduce(
    (acc, row) => {
      if (row.name.includes('(sum')) {
        const analytes = rows
          .filter(({ masterParentCode }) => masterParentCode === row.reference)
          .map(({ reference }) => reference);
        if (analytes.length > 0) {
          acc[row.reference as SSD2Id] = analytes as SSD2Id[];
        }
      }
      return acc;
    },
    {} as Record<SSD2Id, SSD2Id[]>
  );

  return { newRows, rowsWithAnalytes };
};

const updateSSD2Referential = async () => {
  console.log('Updating SSD2…');
  const { newRows, rowsWithAnalytes } =
    await parseSSD2Workbook('../PARAM.xlsx');
  updateReferentialFile(newRows);
  updateHierarchyFile(rowsWithAnalytes);
};

const updateReferentialFile = (newReferential: Record<string, any>) => {
  const ssd2ReferentialFile = path.join(
    process.cwd(),
    '../shared/referential/Residue/SSD2Referential.ts'
  );
  const referentialFileData = readFileSync(ssd2ReferentialFile, {
    encoding: 'utf-8'
  });

  const startComment = '// ----- ne pas supprimer cette ligne : début';
  const stopComment = '// ----- ne pas supprimer cette ligne : fin';
  const startIndex = referentialFileData.indexOf(startComment);
  const preCode = referentialFileData.slice(
    0,
    startIndex + startComment.length + 1
  );
  const postCode = referentialFileData.slice(
    referentialFileData.indexOf(stopComment) - 32
  );

  const code = JSON.stringify(newReferential, null, 3);

  writeFileSync(ssd2ReferentialFile, preCode + code + postCode);
};

const updateHierarchyFile = (ssd2WithAnalytes: Record<string, any>) => {
  const ssd2HierarchyFile = path.join(
    process.cwd(),
    '../shared/referential/Residue/SSD2Hierarchy.ts'
  );
  const hierarchyFileData = readFileSync(ssd2HierarchyFile, {
    encoding: 'utf-8'
  });

  const startComment = '// ----- ne pas supprimer cette ligne : début';
  const stopComment = '// ----- ne pas supprimer cette ligne : fin';
  const startIndex = hierarchyFileData.indexOf(startComment);
  const preCode = hierarchyFileData.slice(
    0,
    startIndex + startComment.length + 1
  );
  const postCode = hierarchyFileData.slice(
    hierarchyFileData.indexOf(stopComment) - 1
  );

  const newHierarchy: { [key in SSD2Id]?: SSD2Id[] } = { ...SSD2Hierarchy };
  Object.keys(ssd2WithAnalytes).forEach((key) => {
    const id: SSD2Id = key as SSD2Id;
    const value = ssd2WithAnalytes[id];
    if (id in SSD2Hierarchy) {
      const oldValues = SSD2Hierarchy[id] ?? [];
      newHierarchy[id] = uniq([...oldValues, ...value]) as SSD2Id[];
    } else {
      newHierarchy[id] = value;
    }
  });

  const code = JSON.stringify(newHierarchy, null, 3);

  writeFileSync(ssd2HierarchyFile, preCode + code + postCode);
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  updateSSD2Referential()
    .then(() => {
      process.exit();
    })
    .catch((e) => {
      console.error('Erreur', e);
      process.exit(1);
    });
}
