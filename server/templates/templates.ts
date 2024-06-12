import fs from 'fs';
import path from 'path';

export type Template =
  | 'supportDocument'
  | 'analysisRequestDocument'
  | 'analysisReportDocument';

export const templateContent = (template: Template) =>
  fs.readFileSync(path.join(__dirname, template, `${template}.hbs`), 'utf8');

export const templateStylePath = (template: Template) =>
  path.join(__dirname, template, `${template}.css`);
