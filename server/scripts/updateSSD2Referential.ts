import ExcelJS from 'exceljs';
import path from 'path';
import { readFileSync } from 'fs';
import { writeFileSync } from 'node:fs';

const updateSSD2Referential = async () => {

  console.log('Updating SSD2…')


  let workbook = new ExcelJS.Workbook();
  const filePath = "./PARAM.xlsx"
  workbook = await workbook.xlsx.readFile(filePath, {
    ignoreNodes: [
      "sheetPr",
      "dimension",
      "sheetViews",
      "sheetFormatPr",
      "cols",
      // "sheetData",
      "autoFilter",
      "mergeCells",
      "rowBreaks",
      "hyperlinks",
      "pageMargins",
      "dataValidations",
      "pageSetup",
      "headerFooter",
      "printOptions",
      "picture",
      "drawing",
      "sheetProtection",
      "tableParts",
      "conditionalFormatting",
      "extLst",
    ]
  });

  const worksheet = workbook.getWorksheet('term')

  if (worksheet === undefined) {
    throw new Error('impossible de trouver une page term')
  }

  const allColumnsIndex: Record<string, number>= {}
  const firstLine = worksheet.getRow(1)
  firstLine.eachCell((cell, index) => {
    if( typeof cell.value === 'string') {
      allColumnsIndex[cell.value] = index
    }
  })

  const columnNames = ['termCode','pestParamReportable', 'termExtendedName', 'otherNames', 'zooLabel','CAS'] as const
  columnNames.forEach((name) => {
    if (!Object.keys(allColumnsIndex).includes(name)) {
      throw new Error(`impossible de trouver la colonne ${name}`)
    }
  })

  const columnsIndex: Record<typeof columnNames[number], number> = columnNames.reduce((acc, name) => {
    acc[name] = allColumnsIndex[name]
    return acc
  }, {} as Record<typeof columnNames[number], number>)


  const rows: {reference: string, name: string, casNumber: string | null, otherNames: string[]}[] = []
  worksheet.eachRow(function(row, rowNumber) {
    if (rowNumber !== 1 && row.getCell(columnsIndex['pestParamReportable']).value === '1') {

      const getStringValueOrNull = (value: ExcelJS.CellValue): string | null => {
        return value !== '' ? `${value}` : null
      }

      const name = `${row.getCell(columnsIndex['termExtendedName']).value}`

      rows.push({
        reference: `${row.getCell(columnsIndex['termCode']).value}`,
        name,
        casNumber:  getStringValueOrNull(row.getCell(columnsIndex['CAS']).value) ,
        otherNames: [getStringValueOrNull(row.getCell(columnsIndex['zooLabel']).value), ...getStringValueOrNull(row.getCell(columnsIndex['otherNames']).value)?.split('$') ?? []]
          .filter(s => s !== name)
          .filter(s => s!==null)
      })
    }
  });

  const ssd2File = path.join(process.cwd(), '../shared/referential/Residue/ssd2.ts')
  const data = readFileSync(ssd2File, {
    encoding: 'utf-8',
  })

  const startComment = '// ----- ne pas supprimer cette ligne : début'
  const stopComment = '// ----- ne pas supprimer cette ligne : fin'
  const startIndex = data.indexOf(startComment)
  const preCode = data.slice(0, startIndex + startComment.length + 1)
  const postCode = data.slice(data.indexOf(stopComment) - 116)

  const code = JSON.stringify(rows.reduce((acc, r) => {
    acc[r.reference] = r
    return acc
  }, {} as Record<string, unknown>), null, 3)

  writeFileSync(ssd2File, preCode + code + postCode)


};

export default updateSSD2Referential()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
