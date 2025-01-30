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

  const columnsIndex: Record<string, number>= {}
  const firstLine = worksheet.getRow(1)
  let pestParamReportableIndex
  firstLine.eachCell((cell, index) => {
    if( typeof cell.value === 'string') {
      columnsIndex[cell.value] = index
    }
  })
  console.log('index', columnsIndex)

  worksheet.eachRow(function(row, rowNumber) {
    if (rowNumber === 1) {

      console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
    }
  });
  console.log(worksheet.getCell('A274').value);
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
