import { expect, test } from 'vitest';
import { csvToJson, frenchNumberStringValidator } from './utils';

test('csvToJson', () => {
  expect(csvToJson('header 1;header 2', ';')).toMatchInlineSnapshot(`[]`);
  expect(csvToJson('header 1;header 2\nvalue1;value2', ';'))
    .toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value2",
      },
    ]
  `);
  expect(csvToJson('header 1,header 2\nvalue1,value2', ','))
    .toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value2",
      },
    ]
  `);
  expect(csvToJson(`header 1;header 2\nvalue1;"value;2"`, ';'))
    .toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value;2",
      },
    ]
  `);
  expect(csvToJson(`header 1;header 2\nvalue1;        value         `, ';'))
    .toMatchInlineSnapshot(`
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
});
