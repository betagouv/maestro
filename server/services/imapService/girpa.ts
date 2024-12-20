import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import { ExportDataFromEmail, ExportDataSubstance, ExportSample, IsSender, LaboratoryConf } from './index';

const isSender: IsSender = (_emailSender) => true;

const frenchNumberStringValidator = z
  .string()
  .transform((val) => Number(`${val}`.replace(',', '.')))
  .pipe(z.number());

export const analyseXmlValidator = z.object({
  Résultat: frenchNumberStringValidator,
  Limite_de_quantification: frenchNumberStringValidator,
  LMR: z.union([z.literal('-'), z.number(), frenchNumberStringValidator]),
  Substance_active_CAS: z.string(),
  //Substance_active_anglais: z.string()
});
// Visible for testing
export const extractSample = (obj: unknown): ExportSample[] | null => {
  const echantillonValidator = z.object({
    Code_échantillon: z.string(),
    Commentaire: z.string(),
    Analyse: z.array(
      analyseXmlValidator
    )
  });
  const validator = z.object({
    Rapport: z.object({
      Echantillon: z.union([echantillonValidator.transform(e => ([e])), z.array(echantillonValidator)])
    })
  });

  const result = validator.safeParse(obj);

  if (result.success) {
    return result.data.Rapport.Echantillon.map(echantillon => {
      const substances: ExportDataSubstance[] = echantillon.Analyse.filter(
        (a) => a.LMR === '-' || a.Résultat > a.LMR || a.Résultat >= a.Limite_de_quantification / 3
      ).map(a => {

        return  a.LMR === '-' ? ({result_kind: 'NQ', result: null, lmr: null, substance: a.Substance_active_CAS}) : ({result_kind: 'Q', result: a.Résultat, lmr: a.LMR, substance: a.Substance_active_CAS})
      });
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
    ({ contentType }) => contentType === 'text/xml' || contentType === 'application/xml'
  );

  if (xmlFile !== undefined) {
    const parser = new XMLParser();
    const obj = parser.parse(xmlFile.content);
    console.log(obj)
    return extractSample(obj);
  }else{
    console.log("Aucun XML", email.attachments)
  }

  return null;
};

export const girpaConf: LaboratoryConf = {
  isSender,
  exportDataFromEmail
};
