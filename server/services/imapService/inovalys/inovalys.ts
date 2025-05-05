import { z } from 'zod';
import type {
  ExportAnalysis,
  ExportDataFromEmail, ExportDataSubstance, ExportResultNonQuantifiable, ExportResultQuantifiable,
  LaboratoryConf
} from '../index';
import { csvToJson, frenchNumberStringValidator } from '../utils';
import { inovalysReferential, inovalysUnknownReferences } from './inovalysReferential';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { ExtractError } from '../extractError';

const codeMethods = [
  'M-ARCO/M/021', 'M-ARCO/M021', 'M-ARCO/M/022', 'M-ARCO/M/023', 'M-ARCO/M/024', 'M-ARCO/M/031', 'M-ARCO/M/033', 'M-ARCO/M/045', 'M-ARCO/M/056', 'M-ARCO/M/059', 'M-ARCO/M/060', 'M-ARCO/M/064', 'M-ARCO/M/065', 'M-ARCO/M/066', 'Méthode interne'
] as const
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
} as const satisfies Record<typeof codeMethods[number], AnalysisMethod>

// Visible for testing
export const extractAnalyzes = (
  files: InovalysCSVFile[]
): Omit<ExportAnalysis, 'pdfFile'>[] => {

  const resultatsFile = files.find(f => f.fileName.endsWith('FICRES.csv'))
  if (resultatsFile === undefined) {
    throw new ExtractError('Aucun fichier CSV pour les résultats de trouvé.')
  }

  const sampleFile = files.find(({fileName}) => fileName.endsWith('FICECH.csv'))
  if (sampleFile === undefined) {
    throw new ExtractError("Aucun fichier CSV pour l'échantillon de trouvé.")
  }

  const dossierValidator = z.string().brand()
  const echantillonValidator = z.string().brand()

  const sampleFileValidator = z.array(z.object({
    Dossier: dossierValidator,
    Echant: echantillonValidator,
    'Réf Client': z.string(),
    Commentaire: z.string(),
    Conclusion: z.string()
  }))

  const {data: samplesData, error: samplesError} = sampleFileValidator.safeParse(sampleFile.content.filter(row => row.Dossier !== ''))
  if (samplesError) {
    throw new ExtractError(`Impossible d'extraire les données du fichier de l'échantillion: ${samplesError}`)
  }
  if (samplesData.length === 0) {
    throw new ExtractError(`Aucune donnée trouvée dans le fichier d'échantillon`)
  }

  const resultatsFileValidator = z.array(z.object({
    Dossier: dossierValidator,
    Echantillon: echantillonValidator,
    'Détermination': z.string(),
    'Code Méth': z.string(),
    'Réf Méthode': z.enum(codeMethods),
    'Résultat 1': z.string(),
    // attention pour le moment on a tout en double, une ligne pour la LD et une autre pour la LQ, mais ça va surement changer
    'Limite Quant. 1': z.string(),
    'Code Sandre': z.string().transform(v => v === '' ? null : v),
    'Incertitude': z.string().optional(),
    //LMR
    'Spécification 1': z.coerce.number().optional().transform((v) => v ?? 0),
    'Numéro CAS': z.string().optional().transform(v => v === '' || v === undefined ? null : v),
  }));


  const {data: resultatsData, error: resultatsError} = resultatsFileValidator.safeParse(resultatsFile.content.filter(row => row.Dossier !== '' && row.Dossier !== undefined && row['Détermination'] !== ''))
  if (resultatsError) {
    throw new ExtractError(`Impossible d'extraire les données du fichier des résultats: ${resultatsError}`)
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(`Aucune donnée trouvée dans le fichier de résultats`)
  }

  const samplesWithResultats = samplesData.reduce<{sample: z.infer<typeof sampleFileValidator>[number], resultats: z.infer<typeof resultatsFileValidator>}[]>((acc, sample) => {
    acc.push({sample, resultats: resultatsData.filter(({Dossier, Echantillon}) => Dossier === sample.Dossier && Echantillon === sample.Echant)})
    return acc
  }, [])


 const result:  Omit<ExportAnalysis, 'pdfFile'>[] = []
  for (const sampleWithResultat of samplesWithResultats) {

    const residues: ExportDataSubstance[] = sampleWithResultat.resultats
      .filter((r) => r['Limite Quant. 1'].startsWith('<'))
      .map((r) => {
        const resultatAsNumber = frenchNumberStringValidator.safeParse(
          r['Résultat 1']
        );

        const result: ExportResultQuantifiable | ExportResultNonQuantifiable =
          resultatAsNumber.success
            ? {
                result: resultatAsNumber.data,
                result_kind: 'Q',
                lmr: r['Spécification 1']
              }
            : {
                result_kind: r['Spécification 1'] > 0 ? 'NQ' : 'ND'
              };

        return {
          ...result,
          label: r['Détermination'],
          casNumber: r['Numéro CAS'] ?? null,
          codeSandre: r['Code Sandre'] ?? null,
          analysisMethod: codeMethodsAnalyseMethod[r['Réf Méthode']]
        }
      });


    result.push({
      sampleReference: sampleWithResultat.sample['Réf Client'],
      notes: sampleWithResultat.sample.Commentaire,
      residues
    })
  }

  return result

};


type InovalysCSVFile = { fileName: string; content: Record<string, string>[] };
const exportDataFromEmail: ExportDataFromEmail = (email) => {
  const csvFiles = email.attachments.filter(
    ({ filename }) => (filename ?? '').endsWith('.csv')
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
    const pdfAttachment = email.attachments.find(
      ({ contentType, filename }) =>
        contentType === 'application/pdf' &&
        filename?.startsWith(analysis.sampleReference)
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
  ssd2IdByLabel: inovalysReferential,
  unknownReferences: inovalysUnknownReferences,
};
