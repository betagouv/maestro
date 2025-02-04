import { expect, test } from 'vitest';
import { csvToJson } from './utils';

test("csvToJson", () => {
  expect(csvToJson("header 1;header 2", ";")).toMatchInlineSnapshot(`[]`)
  expect(csvToJson("header 1;header 2\nvalue1;value2", ";")).toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value2",
      },
    ]
  `)
  expect(csvToJson("header 1,header 2\nvalue1,value2", ",")).toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value2",
      },
    ]
  `)
  expect(csvToJson(`header 1;header 2\nvalue1;"value;2"`, ";")).toMatchInlineSnapshot(`
    [
      {
        "header 1": "value1",
        "header 2": "value;2",
      },
    ]
  `)
})