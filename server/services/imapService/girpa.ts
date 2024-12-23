import { XMLParser } from 'fast-xml-parser';
import { entries } from 'lodash';
import { z } from 'zod';
import { Analyte } from '../../../shared/referential/Residue/Analyte';
import { AnalyteLabels } from '../../../shared/referential/Residue/AnalyteLabels';
import { ComplexResidue } from '../../../shared/referential/Residue/ComplexResidue';
import { ComplexResidueLabels } from '../../../shared/referential/Residue/ComplexResidueLabels';
import { SimpleResidue } from '../../../shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from '../../../shared/referential/Residue/SimpleResidueLabels';
import {
  ExportDataFromEmail,
  ExportDataSubstance,
  ExportResidue,
  ExportSample,
  IsSender,
  LaboratoryConf
} from './index';

const isSender: IsSender = (_emailSender) => true;

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
      return { value: entry[0] as SimpleResidue, kind: 'SimpleResidue' };
    }
  }

  for (const entry of entries(ComplexResidueLabels)) {
    if (entry[1].toLowerCase() === normalizedEnglishName) {
      return { value: entry[0] as ComplexResidue, kind: 'ComplexResidue' };
    }
  }

  for (const entry of entries(AnalyteLabels)) {
    if (entry[1].toLowerCase() === normalizedEnglishName) {
      return { value: entry[0] as Analyte, kind: 'Analyte' };
    }
  }


  //En attendant d'avoir un référentiel CAS => SSD2
  const casToSSD2SimpleResidue:  Record<ResidueCasNumber, SimpleResidue> = {
    ['120983-64-4' as ResidueCasNumber]: 'RF-0868-001-PPP',
    ['15299-99-7' as ResidueCasNumber]: 'RF-00012802-PAR',
  } as const satisfies Record<ResidueCasNumber, SimpleResidue>

  if (casNumber in casToSSD2SimpleResidue) {
    return { value: casToSSD2SimpleResidue[casNumber], kind: 'SimpleResidue'}
  }

  //Pour ceux qui n'ont pas de CAS
  const labelToSimpleResidue: Record<string, SimpleResidue>  = {
      'metobromuron': 'RF-0868-001-PPP'
    }

    if (normalizedEnglishName in labelToSimpleResidue) {
      return { value: labelToSimpleResidue[normalizedEnglishName], kind: 'SimpleResidue'}
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
export const extractSample = (obj: unknown): ExportSample[] | null => {
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

  const result = validator.safeParse(obj);

  if (result.success) {
    return result.data.Rapport.Echantillon.map((echantillon) => {
      const substances: ExportDataSubstance[] = echantillon.Analyse.filter(
        (a) =>
          a.LMR === '-' ||
          a.Résultat > a.LMR ||
          a.Résultat >= a.Limite_de_quantification / 3
      )
        .map((a) => {
          const substance = getResidue(
            a.Substance_active_CAS,
            a.Substance_active_anglais
          );
          if (substance === null) {
            //FIXME comment gérer les erreurs ?!
            console.error('Résidu non trouvé:', a.Substance_active_CAS, a.Substance_active_anglais)
            return null;
          }

          return a.LMR === '-'
            ? {
                result_kind: 'NQ',
                result: null,
                lmr: null,
                substance
              }
            : { result_kind: 'Q', result: a.Résultat, lmr: a.LMR, substance };
        })
        .filter((s): s is ExportDataSubstance => s !== null);
      return {
        sampleReference: echantillon['Code_échantillon'],
        notes: echantillon.Commentaire,
        substances
      };
    });
  }
  console.log('Erreur: ', result.error);
  return null;
};

const exportDataFromEmail: ExportDataFromEmail = (email) => {
  const xmlFile = email.attachments.find(
    ({ contentType }) =>
      contentType === 'text/xml' || contentType === 'application/xml'
  );

  if (xmlFile !== undefined) {
    const parser = new XMLParser();
    const obj = parser.parse(xmlFile.content);
    return extractSample(obj);
  } else {
    console.log('Aucun XML', email.attachments);
  }

  return null;
};

export const girpaConf: LaboratoryConf = {
  isSender,
  exportDataFromEmail
};
