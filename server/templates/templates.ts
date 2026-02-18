import fs from 'fs';
import path from 'path';

export type Template =
  | 'supportDocument'
  | 'sampleEmptyForm'
  | 'analysisReportDocument'
  | 'analysisRequest'
  | 'samplesExport'
  | 'prescriptionsExport';

export const templateContent = (template: Template) =>
  fs.readFileSync(
    path.join(import.meta.dirname, template, `${template}.hbs`),
    'utf8'
  );

const TemplateFileTypes: Record<Template, string> = {
  supportDocument: 'hbs',
  sampleEmptyForm: 'hbs',
  analysisReportDocument: 'hbs',
  analysisRequest: 'xlsx',
  samplesExport: 'xls',
  prescriptionsExport: 'xls'
};

export const templatePath = (template: Template) =>
  path.join(
    import.meta.dirname,
    template,
    `${template}.${TemplateFileTypes[template]}`
  );

export const templateStylePath = (template: Template) =>
  path.join(import.meta.dirname, template, `${template}.css`);

export const assetsPath = (relativePath: string) =>
  path.join(import.meta.dirname, 'assets', relativePath);

export const partialsPath = () =>
  path.join(import.meta.dirname, 'partials');
