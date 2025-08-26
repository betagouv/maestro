import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';
import path from 'path';
import { test } from 'vitest';
import { raiValidator } from './raiValidator';

test('import une RAI', () => {
  const file = path.join(import.meta.dirname, './example-rai-2.xml');
  const content = readFileSync(file);

  const parser = new XMLParser({
    parseTagValue: false
  });
  const obj = parser.parse(content);

  console.log(obj);

  raiValidator.parse(obj);
});
