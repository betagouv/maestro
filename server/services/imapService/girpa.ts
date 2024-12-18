import { ExportDataFromEmail, IsSender, LaboratoryConf } from './index';
import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';


const isSender: IsSender = (_emailSender) => true


const frenchNumberStringValidator = z
    .string()
    .transform((val) => Number(`${val}`.replace(',', '.')))
    .pipe(z.number())

const exportDataFromEmail: ExportDataFromEmail = (email) => {

  const xmlFile = email.attachments.find(({contentType}) => contentType === 'text/xml')

  if (xmlFile !== undefined) {
    const parser = new XMLParser();
    const validator = z.object({
      Rapport: z.object({
        Echantillon: z.object({
          'Code_échantillon': z.string(),
          Commentaire: z.string(),
          Analyse: z.array(
            z.object({
              'Résultat': frenchNumberStringValidator,
              'Unité': z.string(),
              'Limite_de_quantification': frenchNumberStringValidator,
              'LMR': z.union([z.number(), frenchNumberStringValidator]),
              'Substance_active_CAS': z.string(),
              'Substance_active_anglais': z.string()
            })
          )
        })
      })
    })
    const obj = parser.parse(xmlFile.content)

    const result = validator.safeParse(obj)

    if (result.success) {
      console.log(result.data.Rapport.Echantillon.Analyse.filter((a) => a.Résultat > a.LMR || a.Résultat > (a.Limite_de_quantification/3)))
      return { sampleReference: result.data.Rapport.Echantillon['Code_échantillon']}
    }else {
      console.log('Erreur: ', result.error)
    }

  }


  return null
}


export const girpaConf: LaboratoryConf = {
  isSender,
  exportDataFromEmail
}