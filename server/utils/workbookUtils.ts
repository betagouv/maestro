import ExcelJS from 'exceljs';
import { Response } from 'express';
import { isArray } from 'lodash-es';

const init = (fileName: string, response: Response) => {
  response.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  response.setHeader('Transfer-Encoding', 'chunked');
  response.setHeader('Content-Disposition', 'attachment; filename=' + fileName);

  return new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: response
  });
};

const sanitizeExcelData = (value: any) => {
  if (typeof value !== 'string') return value;

  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }

  return value;
};

const addRowToWorksheet = (worksheet: ExcelJS.Worksheet, row: any[] | any) =>
  worksheet.addRow(
    isArray(row) ? row.map(sanitizeExcelData) : sanitizeExcelData(row)
  );

export default {
  init,
  sanitizeExcelData,
  addRowToWorksheet
};
