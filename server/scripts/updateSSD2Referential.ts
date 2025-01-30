import ExcelJS from 'exceljs';
import path from 'path';

const updateSSD2Referential = async () => {

  console.log('Updating SSD2…')


  let workbook = new ExcelJS.Workbook();
  const filePath = path.join(import.meta.dirname,  "PARAM.xlsx")
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
  console.log(rows);
  console.log(worksheet.rowCount)




};

export default updateSSD2Referential()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
