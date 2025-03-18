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

const capinovReferential: Record<string, SSD2Id> = {
  "Abamectin (Avermectin B1a, B1b & Avermectin B1a (8,9,z) expr. as avermectin B1a)": "RF-00004655-PAR",
  "Aldicarb (sum of aldicarb, its sulfoxide and its sulfone expr. as aldicarb)": "RF-0020-001-PPP",
  "Amitraz-metabolites (DMF + DMPF expr. as amitraz)": "RF-0024-001-PPP",
  "Benalaxyl (incl. benalaxyl-M)": "RF-0038-001-PPP",
  "Bentazone (+ free 6/8-hydroxy-bentazone expr. as bentazone)": "RF-0042-001-PPP",
  "Benthiavalicarb-isopropyl": "RF-00004656-PAR",
  "Bispyribac":"RF-0507-001-PPP",
  "Bromoxynil (+salts)": "RF-00003327-PAR",
  "Bromuconazole": "RF-0054-001-PPP",
  "Captan + tetrahydrophtaIimide expr. as captan": "RF-00004681-PAR",
  "Carbetamide": "RF-00012044-PAR",
  "Carbofuran (+ 3-hydroxy-carbofuran expr. as carbofuran)": "RF-0065-002-PPP",
  "Carboxin (+Carboxin-sulfoxide + carboxin-sulfone (Oxycarboxin) expr. as carboxin)": "RF-00011559-PAR",
  "Carfentrazone-ethyl (sum of carfentrazone-ethyl and carfentrazone, expr. as carfentrazone-ethyl)": "RF-00012874-PAR",
  "Chlordane (cis + trans)": "RF-0075-001-PPP",
  "Chloridazon (+-desphenyl expr. as chloridazon)": "",
  "Chlorpyrifos-methyl (+desmethyl expr. as chlorpyriphos methyl)": "",
  "Clethodim (+ -sulfone + -sulfoxide + sethoxydim expr. as sethoxydim)": "",
  "Clodinafop (incl. S-clodinafop + sels)": "",
  "Cloquintocet": "",
  "Cyflufenamid (sum of E & Z isomers)": "",
  "Cyfluthrin (incl. cyfluthrin-beta - sum of isomers)": "",
  "Cyhalofop": "",
  "Cyhalothrin-lambda": "",
  "Cypermethrin (incl. alphamethrin - sum of isomers)": "",
  "Cyprosulfamide": "",
  "Dazomet": "",
  "DDT (sum of isomers DDT op'+ DDT pp' + DDD pp' + DDE pp')": "",
  "Diclofop (+ -methyl expr. as diclofop-methyl)": "",
  "Aldrin + dieldrin (expr. as dieldrin)": "",
  "Difethialone": "",
  "Dimethenamid (incl. dimethenamid-P)": "",
  "Dinocap-meptyl": "",
  "Disulfoton-metabolite (-sulfone expr. as disulfoton)": "",
  "Disulfoton-metabolite (-sulfoxide expr. as disulfoton)": "",
  "Disulfoton (+ -sulfoxide + -sulfone expr. as disulfoton)": "",
  "Emamectine B1a": "",
  "Endosulfan (sum of isomers)": "",
  "Ethofumesate-metabolite (Ethofumesate-open-ring expr. as ethofumesate)": "",
  "Ethofumesate (+ Ethofumesate-2-keto + Ethofumesate-open-ring expr. as ethofumesate)": "",
  "Fenamiphos (+ -sulfoxide + -sulfone expr. as fenamiphos)": "",
  "Fenbuconazole": "",
  "Fenpropimorph": "",
  "Fenthion-oxon (expr. as fenthion)": "",
  "Fenthion (+metabolites expr. as fenthion)": "",
  "Fenvalerate / Esfenvalerate": "",
  "Fipronil (+ -sulfone expr. as fipronil)": "",
  "Flonicamid-metabolite (TFNG expr. as flonicamid)": "",
  "Flonicamid-metabolite (TFNA expr. as flonicamid)": "",
  "Flonicamid (+ TFNA + TNFG expr. as flonicamid)": "",
  "Fluazifop-P (+isomers of fluazifop)": "",
  "Fluazifop-P ( + -butyl expr. as fluazifop)": "",
  "Flucythrinate": "",
  "Flurochloridone": "",
  "Fluroxypyr (+-meptyl, expr. as fluroxypyr)": "",
  "Fluvalinate-tau": "",
  "Folpet + phtalimide expr. as folpet": "",
  "Ethyl-phosphite": "",
  "Fenchlorphos (+ -oxon expr. as fenchlorphos)": "",
  "Halauxifen-methyl (+ Halauxifen expr. as halauxifen-methyl)": "",
  "Haloxyfop (+-methyl +--2-ethoxyethyl expr. as haloxyfop)": "",
  "Heptachlor (sum of isomers)": "",
  "Heptachlor-epoxyde-trans (expr. as heptachlor)": "",
  "Hexythiazox": "",
  "Imazamox (+salts)": "",
  "Indoxacarb (S & R)": "",
  "Iodosulfuron-methyl (+salts)": "",
  "Ioxynil (+salts)": "",
  "Isopyrazam (sum of isomers)": "",
  "Isoxaflutole (+ Isoxaflutole diketonitrile RPA 202248 expr. as Isoxaflutole)": "",
  "Malathion (+ malaoxon expr. as malathion)": "",
  "Mandipropamid": "",
  "MCPA + MCPB (expr. as MCPA)": "",
  "Mecoprop (incl. Mecoprop-p)": "",
  "Metalaxyl (incl. metalaxyl-M = mefenoxam)": "",
  "Metazachlor metabolite (479M04 expr.as metazachlor)": "",
  "Metazachlor metabolite (479M08 expr.as metazachlor)": "",
  "Metazachlor metabolite (479M16 expr.as metazachlor)": "",
  "Metazachlor  : 479M04 + 479M08 + 479M16 expr. as metazachlor": "",
  "Methiocarb-metabolite (-sulfoxide expr. as methiocarb)": "",
  "Methiocarb (+ -sulfoxide + -sulfone expr. as methiocarb)": "",
  "Metobromuron metabolite (desmethyl-metobromuron expr. as metobromuron)": "",
  "metobromuron-desmethoxy": "",
  "4-bromoaniline": "",
  "Metobromuron (+ desmethyl-metobromuron + 4-bromophenylurea expr. as metobromuron)": "",
  "Metolachlor (incl. S-metolachlor)": "",
  "Metyltetraprole": "",
  "Metyltetraprole metabolite ISS7": "",
  "Mevinphos": "",
  "Milbemectin (milbemycin A3 + A4 expr. as milbemectin)": "",
  "Myclobutanil": "",
  "1-Naphtylacetic acid + 1-Naphthylacetamide (+ salts expr. as 1-naphtylacetic acid)": "",
  "Napropamide": "",
  "Oxydemeton-methyl (+ demeton-S-methyl-sulfone expr. as ODM)": "",
  "Paclobutrazol": "",
  "Parathion-methyl (+paraoxon-methyl expr. as parathion-methyl)": "",
  "Pencycuron (+ Pencycuron-PB-amine expr. as pencycuron)": "",
  "Phorate-metabolite (Phorate-oxon-sulfone expr. as phorate)": "",
  "Phorate-metabolite (Phorate-oxon-sulfoxide expr. as phorate)": "",
  "Phorate-metabolite (Phorate-sulfone expr. as phorate)": "",
  "Phorate-metabolite (Phorate-sulfoxide expr. as phorate)": "",
  "Phorate (+ Phorate-oxon + Phorate-oxon-sulfone + Phorate-oxon-sulfoxide + Phorate-sulfone +  Phorate-sulfoxide expr. as phorate)": "",
  "Phosmet (+ -oxon expr. as phosmet)": "",
  "Prochloraz-metabolite (BTS 44595/M201-04 expr. as prochloraz)": "",
  "Prochloraz-metabolite (BTS 44596/M201-03 expr. as prochloraz)": "",
  "Prochloraz (prochloraz + BTS 44595 (M201-04) + BTS 44596 (M201-03), expr. as prochloraz)": "",
  "Prohexadione-calcium (+salts)": "",
  "Propachlor": "",
  "Propamocarb": "",
  "Propoxycarbazone (+ hydroxypropoxycarbazone expr. as propoxycarbazone)": "",
  "Pyraflufen (expr. as pyraflufen-ethyl)": "",
  "Pyraflufen-ethyl (+ pyraflufen expr. as pyraflufen-ethyl)": "",
  "Pyrethrin (cinerin I / II + jasmolin I / II + pyrethrin I / II)": "",
  "Pyridate (+metabolite expr. as pyridate)": "",
  "Pyroxasulfone": "",
  "Quintozene (+ pentachloroaniline expr. as quintozene)": "",
  "Quizalofop-ethyl (incl. quizalofop-P-ethyl)": "",
  "Quizalofop (incl. quizalofop-P)": "",
  "Sedaxane": "",
  "Spinetoram": "",
  "Spinosad (spynosyn A & D)": "",
  "Spirotetramat-metabolite (BYI08330-enol expr. as spirotetramat)": "",
  "Spirotetramat-metabolite (BYI08330-ketohydroxy expr. as spirotetramat)": "",
  "Spirotetramat-metabolite (BYI08330-monohydroxy expr. as spirotetramat)": "",
  "Spirotetramat-metabolite (BYI08330 enol-glucoside expr. as spirotetramat)": "",
  "Spirotetramat (+ 4 metabolites expr. as spirotetramat)": "",
  "Sulfoxaflor": "",
  "Tefluthrin": "",
  "Tembotrione (+ Tembotrione-4,6-dihydroxy AE 1417268 expr. as tembotrione)": "",
  "Tolyfluanid (+ DMST expr. as tolyfluanid)": "",
  "Triadimenol": "",
  "Triflumizole-metabolite (Triflumizole-amino (FM6-1) expr. as triflumizole)": "",
  "Triflumizole (+ Triflumizole-amino (FM6-1) expr. as triflumizole)": "",
  "Triflusulfuron (IN-M7222)": "",
  "Trinexapac-acide": "",
  "Trinexapac-ethyl": "",
  "Tritosulfuron-metabolite (AMTT)": "",

}

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

  const resultsBySample = groupBy(resultatsData, 'DEMANDE_NUMERO' )
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
          label: residue.PARAMETRE_LIBELLE,
          casNumber: residue.CAS_NUMBER,
          //FIXME
          analysisMethod: 'Multi' as const,
          codeSandre: null
        })
      }

    result.push(analysis)
  }

  return result

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
        contentType === 'application/pdf'
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
