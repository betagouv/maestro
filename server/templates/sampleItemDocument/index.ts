import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, 'sampleItemDocument.hbs');
export const SampleItemDocumentFileContent = fs.readFileSync(file, 'utf8');

export const SampleItemDocumentStylePath = path.join(
  __dirname,
  'sampleItemDocument.css'
);
