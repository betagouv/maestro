import { format } from 'date-fns';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { maestroDateRefined } from 'maestro-shared/utils/date';
import XLSX, { WorkBook } from 'xlsx';
import { z } from 'zod';
import { ExtractBadFormatError, ExtractError } from '../extractError';
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

const methodValidator = z.literal(['Multi-résidus', 'Mono résidus']).nullish();

export const cerecoRefValidator = z.string().transform((l) => {
  let firstPart: string;
  if (l.includes(':')) {
    firstPart = l.substring(0, l.indexOf(':'));
  } else {
    firstPart = l.substring(0, l.lastIndexOf('-'));
  }

  return firstPart.trim().substring(0, firstPart.lastIndexOf('-'));
});
const fileValidator = z.array(
  z
    .looseObject({})
    .transform((o) => {
      // supprime les éventuels espaces dans les headers
      const rawDataTrimed: Record<string, unknown> = {};
      for (const key in o) {
        rawDataTrimed[key.trim()] = o[key];
      }
      return rawDataTrimed;
    })
    .pipe(
      z.object({
        'Sample Name': cerecoRefValidator,
        "Date d'analyse": z
          .date()
          .transform((d) => {
            return format(d, 'yyyy-MM-dd');
          })
          .pipe(maestroDateRefined),
        Méthode: methodValidator,
        "Méthode d'analyse": methodValidator,
        Paramètre: z.string(),
        Résultat: z.coerce.string(),
        LMR: z.coerce.number().optional(),
        Conclusion: z.string()
      })
    )
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

  const { data: result, error } = fileValidator.safeParse(raw_data);

  if (error) {
    throw new ExtractBadFormatError(error);
  }

  const data = result.filter((d) => !d.Paramètre.startsWith('Analyse'));

  return [
    {
      sampleReference: data[0]['Sample Name'],
      notes: data[0].Conclusion,
      residues: data.map((d) => {
        const analysisMethod = d['Méthode'] || d["Méthode d'analyse"];

        if (!analysisMethod) {
          throw new ExtractError("Méthode d'analyse introuvable");
        }
        const commonData: Pick<
          ExportDataSubstance,
          | 'analysisMethod'
          | 'codeSandre'
          | 'casNumber'
          | 'label'
          | 'analysisDate'
        > = {
          analysisMethod: analysisMethod === 'Mono résidus' ? 'Mono' : 'Multi',
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
  const xlsFiles = attachments.filter(
    ({ filename }) =>
      (filename ?? '').endsWith('.xls') || (filename ?? '').endsWith('.xlt')
  );

  if (xlsFiles?.length !== 1) {
    throw new ExtractError(`1 fichiers XLS doit être présent en PJ`);
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

export const cerecoConf: LaboratoryConf & {
  ssd2IdByLabel: Record<string, SSD2Id>;
  unknownReferences: string[];
} = {
  exportDataFromEmail,
  ssd2IdByLabel: cerecoReferential,
  unknownReferences: cerecoUnknownReferences,
  getAnalysisKey: (email) => email.messageUid,
  emailCountByAnalysis: 1
};
