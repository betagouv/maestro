import ExcelJS from 'exceljs';
import { readFileSync } from 'fs';
import { isNil, uniq } from 'lodash-es';
import { SSD2Hierarchy } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';
import { writeFileSync } from 'node:fs';
import path from 'path';

const updateSSD2Referential = async () => {
  console.log('Updating SSD2…');

  let workbook = new ExcelJS.Workbook();
  const filePath = '../PARAM.xlsx';

  try {
    workbook = await workbook.xlsx.readFile(filePath, {
      ignoreNodes: [
        'sheetPr',
        'dimension',
        'sheetViews',
        'sheetFormatPr',
        'cols',
        // "sheetData",
        'autoFilter',
        'mergeCells',
        'rowBreaks',
        'hyperlinks',
        'pageMargins',
        'dataValidations',
        'pageSetup',
        'headerFooter',
        'printOptions',
        'picture',
        'drawing',
        'sheetProtection',
        'tableParts',
        'conditionalFormatting',
        'extLst'
      ]
    });
  } catch (_e) {
    throw new Error(
      `Fichier introuvable, veuillez télécharger la dernière version du SSD2 et mettre le fichier PARAM.xlsx à la racine du projet. Lien du catalogue SSD2 : https://zenodo.org/records/14778056`
    );
  }

  const worksheet = workbook.getWorksheet('term');

  if (worksheet === undefined) {
    throw new Error('impossible de trouver une page term');
  }

  const allColumnsIndex: Record<string, number> = {};
  const firstLine = worksheet.getRow(1);
  firstLine.eachCell((cell, index) => {
    if (typeof cell.value === 'string') {
      allColumnsIndex[cell.value] = index;
    }
  });

  const columnNames = [
    'termCode',
    'pestParamReportable',
    'termExtendedName',
    'otherNames',
    'zooLabel',
    'CAS',
    'masterParentCode'
  ] as const;
  columnNames.forEach((name) => {
    if (!Object.keys(allColumnsIndex).includes(name)) {
      throw new Error(`impossible de trouver la colonne ${name}`);
    }
  });

  const columnsIndex: Record<(typeof columnNames)[number], number> =
    columnNames.reduce(
      (acc, name) => {
        acc[name] = allColumnsIndex[name];
        return acc;
      },
      {} as Record<(typeof columnNames)[number], number>
    );

  const rows: {
    reference: string;
    name: string;
    casNumber: string | null;
    otherNames: string[];
    masterParentCode: string;
    reportable: boolean;
  }[] = [];
  worksheet.eachRow(function (row, rowNumber) {
    const isKnownId = Object.keys(SSD2Referential).includes(
      `${row.getCell(columnsIndex['termCode'])?.value}`
    );
    if (
      (rowNumber !== 1 &&
        row.getCell(columnsIndex['pestParamReportable']).value === '1') ||
      isKnownId
    ) {
      const getStringValueOrNull = (
        value: ExcelJS.CellValue
      ): string | null => {
        return !isNil(value) && value !== '' ? `${value}` : null;
      };

      const name = `${row.getCell(columnsIndex['termExtendedName']).value}`;
      rows.push({
        reference: `${row.getCell(columnsIndex['termCode']).value}`,
        name,
        casNumber: getStringValueOrNull(row.getCell(columnsIndex['CAS']).value),
        otherNames: [
          getStringValueOrNull(row.getCell(columnsIndex['zooLabel']).value),
          ...(getStringValueOrNull(
            row.getCell(columnsIndex['otherNames']).value
          )?.split('$') ?? [])
        ]
          .filter((s) => s !== name)
          .filter((s) => s !== null),
        masterParentCode: `${row.getCell(columnsIndex['masterParentCode']).value}`,
        reportable:
          row.getCell(columnsIndex['pestParamReportable']).value === '1'
      });
    }
  });

  const newRows = rows.reduce(
    (acc, r) => {
      const { masterParentCode, ...rest } = r;
      acc[r.reference] = rest;
      return acc;
    },
    {} as Record<string, unknown>
  );

  updateReferentialFile(newRows);

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

export default updateSSD2Referential()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
