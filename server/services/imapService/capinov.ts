import { groupBy } from 'lodash-es';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { z } from 'zod';
import {
  ExportAnalysis,
  ExportDataFromEmail,
  ExportResultNonQuantifiable,
  ExportResultQuantifiable,
  ExtractError,
  IsSender,
  LaboratoryConf
} from './index';
import { csvToJson } from './utils';

//TODO AUTO_LABO en attente de la réception du 1er email + test
const isSender: IsSender = (_emailSender) => false;

const unknownReferences = [
  'Cyprosulfamide',
  'Difethialone',
  'Ethofumesate-metabolite (Ethofumesate-open-ring expr. as ethofumesate)',
  'Ethyl-phosphite',
  'Metobromuron metabolite (desmethyl-metobromuron expr. as metobromuron)',
  'Metyltetraprole metabolite ISS7',
  'Pyroxasulfone',
  'Triflumizole (+ Triflumizole-amino (FM6-1) expr. as triflumizole)'
];

const capinovReferential: Record<string, SSD2Id> = {
  'Abamectin (Avermectin B1a, B1b & Avermectin B1a (8,9,z) expr. as avermectin B1a)':
    'RF-00004655-PAR',
  'Aldicarb (sum of aldicarb, its sulfoxide and its sulfone expr. as aldicarb)':
    'RF-0020-001-PPP',
  'Amitraz-metabolites (DMF + DMPF expr. as amitraz)': 'RF-0024-001-PPP',
  'Benalaxyl (incl. benalaxyl-M)': 'RF-0038-001-PPP',
  'Bentazone (+ free 6/8-hydroxy-bentazone expr. as bentazone)':
    'RF-0042-001-PPP',
  'Benthiavalicarb-isopropyl': 'RF-00004656-PAR',
  Bispyribac: 'RF-0507-001-PPP',
  'Bromoxynil (+salts)': 'RF-00003327-PAR',
  Bromuconazole: 'RF-0054-001-PPP',
  'Captan + tetrahydrophtaIimide expr. as captan': 'RF-00004681-PAR',
  Carbetamide: 'RF-00012044-PAR',
  'Carbofuran (+ 3-hydroxy-carbofuran expr. as carbofuran)': 'RF-0065-002-PPP',
  'Carboxin (+Carboxin-sulfoxide + carboxin-sulfone (Oxycarboxin) expr. as carboxin)':
    'RF-00011559-PAR',
  'Carfentrazone-ethyl (sum of carfentrazone-ethyl and carfentrazone, expr. as carfentrazone-ethyl)':
    'RF-00012874-PAR',
  'Chlordane (cis + trans)': 'RF-0075-001-PPP',
  'Chloridazon (+-desphenyl expr. as chloridazon)': 'RF-00005729-PAR',
  'Chlorpyrifos-methyl (+desmethyl expr. as chlorpyriphos methyl)':
    'RF-00007588-PAR',
  'Clethodim (+ -sulfone + -sulfoxide + sethoxydim expr. as sethoxydim)':
    'RF-0096-001-PPP',
  'Clodinafop (incl. S-clodinafop + sels)': 'RF-0097-001-PPP',
  Cloquintocet: 'RF-0568-001-PPP',
  'Cyflufenamid (sum of E & Z isomers)': 'RF-0107-001-PPP',
  'Cyfluthrin (incl. cyfluthrin-beta - sum of isomers)': 'RF-0108-001-PPP',
  Cyhalofop: 'RF-00003378-PAR',
  'Cyhalothrin-lambda': 'RF-1004-001-PPP',
  'Cypermethrin (incl. alphamethrin - sum of isomers)': 'RF-0112-001-PPP',
  Dazomet: 'RF-0118-003-PPP',
  "DDT (sum of isomers DDT op'+ DDT pp' + DDD pp' + DDE pp')":
    'RF-0119-001-PPP',
  'Diclofop (+ -methyl expr. as diclofop-methyl)': 'RF-00012875-PAR',
  'Aldrin + dieldrin (expr. as dieldrin)': 'RF-0021-001-PPP',
  'Dimethenamid (incl. dimethenamid-P)': 'RF-0137-002-PPP',
  'Dinocap-meptyl': 'RF-00002838-PAR',
  'Disulfoton-metabolite (-sulfone expr. as disulfoton)': 'RF-0149-004-PPP',
  'Disulfoton-metabolite (-sulfoxide expr. as disulfoton)': 'RF-0149-003-PPP',
  'Disulfoton (+ -sulfoxide + -sulfone expr. as disulfoton)': 'RF-0149-001-PPP',
  'Emamectine B1a': 'RF-00014212-PAR',
  'Endosulfan (sum of isomers)': 'RF-0155-001-PPP',
  'Ethofumesate (+ Ethofumesate-2-keto + Ethofumesate-open-ring expr. as ethofumesate)':
    'RF-00005724-PAR',
  'Fenamiphos (+ -sulfoxide + -sulfone expr. as fenamiphos)': 'RF-0173-001-PPP',
  Fenbuconazole: 'RF-00012045-PAR',
  Fenpropimorph: 'RF-0185-001-PPP',
  'Fenthion-oxon (expr. as fenthion)': 'RF-0187-004-PPP',
  'Fenthion (+metabolites expr. as fenthion)': 'RF-0187-001-PPP',
  'Fenvalerate / Esfenvalerate': 'RF-0690-006-PPP',
  'Fipronil (+ -sulfone expr. as fipronil)': 'RF-0192-001-PPP',
  'Flonicamid-metabolite (TFNG expr. as flonicamid)': 'RF-00003349-PAR',
  'Flonicamid-metabolite (TFNA expr. as flonicamid)': 'RF-00003348-PAR',
  'Flonicamid (+ TFNA + TNFG expr. as flonicamid)': 'RF-00004683-PAR',
  'Fluazifop-P (+isomers of fluazifop)': 'RF-00005730-PAR',
  'Fluazifop-P ( + -butyl expr. as fluazifop)': 'RF-0197-002-PPP',
  Flucythrinate: 'RF-0201-002-PPP',
  Flurochloridone: 'RF-00011881-PAR',
  'Fluroxypyr (+-meptyl, expr. as fluroxypyr)': 'RF-0215-002-PPP',
  'Fluvalinate-tau': 'RF-0402-001-PPP',
  'Folpet + phtalimide expr. as folpet': 'RF-00004687-PAR',
  'Fenchlorphos (+ -oxon expr. as fenchlorphos)': 'RF-0178-001-PPP',
  'Halauxifen-methyl (+ Halauxifen expr. as halauxifen-methyl)':
    'RF-00004666-PAR',
  'Haloxyfop (+-methyl +--2-ethoxyethyl expr. as haloxyfop)': 'RF-00004667-PAR',
  'Heptachlor (sum of isomers)': 'RF-0236-001-PPP',
  'Heptachlor-epoxyde-trans (expr. as heptachlor)': 'RF-0236-005-PPP',
  Hexythiazox: 'RF-00013472-PAR',
  'Imazamox (+salts)': 'RF-0247-001-PPP',
  'Indoxacarb (S & R)': 'RF-0251-001-PPP',
  'Iodosulfuron-methyl (+salts)': 'RF-0252-001-PPP',
  'Ioxynil (+salts)': 'RF-00011560-PAR',
  'Isopyrazam (sum of isomers)': 'RF-00000025-PAR',
  'Isoxaflutole (+ Isoxaflutole diketonitrile RPA 202248 expr. as Isoxaflutole)':
    'RF-0259-001-PPP',
  'Malathion (+ malaoxon expr. as malathion)': 'RF-0266-001-PPP',
  Mandipropamid: 'RF-00012047-PAR',
  'MCPA + MCPB (expr. as MCPA)': 'RF-0271-004-PPP',
  'Mecoprop (incl. Mecoprop-p)': 'RF-0273-001-PPP',
  'Metalaxyl (incl. metalaxyl-M = mefenoxam)': 'RF-0281-001-PPP',
  'Metazachlor metabolite (479M04 expr.as metazachlor)': 'RF-00003323-PAR',
  'Metazachlor metabolite (479M08 expr.as metazachlor)': 'RF-00003324-PAR',
  'Metazachlor metabolite (479M16 expr.as metazachlor)': 'RF-00003325-PAR',
  'Metazachlor  : 479M04 + 479M08 + 479M16 expr. as metazachlor':
    'RF-00003344-PAR',
  'Methiocarb-metabolite (-sulfoxide expr. as methiocarb)': 'RF-0291-003-PPP',
  'Methiocarb (+ -sulfoxide + -sulfone expr. as methiocarb)': 'RF-0291-001-PPP',
  'metobromuron-desmethoxy': 'RF-00006545-PAR',
  '4-bromoaniline': 'RF-00006543-PAR',
  'Metobromuron (+ desmethyl-metobromuron + 4-bromophenylurea expr. as metobromuron)':
    'RF-00014532-PAR',
  'Metolachlor (incl. S-metolachlor)': 'RF-00002611-PAR',
  Metyltetraprole: 'RF-00013155-PAR',
  Mevinphos: 'RF-0302-001-PPP',
  'Milbemectin (milbemycin A3 + A4 expr. as milbemectin)': 'RF-00003018-PAR',
  Myclobutanil: 'RF-00012801-PAR',
  '1-Naphtylacetic acid + 1-Naphthylacetamide (+ salts expr. as 1-naphtylacetic acid)':
    'RF-00005728-PAR',
  Napropamide: 'RF-00012802-PAR',
  'Oxydemeton-methyl (+ demeton-S-methyl-sulfone expr. as ODM)':
    'RF-0323-001-PPP',
  Paclobutrazol: 'RF-00012043-PAR',
  'Parathion-methyl (+paraoxon-methyl expr. as parathion-methyl)':
    'RF-0328-001-PPP',
  'Pencycuron (+ Pencycuron-PB-amine expr. as pencycuron)': 'RF-00012803-PAR',
  'Phorate-metabolite (Phorate-oxon-sulfone expr. as phorate)':
    'RF-0336-006-PPP',
  'Phorate-metabolite (Phorate-oxon-sulfoxide expr. as phorate)':
    'RF-0336-007-PPP',
  'Phorate-metabolite (Phorate-sulfone expr. as phorate)': 'RF-0336-002-PPP',
  'Phorate-metabolite (Phorate-sulfoxide expr. as phorate)': 'RF-0336-004-PPP',
  'Phorate (+ Phorate-oxon + Phorate-oxon-sulfone + Phorate-oxon-sulfoxide + Phorate-sulfone +  Phorate-sulfoxide expr. as phorate)':
    'RF-0336-001-PPP',
  'Phosmet (+ -oxon expr. as phosmet)': 'RF-0338-001-PPP',
  'Prochloraz-metabolite (BTS 44595/M201-04 expr. as prochloraz)':
    'RF-00003328-PAR',
  'Prochloraz-metabolite (BTS 44596/M201-03 expr. as prochloraz)':
    'RF-00003329-PAR',
  'Prochloraz (prochloraz + BTS 44595 (M201-04) + BTS 44596 (M201-03), expr. as prochloraz)':
    'RF-00012032-PAR',
  'Prohexadione-calcium (+salts)': 'RF-0352-001-PPP',
  Propachlor: 'RF-0353-001-PPP',
  Propamocarb: 'RF-0354-001-PPP',
  'Propoxycarbazone (+ hydroxypropoxycarbazone expr. as propoxycarbazone)':
    'RF-0362-001-PPP',
  'Pyraflufen (expr. as pyraflufen-ethyl)': 'RF-00003366-PAR',
  'Pyraflufen-ethyl (+ pyraflufen expr. as pyraflufen-ethyl)':
    'RF-00003367-PAR',
  'Pyrethrin (cinerin I / II + jasmolin I / II + pyrethrin I / II)':
    'RF-0374-001-PPP',
  'Pyridate (+metabolite expr. as pyridate)': 'RF-0376-001-PPP',
  'Quintozene (+ pentachloroaniline expr. as quintozene)': 'RF-0383-001-PPP',
  'Quizalofop-ethyl (incl. quizalofop-P-ethyl)': 'RF-0887-001-PPP',
  'Quizalofop (incl. quizalofop-P)': 'RF-0384-004-PPP',
  Sedaxane: 'RF-00012869-PAR',
  Spinetoram: 'RF-00013247-PAR',
  'Spinosad (spynosyn A & D)': 'RF-0393-001-PPP',
  'Spirotetramat-metabolite (BYI08330-enol expr. as spirotetramat)':
    'RF-00003331-PAR',
  'Spirotetramat-metabolite (BYI08330-ketohydroxy expr. as spirotetramat)':
    'RF-00003332-PAR',
  'Spirotetramat-metabolite (BYI08330-monohydroxy expr. as spirotetramat)':
    'RF-00003333-PAR',
  'Spirotetramat-metabolite (BYI08330 enol-glucoside expr. as spirotetramat)':
    'RF-00003330-PAR',
  'Spirotetramat (+ 4 metabolites expr. as spirotetramat)': 'RF-0396-001-PPP',
  Sulfoxaflor: 'RF-00004679-PAR',
  Tefluthrin: 'RF-00013463-PAR',
  'Tembotrione (+ Tembotrione-4,6-dihydroxy AE 1417268 expr. as tembotrione)':
    'RF-00012293-PAR',
  'Tolyfluanid (+ DMST expr. as tolyfluanid)': 'RF-0425-001-PPP',
  Triadimenol: 'RF-00005717-PAR',
  'Triflumizole-metabolite (Triflumizole-amino (FM6-1) expr. as triflumizole)':
    'RF-0440-001-PPP',
  'Triflusulfuron (IN-M7222)': 'RF-00005716-PAR',
  'Trinexapac-acide': 'RF-00007587-PAR',
  'Trinexapac-ethyl': 'RF-0963-001-PPP',
  'Tritosulfuron-metabolite (AMTT)': 'RF-00005711-PAR'
};

// Visible for testing
export const extractAnalyzes = (
  fileContent: Record<string, string>[]
): Omit<ExportAnalysis, 'pdfFile'>[] => {
  const fileValidator = z.array(
    z.object({
      DEMANDE_NUMERO: z.string(),
      PARAMETRE_NOM: z.string(),
      RESULTAT_VALTEXTE: z.string(),
      RESULTAT_VALNUM: z.coerce.number(),
      PARAMETRE_LIBELLE: z.string(),
      LIMITE_LQ: z.string(),
      INCERTITUDE: z.string(),
      CAS_NUMBER: z.string().transform((r) => (r === '' ? null : r)),
      TECHNIQUE: z.string(),
      LMR_NUM: z.coerce.number()
    })
  );

  const { data: resultatsData, error: resultatsError } =
    fileValidator.safeParse(
      fileContent.filter(
        (row) => row.DEMANDE_NUMERO !== '' && row.DEMANDE_NUMERO !== undefined
      )
    );
  if (resultatsError) {
    throw new ExtractError(
      `Impossible d'extraire les données du fichier des résultats: ${resultatsError}`
    );
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(
      `Aucune donnée trouvée dans le fichier de résultats`
    );
  }

  const resultsBySample = groupBy(resultatsData, 'DEMANDE_NUMERO');
  const result: Omit<ExportAnalysis, 'pdfFile'>[] = [];

  for (const sampleReference in resultsBySample) {
    const analysis: Omit<ExportAnalysis, 'pdfFile'> = {
      sampleReference,
      notes: '',
      residues: []
    };

    for (const residue of resultsBySample[sampleReference]) {
      const isDetectable =
        residue.RESULTAT_VALTEXTE !== 'nd' && residue.RESULTAT_VALTEXTE !== '0';

      const result: ExportResultQuantifiable | ExportResultNonQuantifiable =
        !isDetectable
          ? { result_kind: 'ND' }
          : residue.RESULTAT_VALTEXTE === 'd, NQ'
            ? {
                result_kind: 'NQ'
              }
            : {
                result_kind: 'Q',
                result: residue.RESULTAT_VALNUM,
                lmr: residue.LMR_NUM
              };
      analysis.residues.push({
        ...result,
        label: residue.PARAMETRE_LIBELLE,
        casNumber: residue.CAS_NUMBER,
        //FIXME
        analysisMethod: 'Multi' as const,
        codeSandre: null
      });
    }

    result.push(analysis);
  }

  return result;
};

const exportDataFromEmail: ExportDataFromEmail = (email) => {
  const csvFiles = email.attachments.filter(
    ({ contentType, filename }) =>
      contentType === 'text/csv' ||
      (contentType === 'text/plain' && filename?.endsWith('.csv'))
  );

  if (csvFiles?.length !== 1) {
    throw new ExtractError(
      `1 fichiers CSV doit être présent, trouvé ${csvFiles.length ?? 0} fichier en PJ`
    );
  }

  const csvContent = csvToJson(csvFiles[0].content.toString(), ';');
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
  ssd2IdByLabel: capinovReferential,
  unknownReferences
};
