import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';
import path from 'path';
import { expect, test } from 'vitest';
import { raiValidator } from './raiValidator';

test.each(['example-rai-1.xml', 'example-rai-2.xml'])(
  'import une RAI',
  (fileName) => {
    const file = path.join(import.meta.dirname, `./${fileName}`);
    const content = readFileSync(file);

    const parser = new XMLParser({
      parseTagValue: false
    });
    const xmlToJson = parser.parse(content);

    expect(raiValidator.parse(xmlToJson)).toMatchSnapshot();
  }
);
