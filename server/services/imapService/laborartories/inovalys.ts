import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { maestroDateRefined } from 'maestro-shared/utils/date';
import { z } from 'zod';
import { ExtractBadFormatError, ExtractError } from '../extractError';
import type {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportDataSubstance,
  ExportResultNonQuantifiable,
  ExportResultQuantifiable,
  LaboratoryConf
} from '../index';
import { csvToJson, frenchNumberStringValidator } from '../utils';

const codeMethods = [
  'M-ARCO/M/021',
  'M-ARCO/M021',
  'M-ARCO/M/022',
  'M-ARCO/M/023',
  'M-ARCO/M/024',
  'M-ARCO/M/031',
  'M-ARCO/M/033',
  'M-ARCO/M/045',
  'M-ARCO/M/056',
  'M-ARCO/M/059',
  'M-ARCO/M/060',
  'M-ARCO/M/064',
  'M-ARCO/M/065',
  'M-ARCO/M/066',
  'Méthode interne'
] as const;
const codeMethodsAnalyseMethod = {
  'M-ARCO/M/021': 'Multi',
  'M-ARCO/M021': 'Multi',
  'M-ARCO/M/022': 'Mono',
  'M-ARCO/M/023': 'Mono',
  'M-ARCO/M/024': 'Mono',
  'M-ARCO/M/031': 'Mono',
  'M-ARCO/M/033': 'Mono',
  'M-ARCO/M/045': 'Mono',
  'M-ARCO/M/056': 'Mono',
  'M-ARCO/M/059': 'Mono',
  'M-ARCO/M/060': 'Mono',
  'M-ARCO/M/064': 'Mono',
  'M-ARCO/M/065': 'Mono',
  'M-ARCO/M/066': 'Mono',
  'Méthode interne': 'Mono'
} as const satisfies Record<(typeof codeMethods)[number], AnalysisMethod>;

export const inovalysRefClientValidator = z.string().transform((l) => {
  const count = (l.match(/-/g) || []).length;

  if (count === 3) {
    return l.substring(0, l.lastIndexOf('-'));
  }

  return l;
});

// Visible for testing
export const extractAnalyzes = (
  files: InovalysCSVFile[]
): Omit<ExportAnalysis, 'pdfFile'>[] => {
  const resultatsFile = files.find((f) => f.fileName.endsWith('CO2.csv'));
  if (resultatsFile === undefined) {
    throw new ExtractError('Aucun fichier CSV pour les résultats de trouvé.');
  }

  const sampleFile = files.find(({ fileName }) => fileName.endsWith('CO1.csv'));
  if (sampleFile === undefined) {
    throw new ExtractError("Aucun fichier CSV pour l'échantillon de trouvé.");
  }

  const dossierValidator = z.string().brand();
  const echantillonValidator = z.string().brand();

  const sampleFileValidator = z.array(
    z.object({
      Dossier: dossierValidator,
      Echant: echantillonValidator,
      'Réf Client': inovalysRefClientValidator,
      Commentaire: z.string(),
      Conclusion: z.string()
    })
  );

  const { data: samplesData, error: samplesError } =
    sampleFileValidator.safeParse(
      sampleFile.content.filter((row) => row.Dossier !== '')
    );
  if (samplesError) {
    throw new ExtractBadFormatError(samplesError);
  }
  if (samplesData.length === 0) {
    throw new ExtractError(
      `Aucune donnée trouvée dans le fichier d'échantillon`
    );
  }

  const resultatsFileValidator = z.array(
    z.object({
      Dossier: dossierValidator,
      Echantillon: echantillonValidator,
      Détermination: z.string(),
      'Code Méth': z.string(),
      'Réf Méthode': z.enum(codeMethods),
      'Résultat 1': z.union([
        z.literal('ND'),
        z.literal('<LQ'),
        z.literal('d<LQ'),
        frenchNumberStringValidator
      ]),
      'Code Sandre': z.string().transform((v) => (v === '' ? null : v)),
      Incertitude: z.string().optional(),
      //LMR
      'Spécification 1': z
        .union([frenchNumberStringValidator, z.string().startsWith('<')])
        .optional()
        .transform((v) => (typeof v === 'number' ? v : null)),
      'Numéro CAS': z
        .string()
        .optional()
        .transform((v) => (v === '' || v === undefined ? null : v)),
      'Date Analyse': z
        .union([z.literal(''), z.string().regex(/^\d{2}\/\d{2}\/\d{4}.*/)])
        .transform((date) => {
          if (date === '') {
            return null;
          }
          const [d, m, y] = date.substring(0, 10).split('/');
          return `${y}-${m}-${d}`;
        })
        .pipe(maestroDateRefined.nullable())
    })
  );

  const { data: resultatsData, error: resultatsError } =
    resultatsFileValidator.safeParse(
      resultatsFile.content.filter(
        (row) =>
          row.Dossier !== '' &&
          row.Dossier !== undefined &&
          row['Détermination'] !== ''
      )
    );
  if (resultatsError) {
    throw new ExtractBadFormatError(resultatsError);
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(
      `Aucune donnée trouvée dans le fichier de résultats`
    );
  }

  const samplesWithResultats = samplesData.reduce<
    {
      sample: z.infer<typeof sampleFileValidator>[number];
      resultats: z.infer<typeof resultatsFileValidator>;
    }[]
  >((acc, sample) => {
    acc.push({
      sample,
      resultats: resultatsData.filter(
        ({ Dossier, Echantillon }) =>
          Dossier === sample.Dossier && Echantillon === sample.Echant
      )
    });
    return acc;
  }, []);

  const result: Omit<ExportAnalysis, 'pdfFile'>[] = [];
  for (const sampleWithResultat of samplesWithResultats) {
    const residues: ExportDataSubstance[] = sampleWithResultat.resultats.map(
      (r) => {
        let result: ExportResultQuantifiable | ExportResultNonQuantifiable;
        if (r['Résultat 1'] === 'ND') {
          result = { result_kind: 'ND' };
        } else if (r['Résultat 1'] === '<LQ' || r['Résultat 1'] === 'd<LQ') {
          const resultKind = r['Code Méth'] === 'CALCUL' ? 'ND' : 'NQ';
          result = { result_kind: resultKind };
        } else {
          result = {
            result: r['Résultat 1'],
            result_kind: 'Q',
            lmr: r['Spécification 1']
          };
        }

        return {
          ...result,
          label: r['Détermination'],
          casNumber: r['Numéro CAS'] ?? null,
          codeSandre: r['Code Sandre'] ?? null,
          analysisMethod: codeMethodsAnalyseMethod[r['Réf Méthode']],
          analysisDate: r['Date Analyse']
        };
      }
    );

    result.push({
      sampleReference: sampleWithResultat.sample['Réf Client'],
      notes: sampleWithResultat.sample.Commentaire,
      residues
    });
  }

  return result;
};

type InovalysCSVFile = { fileName: string; content: Record<string, string>[] };
const exportDataFromEmail: ExportDataFromEmail = async (attachments) => {
  const csvFiles = attachments.filter(({ filename }) =>
    (filename ?? '').endsWith('.csv')
  );

  if (csvFiles?.length !== 3) {
    throw new ExtractError(
      `3 fichiers CSV doivent être présents, seulement ${csvFiles.length ?? 0} en PJ`
    );
  }

  const inovalysCSVFiles: InovalysCSVFile[] = csvFiles.map((file) => {
    return {
      fileName: file.filename ?? '',
      content: csvToJson(file.content.toString('latin1'), ';')
    };
  });
  const analyzes = extractAnalyzes(inovalysCSVFiles);

  const analyzesWithPdf: ExportAnalysis[] = [];

  for (const analysis of analyzes) {
    const pdfAttachment = attachments.find(
      ({ contentType, filename }) =>
        contentType === 'application/pdf' &&
        filename?.includes(analysis.sampleReference)
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

export const inovalysConf: LaboratoryConf = {
  exportDataFromEmail,
  getAnalysisKey: (email) => email.subject ?? '',
  emailCountByAnalysis: 2
};
