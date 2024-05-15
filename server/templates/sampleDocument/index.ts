import fs from 'fs';
import path from 'path';

const file = path.join(__dirname, 'sampleDocument.hbs');
const SampleDocumentFileContent = fs.readFileSync(file, 'utf8');

export default SampleDocumentFileContent;
