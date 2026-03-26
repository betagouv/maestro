import fs from 'node:fs';
import path from 'node:path';

export type Template =
  | 'supportDocument'
  | 'sampleEmptyForm'
  | 'analysisReportDocument'
  | 'analysisRequest'
  | 'samplesExport'
  | 'samplesExportWithCodes'
  | 'prescriptionsExport'
  | 'laboratoryAnalyticCompetencesExport';

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
  samplesExportWithCodes: 'xls',
  prescriptionsExport: 'xls',
  laboratoryAnalyticCompetencesExport: 'xls'
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

export const partialsPath = () => path.join(import.meta.dirname, 'partials');
