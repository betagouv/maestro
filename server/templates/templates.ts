import fs from 'fs';
import path from 'path';

export type Template =
  | 'supportDocument'
  | 'analysisReportDocument'
  | 'analysisRequest';

const TemplateFileTypes: Record<Template, string> = {
  supportDocument: 'hbs',
  analysisReportDocument: 'hbs',
  analysisRequest: 'xlsx'
};

export const templatePath = (template: Template) =>
  path.join(
    import.meta.dirname,
    template,
    `${template}.${TemplateFileTypes[template]}`
  );

export const templateContent = (template: Template) =>
  fs.readFileSync(templatePath(template), 'utf8');

export const templateStylePath = (template: Template) =>
  path.join(import.meta.dirname, template, `${template}.css`);
