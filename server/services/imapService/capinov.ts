import { z } from 'zod';
import {
  ExportAnalysis,
  ExportDataFromEmail,  ExportResultNonQuantifiable, ExportResultQuantifiable,
  ExtractError,
  IsSender,
  LaboratoryConf
} from './index';
import { csvToJson } from './utils';
import { groupBy } from 'lodash-es';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';

//TODO AUTO_LABO en attente de la réception du 1er email + test
const isSender: IsSender = (_emailSender) => false;

const capinovReferential: Record<string, SSD2Id> = {}

// Visible for testing
export const extractAnalyzes = (
  fileContent: Record<string, string>[]
): Omit<ExportAnalysis, 'pdfFile'>[] => {

  const fileValidator = z.array(z.object({
    'DEMANDE_NUMERO': z.string(),
    'PARAMETRE_NOM': z.string(),
    'RESULTAT_VALTEXTE': z.string(),
    'RESULTAT_VALNUM': z.coerce.number(),
    'PARAMETRE_LIBELLE': z.string(),
    'LIMITE_LQ': z.string(),
    'INCERTITUDE': z.string(),
    'CAS_NUMBER': z.string().transform(r => r === '' ? null : r),
    'TECHNIQUE': z.string(),
    'LMR_NUM': z.coerce.number()
  }))


  const {data: resultatsData, error: resultatsError} = fileValidator.safeParse(fileContent.filter(row => row.DEMANDE_NUMERO !== '' && row.DEMANDE_NUMERO !== undefined))
  if (resultatsError) {
    throw new ExtractError(`Impossible d'extraire les données du fichier des résultats: ${resultatsError}`)
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(`Aucune donnée trouvée dans le fichier de résultats`)
  }

  console.log(resultatsData)


  const resultsBySample = groupBy(resultatsData, 'DEMANDE_NUMERO' )
  console.log(resultsBySample['4844'])
  console.log(Object.keys(resultsBySample).length)

  //FIXME
  const result: Omit<ExportAnalysis, 'pdfFile'>[]  = [];

  for (const sampleReference in resultsBySample) {
    const analysis: Omit<ExportAnalysis, 'pdfFile'>= {
      sampleReference,
      notes: '',
      residues: []
    }

    for(const residue of resultsBySample[sampleReference]){
      const isDetectable =  residue.RESULTAT_VALTEXTE !== 'nd' &&
        residue.RESULTAT_VALTEXTE !== '0'

        const result: ExportResultQuantifiable | ExportResultNonQuantifiable = residue.RESULTAT_VALTEXTE === 'd, NQ' ? {
          result_kind: isDetectable ? 'NQ' : 'ND',
          } : {
          result_kind: 'Q',
          result: residue.RESULTAT_VALNUM,
          lmr: residue.LMR_NUM
        }
        analysis.residues.push({
          ...result,
          label: residue.PARAMETRE_NOM,
          casNumber: residue.CAS_NUMBER,
          //FIXME
          analysisMethod: 'Multi' as const,
          codeSandre: null
        })
      }

    result.push(analysis)
  }

  console.log(JSON.stringify(result.filter(r => r.residues.length), null, 2))

  //FIXME
  return []

};

const exportDataFromEmail: ExportDataFromEmail = (email) => {
  const csvFiles = email.attachments.filter(
    ({ contentType, filename }) => contentType === 'text/csv' || (contentType === 'text/plain' && filename?.endsWith('.csv'))
  );

  if (csvFiles?.length !== 1) {
    throw new ExtractError(
      `1 fichiers CSV doit être présent, trouvé ${csvFiles.length ?? 0} fichier en PJ`
    );
  }


  const csvContent = csvToJson(csvFiles[0].content.toString(), ';')
  const analyzes = extractAnalyzes(csvContent);

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

export const capinovConf: LaboratoryConf = {
  isSender,
  exportDataFromEmail,
  ssd2IdByLabel: capinovReferential
};
