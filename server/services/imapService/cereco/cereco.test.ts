import { readFileSync } from 'fs';
import path from 'path';
import { expect, test } from 'vitest';
import { cerecoConf } from './cereco';

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

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "notes": "CONFORME vis-à-vis des paramètres analysés au règlement CE n°396/2005 du 23/02/2005 et avenants (¢).",
        "pdfFile": File {
          Symbol(kHandle): Blob {},
          Symbol(kLength): 8704,
          Symbol(kType): "",
        },
        "residues": [
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "captane + THPI (en captane)",
            "result_kind": "ND",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "chlorothalonil",
            "result_kind": "ND",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "folpet + phtalimide (en folpet)",
            "result_kind": "ND",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Multi",
            "casNumber": null,
            "codeSandre": null,
            "label": "Prothioconazole desthio",
            "lmr": 0.15,
            "result": 0.038,
            "result_kind": "Q",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Multi",
            "casNumber": null,
            "codeSandre": null,
            "label": "Tebuconazole",
            "lmr": 0.5,
            "result": 0.37,
            "result_kind": "Q",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "Acide phosphonique (somme)",
            "lmr": 1.5,
            "result": 0.09,
            "result_kind": "Q",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "Fosétyl-Al (exprimé en fosétyl)",
            "result_kind": "ND",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "Mepiquat",
            "result_kind": "ND",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "Chlormequat",
            "result_kind": "ND",
          },
          {
            "analysisDate": "2025-07-16",
            "analysisMethod": "Mono",
            "casNumber": null,
            "codeSandre": null,
            "label": "Glyphosate",
            "result_kind": "ND",
          },
        ],
        "sampleReference": "OCC-25-0001",
      },
    ]
  `);
});
