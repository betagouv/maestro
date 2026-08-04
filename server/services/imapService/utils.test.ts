import { expect, test } from 'vitest';
import {
  csvToJson,
  frenchNumberStringValidator,
  parseSampleReference
} from './utils';

test('csvToJson', () => {
  expect(csvToJson('header 1;header 2', ';')).toMatchInlineSnapshot(`[]`);
  expect(
    csvToJson('header 1;header 2\nvalue1;value2', ';')
  ).toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value2",
      },
    ]
  `);
  expect(
    csvToJson('header 1,header 2\nvalue1,value2', ',')
  ).toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value2",
      },
    ]
  `);
  expect(
    csvToJson(`header 1;header 2\nvalue1;"value;2"`, ';')
  ).toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value;2",
      },
    ]
  `);
  expect(
    csvToJson(`header 1;header 2\nvalue1;        value         `, ';')
  ).toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value",
      },
    ]
  `);
});

test('frenchNumberStringValidator', () => {
  expect(frenchNumberStringValidator.parse('0')).toEqual(0);
  expect(frenchNumberStringValidator.parse('0,2')).toEqual(0.2);
  expect(frenchNumberStringValidator.parse('4,2')).toEqual(4.2);
  expect(frenchNumberStringValidator.parse('4.2')).toEqual(4.2);
  expect(frenchNumberStringValidator.parse('')).toBeNull();
  expect(frenchNumberStringValidator.parse('   ')).toBeNull();
});

test.each<[string, ReturnType<typeof parseSampleReference>]>([
  // sans suffixe
  ['OCC-25-0007', { reference: 'OCC-25-0007', copyNumber: 1, itemNumber: 1 }],
  ['OCC-25-00007', { reference: 'OCC-25-00007', copyNumber: 1, itemNumber: 1 }],
  // numéro de copie, sur un ou deux chiffres
  [
    'OCC-25-0007-01',
    { reference: 'OCC-25-0007', copyNumber: 1, itemNumber: 1 }
  ],
  ['OCC-25-0007-2', { reference: 'OCC-25-0007', copyNumber: 2, itemNumber: 1 }],
  [
    'OCC-25-0007-02',
    { reference: 'OCC-25-0007', copyNumber: 2, itemNumber: 1 }
  ],
  // lettre d'objet, séparée ou collée au numéro de copie
  [
    'OCC-25-0007-A-2',
    { reference: 'OCC-25-0007', copyNumber: 2, itemNumber: 1 }
  ],
  [
    'OCC-25-0007-B-1',
    { reference: 'OCC-25-0007', copyNumber: 1, itemNumber: 2 }
  ],
  [
    'OCC-25-0007-B1',
    { reference: 'OCC-25-0007', copyNumber: 1, itemNumber: 2 }
  ],
  // le numéro de série est complété à 4 chiffres avant 2026, 5 ensuite
  ['REU-25-150', { reference: 'REU-25-0150', copyNumber: 1, itemNumber: 1 }],
  ['REU-26-150', { reference: 'REU-26-00150', copyNumber: 1, itemNumber: 1 }],
  // espaces parasites, à n'importe quelle position
  [
    'OCC-25 -0007-01',
    { reference: 'OCC-25-0007', copyNumber: 1, itemNumber: 1 }
  ],
  ['OCC - 25-0007', { reference: 'OCC-25-0007', copyNumber: 1, itemNumber: 1 }],
  [
    'CVL-26-00561-A -1',
    { reference: 'CVL-26-00561', copyNumber: 1, itemNumber: 1 }
  ],
  [
    '  CVL - 26 - 00561 - B - 2  ',
    { reference: 'CVL-26-00561', copyNumber: 2, itemNumber: 2 }
  ],
  [
    'GES-26-00621-A-1 BLE (FROMENT)',
    { reference: 'GES-26-00621', copyNumber: 1, itemNumber: 1 }
  ],
  // formats non reconnus
  ['OCC-25', null],
  ['OCC-25-0007-AB', null],
  ['OCC-25-0007-1A', null]
])('parseSampleReference %s', (value, expected) => {
  expect(parseSampleReference(value)).toStrictEqual(expected);
});
