import { expect, test } from 'vitest';
import { getAnalytes, SSD2Hierarchy } from './SSD2Hierarchy';

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

test('chaque analyte appartient à un seul complexe', () => {
  const parentsByAnalyte: Record<string, string[]> = {};
  for (const [complex, analytes] of Object.entries(SSD2Hierarchy)) {
    for (const analyte of analytes ?? []) {
      if (!parentsByAnalyte[analyte]) {
        parentsByAnalyte[analyte] = [];
      }
      parentsByAnalyte[analyte].push(complex);
    }
  }

  const analytesWithMultipleParents = Object.entries(parentsByAnalyte).filter(
    ([, parents]) => parents.length > 1
  );

  expect(analytesWithMultipleParents).toEqual([]);
});
