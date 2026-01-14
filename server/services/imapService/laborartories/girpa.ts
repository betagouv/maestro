import { XMLParser } from 'fast-xml-parser';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { maestroDateRefined } from 'maestro-shared/utils/date';
import { z } from 'zod';
import { ExtractBadFormatError, ExtractError } from '../extractError';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportDataSubstance,
  LaboratoryConf
} from '../index';
import { frenchNumberStringValidator } from '../utils';

const codeMethods = ['M1', 'M26', 'M3', 'M18', 'M21', 'M23', 'M27'] as const;
const codeMethodsAnalyseMethod = {
  M1: 'Multi',
  M26: 'Multi',
  M3: 'Mono',
  M18: 'Mono',
  M21: 'Mono',
  M23: 'Mono',
  M27: 'Mono'
} as const satisfies Record<(typeof codeMethods)[number], AnalysisMethod>;
const isCodeMethod = (code: string): code is (typeof codeMethods)[number] =>
  (codeMethods as Readonly<string[]>).includes(code);

const residueCasNumberValidator = z.string().brand('CAS number');

const residueEnglishNameValidator = z.string().brand('ResidueEnglishName');

export const analyseXmlValidator = z.object({
  Résultat: frenchNumberStringValidator.or(z.number()),
  Limite_de_quantification: frenchNumberStringValidator.or(z.number()),
  LMR: z
    .union([z.literal('-'), z.number(), frenchNumberStringValidator])
    .transform((a) => (a === '-' ? null : a)),
  Substance_active_CAS: residueCasNumberValidator,
  Substance_active_anglais: residueEnglishNameValidator,
  //'16/04/2025 21:09:28'
  Date_analyse: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}.*/)
    .transform((date) => {
      const [d, m, y] = date.substring(0, 10).split('/');
      return `${y}-${m}-${d}`;
    })
    .pipe(maestroDateRefined),
  Code_méthode: z
    .string()
    .transform((s) => (s.endsWith('*') ? s.substring(0, s.length - 1) : s))
    .refine((s) => isCodeMethod(s) || s === '-')
});

export const girpaCodeEchantillonValidator = z.string().transform((l) => {
  const result = l
    .trim()
    .substring(0, l.length - 2)
    .trim()
    .replaceAll(' ', '');

  if (result.endsWith('-')) {
    return result.substring(0, result.length - 1);
  }
  return result;
});

type GirpaAnaysis = Omit<ExportAnalysis, 'pdfFile'> & {
  girpaReference: string;
};
// Visible for testing
export const extractAnalyzes = (obj: unknown): GirpaAnaysis[] => {
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

  const { data: result, error } = validator.safeParse(obj);
  if (error) {
    throw new ExtractBadFormatError(error);
  }

  return result.Rapport.Echantillon.map((echantillon) => {
    const residues: ExportDataSubstance[] = echantillon.Analyse.filter(
      (a) => a.Substance_active_anglais !== 'impression étiquettes'
    ).map((a) => {
      const isND = a.Résultat < a.Limite_de_quantification / 3;
      const isNQ = !isND && a.Résultat < a.Limite_de_quantification;

      if (a.Code_méthode === '-') {
        throw new ExtractError(
          `Le code méthode est incorrect, la valeur « - » est réservée pour l'entête`
        );
      }

      const commonData = {
        analysisMethod:
          codeMethodsAnalyseMethod[
            a.Code_méthode as (typeof codeMethods)[number]
          ],
        codeSandre: null,
        casNumber: a.Substance_active_CAS,
        label: a.Substance_active_anglais,
        analysisDate: a.Date_analyse
      };
      return isNQ || isND
        ? {
            result_kind: isND ? 'ND' : 'NQ',
            ...commonData
          }
        : { result_kind: 'Q', result: a.Résultat, lmr: a.LMR, ...commonData };
    });
    return {
      sampleReference: girpaCodeEchantillonValidator.parse(
        echantillon['Code_échantillon']
      ),
      girpaReference: echantillon['Code_échantillon'],
      notes: echantillon.Commentaire,
      residues
    };
  });
};

const exportDataFromEmail: ExportDataFromEmail = async (attachments) => {
  const xmlFile = attachments.find(
    ({ contentType }) =>
      contentType === 'text/xml' || contentType === 'application/xml'
  );

  if (xmlFile !== undefined) {
    const parser = new XMLParser();
    const obj = parser.parse(xmlFile.content);

    const analyzes = extractAnalyzes(obj);

    const analyzesWithPdf: ExportAnalysis[] = [];

    for (const analysis of analyzes) {
      const pdfAttachment = attachments.find(
        ({ contentType, filename }) =>
          contentType === 'application/pdf' &&
          filename?.startsWith(analysis.girpaReference)
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
  exportDataFromEmail,
  getAnalysisKey: (email) => email.messageUid,
  emailCountByAnalysis: 1
};
