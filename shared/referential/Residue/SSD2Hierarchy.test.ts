import { expect, test } from 'vitest';
import { getAnalytes } from './SSD2Hierachy';

test('getAnalytes', () => {
  expect(getAnalytes('RF-0004-001-PPP')).toMatchInlineSnapshot(`[]`)
  expect(getAnalytes('RF-00004681-PAR')).toMatchInlineSnapshot(`
    [
      "RF-00004686-PAR",
      "RF-0061-001-PPP",
    ]
  `)
})