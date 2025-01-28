import {  tail, zipObject } from 'lodash-es';
import { z } from 'zod';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExtractError,
  IsSender,
  LaboratoryConf
} from './index';

//TODO AUTO_LABO en attente de la réception du 1er email + test
const isSender: IsSender = (_emailSender) => false;


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
    'Résultat 1': z.string(),
    //FIXME attention pour le moment on a tout en double, une ligne pour la LD et une autre pour la LQ, mais ça va surement changer
    'Limite Quant. 1': z.string(),
    'Code Sandre': z.string().optional(),
    'Incertitude': z.string().optional(),
    //FIXME ajout du CAS number ?!
    //FIXME il manque la LMR
  }));


  const {data: resultatsData, error: resultatsError} = resultatsFileValidator.safeParse(resultatsFile.content.filter(row => row.Dossier !== '' && row.Dossier !== undefined))
  if (resultatsError) {
    throw new ExtractError(`Impossible d'extraire les données du fichier des résultats: ${resultatsError}`)
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(`Aucune donnée trouvée dans le fichier de résultats`)
  }



  const sampleWithResultats = samplesData.reduce<{sample: z.infer<typeof sampleFileValidator>[number], resultats: z.infer<typeof resultatsFileValidator>}[]>((acc, sample) => {
    acc.push({sample, resultats: resultatsData.filter(({Dossier, Echantillon}) => Dossier === sample.Dossier && Echantillon === sample.Echant)})
    return acc
  }, [])

  console.log(sampleWithResultats)

  //FIXME
  return []

};

const csvToJson = (csv: string): Record<string, string>[] => {
  const separator = ';'
  const content = csv.split('\n');
  const header = content[0].split(separator);
  return tail(content).map((row) => {
    return zipObject(header, row.split(separator));
  });
};

type InovalysCSVFile = { fileName: string; content: Record<string, string>[] };
const exportDataFromEmail: ExportDataFromEmail = (email) => {
  const csvFiles = email.attachments.filter(
    ({ contentType }) => contentType === 'text/csv'
  );

  if (csvFiles?.length !== 3) {
    throw new ExtractError(
      `3 fichiers CSV doivent être présents, seulement ${csvFiles.length ?? 0} en PJ`
    );
  }

  const inovalysCSVFiles: InovalysCSVFile[] = csvFiles.map((file) => {
    return {
      fileName: file.filename ?? '',
      content: csvToJson(file.content.toString('latin1'))
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
  isSender,
  exportDataFromEmail
};
