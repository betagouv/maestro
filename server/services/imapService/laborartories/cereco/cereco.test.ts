import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import type z from 'zod';
import { cerecoConf, cerecoRefValidator } from './cereco';

test('exportDataFromEmail', async () => {
  const file = path.join(import.meta.dirname, './example.xls');
  const content = readFileSync(file);
  const result = await cerecoConf.exportDataFromEmail([
    {
      filename: 'example.xls',
      content,
      contentType: ''
    },
    {
      filename: 'test.pdf',
      content,
      contentType: 'application/pdf'
    }
  ]);

  expect(result[0]).toMatchObject({
    notes:
      'CONFORME vis-à-vis des paramètres analysés au règlement CE n°396/2005 du 23/02/2005 et avenants (¢).',
    residues: [
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'captane + THPI (en captane)',
        result_kind: 'NQ'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'chlorothalonil',
        result_kind: 'ND'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'folpet + phtalimide (en folpet)',
        result_kind: 'ND'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Multi',
        casNumber: null,
        codeSandre: null,
        label: 'Prothioconazole desthio',
        lmr: 0.15,
        result: 0.038,
        result_kind: 'Q'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Multi',
        casNumber: null,
        codeSandre: null,
        label: 'Tebuconazole',
        lmr: 0.5,
        result: 0.37,
        result_kind: 'Q'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'Acide phosphonique (somme)',
        lmr: 1.5,
        result: 0.09,
        result_kind: 'Q'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'Fosétyl-Al (exprimé en fosétyl)',
        result_kind: 'ND'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'Mepiquat',
        result_kind: 'ND'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'Chlormequat',
        result_kind: 'ND'
      },
      {
        analysisDate: '2025-07-16',
        analysisMethod: 'Mono',
        casNumber: null,
        codeSandre: null,
        label: 'Glyphosate',
        result_kind: 'ND'
      }
    ],
    sampleReference: 'OCC-25-0001'
  });
});

test('exportDataFromEmail avec plusieurs analyses', async () => {
  const xls3266 = readFileSync(
    path.join(import.meta.dirname, './rapport-3266.xls')
  );
  const xls3267 = readFileSync(
    path.join(import.meta.dirname, './rapport-3267.xls')
  );
  const result = await cerecoConf.exportDataFromEmail([
    { filename: 'rapport 3266.xls', content: xls3266, contentType: '' },
    { filename: 'rapport 3267.xls', content: xls3267, contentType: '' },
    {
      filename: 'B26-R9047-3266.pdf',
      content: Buffer.from('pdf-3266'),
      contentType: 'application/pdf'
    },
    {
      filename: 'B26-R9047-3267.pdf',
      content: Buffer.from('pdf-3267'),
      contentType: 'application/pdf'
    },
    {
      filename: 'image001.png',
      content: Buffer.from('signature'),
      contentType: 'image/png'
    }
  ]);

  expect(result).toHaveLength(2);
  expect(
    result.map((a) => ({
      sampleReference: a.sampleReference,
      pdf: a.pdfFile.name
    }))
  ).toStrictEqual([
    { sampleReference: 'LAB-99-00001', pdf: 'B26-R9047-3266.pdf' },
    { sampleReference: 'LAB-99-00002', pdf: 'B26-R9047-3267.pdf' }
  ]);
});

type CerecoRef = z.infer<typeof cerecoRefValidator>;
test.each<[string, CerecoRef]>([
  [
    'ARA-25-0094-1 : Olives',
    { reference: 'ARA-25-0094', copyNumber: 1, itemNumber: 1 }
  ],
  [
    'ARA-25-0094-2 : Olives',
    { reference: 'ARA-25-0094', copyNumber: 2, itemNumber: 1 }
  ],
  [
    'ARA-25-0094-A-2 : Olives',
    { reference: 'ARA-25-0094', copyNumber: 2, itemNumber: 1 }
  ],
  [
    'ARA-25-0094-B-1 : Olives',
    { reference: 'ARA-25-0094', copyNumber: 1, itemNumber: 2 }
  ],
  [
    'ARA-25-00094-1 - Olives',
    { reference: 'ARA-25-00094', copyNumber: 1, itemNumber: 1 }
  ],
  [
    'ARA-26-00138-A1 : Olives',
    { reference: 'ARA-26-00138', copyNumber: 1, itemNumber: 1 }
  ]
])('cerecoRefValidator', (value, expected) => {
  expect(cerecoRefValidator.parse(value)).toStrictEqual(expected);
});
