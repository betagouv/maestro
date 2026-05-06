import { existsSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { parseSSD2Workbook } from './updateSSD2Referential';

const paramFile = path.join(process.cwd(), 'PARAM.xlsx');

test.skipIf(!existsSync(paramFile))(
  'parseSSD2Workbook',
  async () => {
    const { newRows, rowsWithAnalytes } = await parseSSD2Workbook(paramFile);

    expect(newRows).toMatchSnapshot('newRows');
    expect(rowsWithAnalytes).toMatchSnapshot('rowsWithAnalytes');
  },
  60000
);
