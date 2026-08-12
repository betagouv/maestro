import { ExtractError } from '../../extractError';
import type {
  ExportAnalysis,
  ExportDataFromEmail,
  LaboratoryConf
} from '../../index';
import { parseLnrReport } from './lnrParser';
import { extractPdfText } from './pdfText';

const exportDataFromEmail: ExportDataFromEmail = async (attachments) => {
  const pdfFiles = attachments.filter(
    ({ contentType, filename }) =>
      contentType === 'application/pdf' && (filename ?? '').endsWith('.pdf')
  );

  if (pdfFiles.length === 0) {
    throw new ExtractError(`Au moins un fichier PDF doit être présent en PJ`);
  }

  const analyzes: ExportAnalysis[] = [];

  for (const pdfFile of pdfFiles) {
    const text = await extractPdfText(pdfFile.content);
    const analysis = parseLnrReport(text);

    analyzes.push({
      ...analysis,
      pdfFile: new File(
        [new Uint8Array(pdfFile.content)],
        pdfFile.filename ?? ''
      )
    });
  }

  return analyzes;
};

export const lnrConf: LaboratoryConf = {
  exportDataFromEmail,
  getAnalysisKey: (email) => email.messageUid,
  emailCountByAnalysis: 1
};
