import fs from 'fs';
import path from 'path';

export type Template = 'supportDocument' | 'analysisReportDocument';

export const templateContent = (template: Template) =>
  fs.readFileSync(path.join(import.meta.dirname, template, `${template}.hbs`), 'utf8');

export const templateStylePath = (template: Template) =>
  path.join(import.meta.dirname, template, `${template}.css`);
