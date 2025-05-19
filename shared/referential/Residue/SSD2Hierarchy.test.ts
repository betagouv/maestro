import { expect, test } from 'vitest';
import { getAnalytes } from './SSD2Hierarchy';

test('getAnalytes', () => {
  expect(getAnalytes('RF-0004-001-PPP')).toMatchInlineSnapshot(`Set {}`);
  expect(getAnalytes('RF-00004681-PAR')).toMatchInlineSnapshot(`
    Set {
      "RF-00004686-PAR",
      "RF-0061-001-PPP",
    }
  `);
  expect(getAnalytes('RF-0008-001-PPP')).toMatchInlineSnapshot(`
    Set {
      "RF-00002588-PAR",
      "RF-00004646-PAR",
    }
  `);
});
