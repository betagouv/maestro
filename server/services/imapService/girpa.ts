import { XMLParser } from 'fast-xml-parser';
import { entries } from 'lodash-es';
import { z } from 'zod';
import { Analyte } from 'maestro-shared/referential/Residue/Analyte';
import { AnalyteLabels } from 'maestro-shared/referential/Residue/AnalyteLabels';
import { ComplexResidue } from 'maestro-shared/referential/Residue/ComplexResidue';
import { ComplexResidueLabels } from 'maestro-shared/referential/Residue/ComplexResidueLabels';
import { SimpleResidue } from 'maestro-shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from 'maestro-shared/referential/Residue/SimpleResidueLabels';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportDataSubstance,
  ExportResidue,
  ExtractError,
  IsSender,
  LaboratoryConf
} from './index';

//TODO AUTO_LABO en attente de la réception du 1er email + test
const isSender: IsSender = (_emailSender) => false;

// Visible for testing
export const getResidue = (
  casNumber: ResidueCasNumber,
  englishName: ResidueEnglishName
): ExportResidue | null => {
  const normalizedEnglishName = englishName
    .toLowerCase()
    .replace(' according reg.', '');

  for (const entry of entries(SimpleResidueLabels)) {
    if (entry[1].toLowerCase() === normalizedEnglishName) {
      return { reference: entry[0] as SimpleResidue, kind: 'SimpleResidue' };
    }
  }

  for (const entry of entries(ComplexResidueLabels)) {
    if (entry[1].toLowerCase() === normalizedEnglishName) {
      return { reference: entry[0] as ComplexResidue, kind: 'ComplexResidue' };
    }
  }

  for (const entry of entries(AnalyteLabels)) {
    if (entry[1].toLowerCase() === normalizedEnglishName) {
      return { reference: entry[0] as Analyte, kind: 'Analyte' };
    }
  }

  //En attendant d'avoir un référentiel CAS => SSD2
  const casToSSD2SimpleResidue: Record<ResidueCasNumber, SimpleResidue> = {
    ['120983-64-4' as ResidueCasNumber]: 'RF-0868-001-PPP',
    ['15299-99-7' as ResidueCasNumber]: 'RF-00012802-PAR'
  } as const satisfies Record<ResidueCasNumber, SimpleResidue>;

  if (casNumber in casToSSD2SimpleResidue) {
    return {
      reference: casToSSD2SimpleResidue[casNumber],
      kind: 'SimpleResidue'
    };
  }

  //Pour ceux qui n'ont pas de CAS
  const labelToSimpleResidue: Record<string, SimpleResidue> = {
    metobromuron: 'RF-00014532-PAR'
  };

  if (normalizedEnglishName in labelToSimpleResidue) {
    return {
      reference: labelToSimpleResidue[normalizedEnglishName],
      kind: 'SimpleResidue'
    };
  }

  return null;
};

const frenchNumberStringValidator = z
  .string()
  .transform((val) => Number(`${val}`.replace(',', '.')))
  .pipe(z.number());

export const residueCasNumberValidator = z.string().brand('CAS number');
type ResidueCasNumber = z.infer<typeof residueCasNumberValidator>;

export const residueEnglishNameValidator = z
  .string()
  .brand('ResidueEnglishName');
type ResidueEnglishName = z.infer<typeof residueEnglishNameValidator>;

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
    const residues: ExportDataSubstance[] = echantillon.Analyse.filter(
      (a) =>
        a.LMR === '-' ||
        a.Résultat > a.LMR ||
        a.Résultat >= a.Limite_de_quantification / 3
    )
      .map((a) => {
        const residue = getResidue(
          a.Substance_active_CAS,
          a.Substance_active_anglais
        );
        if (residue === null) {
          throw new ExtractError(
            `Résidu non trouvé:, ${a.Substance_active_CAS}, ${a.Substance_active_anglais}`
          );
        }

        return a.LMR === '-'
          ? {
              result_kind: 'NQ',
              result: null,
              lmr: null,
              residue
            }
          : { result_kind: 'Q', result: a.Résultat, lmr: a.LMR, residue };
      })
      .filter((s): s is ExportDataSubstance => s !== null);
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
  exportDataFromEmail
};
