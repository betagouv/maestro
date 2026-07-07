import XLSX, { type WorkBook } from '@e965/xlsx';
import { format } from 'date-fns';
import { maestroDateRefined } from 'maestro-shared/utils/date';
import { z } from 'zod';
import { ExtractBadFormatError, ExtractError } from '../../extractError';
import type {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportDataSubstance,
  LaboratoryConf
} from '../../index';
import { parseSampleReference } from '../../utils';

const methodValidator = z.literal(['Multi-résidus', 'Mono résidus']).nullish();

export const cerecoRefValidator = z.string().transform((l, ctx) => {
  // Strip matrix suffix (e.g. " : Olives" or " - Olives")
  const withoutMatrix = l.split(/\s+[:-]\s+/)[0].trim();
  const parsed = parseSampleReference(withoutMatrix);
  if (!parsed) {
    ctx.addIssue({
      code: 'custom',
      message: `Référence cereco invalide: ${l}`
    });
    return z.NEVER;
  }
  return parsed;
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
        'Numéro (MS)': methodValidator,
        Paramètre: z.string(),
        Résultat: z.coerce.string(),
        LMR: z
          .union([z.coerce.number(), z.literal('NA').transform(() => null)])
          .optional(),
        Conclusion: z.string().default('')
      })
    )
);

const extractAnalysis = async (
  fileContent: Buffer
): Promise<Omit<ExportAnalysis, 'pdfFile'>> => {
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

  return {
    sampleReference: data[0]['Sample Name'].reference,
    copyNumber: data[0]['Sample Name'].copyNumber,
    itemNumber: data[0]['Sample Name'].itemNumber,
    notes: data[0].Conclusion,
    residues: data.map((d) => {
      const analysisMethod =
        d['Méthode'] || d["Méthode d'analyse"] || d['Numéro (MS)'];

      if (!analysisMethod) {
        throw new ExtractError("Méthode d'analyse introuvable");
      }
      const commonData: Pick<
        ExportDataSubstance,
        'analysisMethod' | 'codeSandre' | 'casNumber' | 'label' | 'analysisDate'
      > = {
        analysisMethod: analysisMethod === 'Mono résidus' ? 'Mono' : 'Multi',
        codeSandre: null,
        casNumber: null,
        label: d.Paramètre,
        analysisDate: d["Date d'analyse"]
      };

      const result = z.coerce.number().safeParse(d.Résultat);

      if (!result.error) {
        return {
          result_kind: 'Q',
          result: result.data,
          lmr: d.LMR ?? null,
          ...commonData
        };
      }

      if (d.Résultat.trim().toLowerCase().startsWith('détecté')) {
        return {
          result_kind: 'NQ',
          ...commonData
        };
      }

      return {
        result_kind: 'ND',
        ...commonData
      };
    })
  };
};

// Le seul jeton commun entre le XLS et son PDF est le dernier groupe de
// chiffres du nom de fichier (ex: "rapport 3266.xls" <-> "B26-R9047-3266.pdf")
const getFilePairingKey = (filename: string | undefined): string | null => {
  const basename = (filename ?? '').replace(/\.[^.]+$/, '');
  const digitGroups = basename.match(/\d+/g);
  return digitGroups ? digitGroups[digitGroups.length - 1] : null;
};
const exportDataFromEmail: ExportDataFromEmail = async (attachments) => {
  const xlsFiles = attachments.filter(
    ({ filename }) =>
      (filename ?? '').endsWith('.xls') || (filename ?? '').endsWith('.xlt')
  );

  if (xlsFiles.length === 0) {
    throw new ExtractError(`Au moins un fichier XLS doit être présent en PJ`);
  }

  const pdfFiles = attachments.filter(
    ({ contentType, filename }) =>
      contentType === 'application/pdf' && (filename ?? '').endsWith('.pdf')
  );

  // un email peut contenir plusieurs analyses : une paire XLS + PDF par analyse
  const analyzesWithPdf: ExportAnalysis[] = [];

  for (const xlsFile of xlsFiles) {
    const analysis = await extractAnalysis(xlsFile.content);

    const matchingPdfs =
      xlsFiles.length === 1 && pdfFiles.length === 1
        ? pdfFiles
        : pdfFiles.filter(
            ({ filename }) =>
              getFilePairingKey(filename) ===
              getFilePairingKey(xlsFile.filename)
          );

    if (matchingPdfs.length !== 1) {
      throw new ExtractError(
        `Impossible d'associer un unique fichier PDF à l'analyse ${analysis.sampleReference} (${xlsFile.filename ?? ''})`
      );
    }

    const pdfAttachment = matchingPdfs[0];
    const pdfFile: File = new File(
      [new Uint8Array(pdfAttachment.content)],
      pdfAttachment.filename ?? ''
    );
    analyzesWithPdf.push({ ...analysis, pdfFile });
  }

  return analyzesWithPdf;
};

export const cerecoConf: LaboratoryConf = {
  exportDataFromEmail,
  getAnalysisKey: (email) => email.messageUid,
  emailCountByAnalysis: 1
};
