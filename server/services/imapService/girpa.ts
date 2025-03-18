import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportDataSubstance,
  ExtractError,
  IsSender,
  LaboratoryConf
} from './index';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { frenchNumberStringValidator } from './utils';

//TODO AUTO_LABO en attente de la réception du 1er email + test
const isSender: IsSender = (_emailSender) => false;

const girpaReferences: Record<string, SSD2Id> = {
  'prothioconazole: prothioconazole-desthio': 'RF-0868-001-PPP',
  napropamide: 'RF-00012802-PAR'
};


export const residueCasNumberValidator = z.string().brand('CAS number');

export const residueEnglishNameValidator = z
  .string()
  .brand('ResidueEnglishName');

export const analyseXmlValidator = z.object({
  Résultat: frenchNumberStringValidator,
  Limite_de_quantification: frenchNumberStringValidator,
  LMR: z.union([z.literal('-'), z.number(), frenchNumberStringValidator]),
  Substance_active_CAS: residueCasNumberValidator,
  Substance_active_anglais: residueEnglishNameValidator
});
// Visible for testing
export const extractAnalyzes = (
  obj: unknown
): Omit<ExportAnalysis, 'pdfFile'>[] => {
  const echantillonValidator = z.object({
    Code_échantillon: z.string(),
    Commentaire: z.string(),
    Analyse: z.array(analyseXmlValidator)
  });
  const validator = z.object({
    Rapport: z.object({
      Echantillon: z.union([
        echantillonValidator.transform((e) => [e]),
        z.array(echantillonValidator)
      ])
    })
  });

  const result = validator.parse(obj);

  return result.Rapport.Echantillon.map((echantillon) => {
    const residues: ExportDataSubstance[] = echantillon.Analyse
      .map((a) => {
        const isDetectable =  a.LMR === '-' ||
          a.Résultat > a.LMR ||
          a.Résultat >= a.Limite_de_quantification / 3

        const commonData = {
          //FIXME
          analysisMethod: 'Multi' as const,
          codeSandre: null,
          casNumber: a.Substance_active_CAS,
          label: a.Substance_active_anglais.toLowerCase()
            .replace(' according reg.', '')
        }
        return a.LMR === '-'
          ? {
              result_kind: isDetectable ? 'NQ' : 'ND',
             ...commonData
            }
          : { result_kind: 'Q', result: a.Résultat, lmr: a.LMR, ...commonData };
      })
    return {
      sampleReference: echantillon['Code_échantillon'],
      notes: echantillon.Commentaire,
      residues
    };
  });
};

const exportDataFromEmail: ExportDataFromEmail = (email) => {
  const xmlFile = email.attachments.find(
    ({ contentType }) =>
      contentType === 'text/xml' || contentType === 'application/xml'
  );

  if (xmlFile !== undefined) {
    const parser = new XMLParser();
    const obj = parser.parse(xmlFile.content);

    const analyzes = extractAnalyzes(obj);

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
  } else {
    throw new ExtractError('Pas de fichier XML dans les pièces jointes');
  }
};

export const girpaConf: LaboratoryConf = {
  isSender,
  exportDataFromEmail,
  ssd2IdByLabel: girpaReferences
};
