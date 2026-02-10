import { groupBy } from 'lodash-es';
import { maestroDateRefined } from 'maestro-shared/utils/date';
import { z } from 'zod';
import { ExtractBadFormatError, ExtractError } from '../extractError';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportResultNonQuantifiable,
  ExportResultQuantifiable,
  LaboratoryConf
} from '../index';
import { csvToJson, frenchNumberStringValidator } from '../utils';

export const capinovCodeEchantillonValidator = z.string().transform((l) => {
  return l.trim().replaceAll(' ', '').split('-').slice(0, 3).join('-');
});
// Visible for testing
export const extractAnalyzes = (
  fileContent: Record<string, string>[]
): (Omit<ExportAnalysis, 'pdfFile'> & { capinovRef: string })[] => {
  const fileValidator = z.array(
    z.object({
      PREFIXE_NOM: z.string(),
      DEMANDE_NUMERO: z.string(),
      ECHANT_NUMERO: z.string(),
      LOT: capinovCodeEchantillonValidator,
      PARAMETRE_NOM: z.string(),
      RESULTAT_VALTEXTE: z.string(),
      RESULTAT_VALNUM: frenchNumberStringValidator,
      PARAMETRE_LIBELLE: z.string(),
      LIMITE_LQ: z.string(),
      CAS_NUMBER: z.string().transform((r) => (r === '' ? null : r)),
      TECHNIQUE: z.enum(['Mono', 'Multi'], {
        error: (iss): string => `Received ${iss.input}`
      }),
      LMR_NUM: frenchNumberStringValidator.nullish(),
      LMR: z
        .string()
        .transform((s) => Number(s.replace('*', '')))
        .pipe(z.number())
        .nullish(),
      // 16/04/2025
      ECHANT_DATE_DIFFUSION: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}/)
        .transform((date) => {
          const [d, m, y] = date.substring(0, 10).split('/');
          return `${y}-${m}-${d}`;
        })
        .pipe(maestroDateRefined),
      COMMENTAIRE: z.string().nullish()
    })
  );

  const { data: resultatsData, error: resultatsError } =
    fileValidator.safeParse(
      fileContent.filter((row) => row.LOT !== '' && row.LOT !== undefined)
    );
  if (resultatsError) {
    throw new ExtractBadFormatError(resultatsError);
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(
      `Aucune donnée trouvée dans le fichier de résultats`
    );
  }

  const resultsBySample = groupBy(resultatsData, 'LOT');
  const result: ReturnType<typeof extractAnalyzes> = [];

  for (const sampleReference in resultsBySample) {
    const firstLine = resultsBySample[sampleReference][0];
    const analysis: (typeof result)[number] = {
      sampleReference,
      capinovRef: `${firstLine.PREFIXE_NOM} ${firstLine.DEMANDE_NUMERO} ${firstLine.ECHANT_NUMERO}`,
      notes: firstLine.COMMENTAIRE ?? '',
      residues: []
    };

    for (const residue of resultsBySample[sampleReference]) {
      const isSumAndLessThanLQ: boolean =
        residue.PARAMETRE_NOM.endsWith('_S') &&
        residue.RESULTAT_VALTEXTE === '< LQ';

      const isDetectable =
        residue.RESULTAT_VALTEXTE !== 'nd' && residue.RESULTAT_VALTEXTE !== '0';

      const result: ExportResultQuantifiable | ExportResultNonQuantifiable =
        !isDetectable || isSumAndLessThanLQ
          ? { result_kind: 'ND' }
          : residue.RESULTAT_VALTEXTE === 'd, NQ' ||
              residue.RESULTAT_VALTEXTE === '< LQ'
            ? {
                result_kind: 'NQ'
              }
            : {
                result_kind: 'Q',
                result: residue.RESULTAT_VALNUM,
                lmr: residue.LMR_NUM
                  ? residue.LMR_NUM
                  : residue.LMR
                    ? residue.LMR
                    : null
              };
      analysis.residues.push({
        ...result,
        label: residue.PARAMETRE_LIBELLE,
        casNumber: residue.CAS_NUMBER,
        analysisMethod: residue.TECHNIQUE,
        codeSandre: null,
        analysisDate: residue.ECHANT_DATE_DIFFUSION
      });
    }

    result.push(analysis);
  }

  return result;
};

const exportDataFromEmail: ExportDataFromEmail = async (attachments) => {
  const csvFiles = attachments.filter(
    ({ contentType, filename }) =>
      contentType === 'text/csv' ||
      (contentType === 'text/plain' && filename?.endsWith('.csv'))
  );

  if (csvFiles?.length !== 1) {
    throw new ExtractError(
      `1 fichiers CSV doit être présent, trouvé ${csvFiles.length ?? 0} fichier en PJ`
    );
  }

  const csvContent = csvToJson(csvFiles[0].content.toString('latin1'), ';');
  const analyzes = extractAnalyzes(csvContent);

  const analyzesWithPdf: ExportAnalysis[] = [];

  for (const analysis of analyzes) {
    const pdfAttachment = attachments.find(
      ({ contentType, filename }) =>
        contentType === 'application/pdf' &&
        filename?.startsWith(analysis.capinovRef)
    );

    if (pdfAttachment === undefined) {
      throw new ExtractError(
        `Aucun fichier pdf pour ${analysis.sampleReference}`
      );
    }

    const pdfFile: File = new File(
      [pdfAttachment.content],
      pdfAttachment.filename ?? ''
    );
    analyzesWithPdf.push({ ...analysis, pdfFile });
  }

  return analyzesWithPdf;
};

export const getAnalysisKeyByFileName = (filename: string): string => {
  if (filename.endsWith('.csv')) {
    //  Example: Capinov_Export_MAESTRO 2025_6.8603.1 20250901
    return filename.substring(
      filename.indexOf(' ') + 1,
      filename.lastIndexOf(' ')
    );
  }

  if (filename.endsWith('.pdf')) {
    const tokens = filename.split(' ');

    //  Example: 2025_6 8603 1  ...
    return `${tokens[0]}.${tokens[1]}.${tokens[2]}`;
  }

  return '';
};

export const capinovConf: LaboratoryConf = {
  exportDataFromEmail,
  getAnalysisKey: (email) => {
    const attachment = email.attachments[0];

    const filename = attachment.filename;
    if (filename) {
      return getAnalysisKeyByFileName(filename);
    }

    return '';
  },
  emailCountByAnalysis: 2
};
