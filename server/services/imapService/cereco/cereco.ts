import { format } from 'date-fns';
import { maestroDate } from 'maestro-shared/utils/date';
import XLSX, { WorkBook } from 'xlsx';
import { z } from 'zod/v4';
import { ExtractError } from '../extractError';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportDataSubstance,
  LaboratoryConf
} from '../index';
import {
  cerecoReferential,
  cerecoUnknownReferences
} from './cerecoReferential';

const fileValidator = z.array(
  z.object({
    'Sample Name': z.string().transform((l) => {
      return l
        .substring(0, l.indexOf(':'))
        .trim()
        .substring(0, l.lastIndexOf('-'));
    }),
    "Date d'analyse": z
      .date()
      .transform((d) => {
        return format(d, 'yyyy-MM-dd');
      })
      .pipe(maestroDate),
    'Numéro (MS)': z.literal(['Multi-résidus', 'Mono résidus']),
    Paramètre: z.string(),
    Résultat: z.string(),
    LMR: z.coerce.number().optional(),
    Conclusion: z.string()
  })
);

const extractAnalyzes = async (
  fileContent: Buffer
): Promise<Omit<ExportAnalysis, 'pdfFile'>[]> => {
  const workbook: WorkBook = XLSX.read(fileContent, {
    type: 'buffer',
    cellDates: true
  });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw_data = XLSX.utils.sheet_to_json(worksheet);

  const data = fileValidator
    .parse(raw_data)
    .filter((d) => !d.Paramètre.startsWith('Analyse'));

  return [
    {
      sampleReference: data[0]['Sample Name'],
      notes: data[0].Conclusion,
      residues: data.map((d) => {
        const commonData: Pick<
          ExportDataSubstance,
          | 'analysisMethod'
          | 'codeSandre'
          | 'casNumber'
          | 'label'
          | 'analysisDate'
        > = {
          analysisMethod:
            d['Numéro (MS)'] === 'Mono résidus' ? 'Mono' : 'Multi',
          codeSandre: null,
          casNumber: null,
          label: d.Paramètre,
          analysisDate: d["Date d'analyse"]
        };

        const result = z.coerce.number().safeParse(d.Résultat);

        return result.error
          ? {
              result_kind: 'ND',
              ...commonData
            }
          : {
              result_kind: 'Q',
              result: result.data,
              lmr: d.LMR ?? null,
              ...commonData
            };
      })
    }
  ];
};
const exportDataFromEmail: ExportDataFromEmail = async (attachments) => {
  const xlsFiles = attachments.filter(({ filename }) =>
    (filename ?? '').endsWith('.xls')
  );

  if (xlsFiles?.length !== 1) {
    throw new ExtractError(`1 fichiers CSV doit être présent en PJ`);
  }

  const analyzes = await extractAnalyzes(xlsFiles[0].content);

  const analyzesWithPdf: ExportAnalysis[] = [];

  for (const analysis of analyzes) {
    const pdfAttachment = attachments.find(
      ({ contentType, filename }) =>
        contentType === 'application/pdf' && filename?.endsWith('.pdf')
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

export const cerecoConf: LaboratoryConf = {
  exportDataFromEmail,
  ssd2IdByLabel: cerecoReferential,
  unknownReferences: cerecoUnknownReferences
};
