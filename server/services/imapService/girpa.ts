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
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';

//TODO AUTO_LABO en attente de la réception du 1er email + test
const isSender: IsSender = (_emailSender) => false;


const girpaUnknownReferences: string[] = [
  "dmpf",
  "cyprosulfamide",
  "methoxychlor, o,p'-",
  "methoxychlor, p,p'-",
  "desmethyl-metobromuron",
  "sulfluramid",
]
const girpaReferences: Record<string, SSD2Id> = {
  'prothioconazole: prothioconazole-desthio': 'RF-0868-001-PPP',
  napropamide: 'RF-00012802-PAR',
"1-naphthylacetamide and 1-naphthylacetic acid": "RF-00005728-PAR",
"abamectin": "RF-00004655-PAR",
"aldrin and dieldrin": "RF-0021-001-PPP",
"benalaxyl": "RF-0038-001-PPP",
"benthiavalicarb": "RF-00004656-PAR",
"bifenthrin": "RF-0046-001-PPP",
"bispyribac": "RF-0507-001-PPP",
"bromoxynil": "RF-00003327-PAR",
"bromuconazole": "RF-0054-001-PPP",
"carbendazim and benomyl": "RF-0041-001-PPP",
"carbetamide": "RF-00012044-PAR",
"chlordane": "RF-0075-005-PPP",
"cinidon-ethyl": "RF-0095-001-PPP",
"clethodim (sum)": "RF-0096-001-PPP",
"cyfluthrin": "RF-0108-001-PPP",
"ddt": "RF-0119-001-PPP",
"dimethenamid": "RF-0137-002-PPP",
"endosulfan": "RF-0155-001-PPP",
"fenbuconazole": "RF-00012045-PAR",
"fenpropimorph": "RF-0185-001-PPP",
"fenvalerate": "RF-00003017-PAR",
"tfna": "RF-00003348-PAR",
"tfng": "RF-00003349-PAR",
"flucythrinate": "RF-0201-002-PPP",
"flurochloridone":"RF-00011881-PAR",
"hexythiazox": "RF-00013472-PAR",
"imazamox": "RF-0247-001-PPP",
"indoxacarb": "RF-0251-001-PPP",
"iodosulfuron-methyl": "RF-0252-001-PPP",
"ioxynil": "RF-00011560-PAR",
"lambda cyhalothrine": "RF-1004-001-PPP",
"mandipropamid": "RF-00012047-PAR",
"mecoprop": "RF-0273-001-PPP",
"metalaxyl and metalaxyl-m": "RF-0281-001-PPP",
"metazachlor metabolite 479m08": "RF-00003324-PAR",
"metazachlor metabolite 479m04": "RF-00003323-PAR",
"metazachlor metabolite 479m16": "RF-00003325-PAR",
"methiocarb sulfoxide": "RF-0291-003-PPP",
"metolachlor and s-metolachlor": "RF-00002611-PAR",
"mevinphos": "RF-0302-001-PPP",
"milbemectin": "RF-00003018-PAR",
"myclobutanil": "RF-00012801-PAR",
"paclobutrazol": "RF-00012043-PAR",
"permethrin": "RF-0842-001-PPP",
"bts 44595": "RF-00003328-PAR",
"bts 44596": "RF-00003329-PAR",
"prohexadione": "RF-0352-001-PPP",
"propachlor": "RF-0353-001-PPP",
"propamocarb": "RF-0354-001-PPP",
"resmethrin": "RF-0385-001-PPP",
"sedaxane": "RF-00012869-PAR",
"spinetoram (xde-175, sum j and l isomers)": "RF-00013247-PAR",
"spinosad": "RF-0393-001-PPP",
"spirotetramat-enol": "RF-00012871-PAR",
"sulfoxaflor": "RF-00004679-PAR",
"tefluthrin": "RF-00013463-PAR",
"triadimenol": "RF-00005717-PAR",
"triflumizole metabolite fm-6-1": "RF-0440-001-PPP",
"triflusulfuron (in-m7222)": "RF-00005716-PAR",

};

const codeMethods = ['M1', 'M26', 'M3', 'M18', 'M21', 'M23', 'M27'] as const
const codeMethodsAnalyseMethod = {
  'M1': 'Multi',
  'M26': 'Multi',
  'M3': 'Mono',
  'M18': 'Mono',
  'M21': 'Mono',
  'M23': 'Mono',
  'M27': 'Mono'
} as const satisfies Record<typeof codeMethods[number], AnalysisMethod>
const isCodeMethod = (code: string): code is typeof codeMethods[number] => (codeMethods as Readonly<string[]>).includes(code)

export const residueCasNumberValidator = z.string().brand('CAS number');

export const residueEnglishNameValidator = z
  .string()
  .brand('ResidueEnglishName');

export const analyseXmlValidator = z.object({
  Résultat: frenchNumberStringValidator,
  Limite_de_quantification: frenchNumberStringValidator,
  LMR: z.union([z.literal('-'), z.number(), frenchNumberStringValidator]).transform(a => a === '-' ? 0 : a),
  Substance_active_CAS: residueCasNumberValidator,
  Substance_active_anglais: residueEnglishNameValidator,
  Code_méthode: z.string()
    .transform(s => s.endsWith('*') ? s.substring(0, s.length - 1) : s)
    .refine(s => isCodeMethod(s) || s === '-')
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
      .filter((a) => a.Substance_active_anglais !== 'impression étiquettes')
      .map((a) => {

        const isND = a.Résultat < a.Limite_de_quantification / 3
        const isNQ = !isND && a.Résultat < a.Limite_de_quantification

        if (a.Code_méthode === '-') {
          throw new ExtractError(`Le code méthode est incorrect, la valeur « - » est réservée pour l'entête`)
        }

        const commonData = {
          analysisMethod: codeMethodsAnalyseMethod[a.Code_méthode],
          codeSandre: null,
          casNumber: a.Substance_active_CAS,
          label: a.Substance_active_anglais.toLowerCase()
            .replace(' according reg.', '')
        };
        return isNQ || isND
          ? {
              result_kind: isND  ? 'ND' : 'NQ',
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
  ssd2IdByLabel: girpaReferences,
  unknownReferences: girpaUnknownReferences
};
