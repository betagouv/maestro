import { z } from 'zod';
import {
  ExportAnalysis,
  ExportDataFromEmail, ExportDataSubstance, ExportResultNonQuantifiable, ExportResultQuantifiable,
  ExtractError,
  IsSender,
  LaboratoryConf
} from './index';
import { csvToJson, frenchNumberStringValidator } from './utils';
import { getSSD2IdByCasNumber, getSSD2IdByLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SandreToSSD2 } from 'maestro-shared/referential/Residue/SandreToSSD2';

//TODO AUTO_LABO en attente de la réception du 1er email + test
const isSender: IsSender = (_emailSender) => false;

export const getSSD2Id = (casNumber: string | undefined, codeSandre: string | undefined, label: string): SSD2Id | null => {
  const inovalysReferential: Record<string, SSD2Id> = {
    '· Avermectine B1a': 'RF-0011-003-PPP',
    '· Avermectine B1b': 'RF-0011-004-PPP',
    '· 8,9-Z-Avermectine B1a': 'RF-0011-002-PPP',
    '· Bénomyl': 'RF-0041-003-PPP',
    '· Benfuracarb': 'RF-0040-001-PPP',
    '· Carbofurane': 'RF-0065-003-PPP',
    '· Carbofurane-3-hydroxy': 'RF-0065-002-PPP',
    '· Carbosulfane': 'RF-0068-001-PPP',
    '· Furathiocarb': 'RF-0228-001-PPP',
    '· Carboxine sulfone': 'RF-0069-001-PPP',
    '· Carboxine sulfoxyde': 'RF-00005982-PAR',
    '· Clethodim': '',
    '· Séthoxydim': '',
    "· DDT 4,4 (p,p')": '',
    "· DDT 2,4 (o,p')": '',
    "· DDE 4,4 (p,p')": '',
    "· DDD 4,4 (p,p')": '',
    "· Dicofol (p,p')": '',
    "· Dicofol  (o,p')": '',
    '· Fenamiphos': '',
    '· Fenamiphos sulfone': '',
    '· Fenamiphos sulfoxide': '',
    '· Fenchlorphos oxon': '',
    '· TFNA': '',
    '· TFNG': '',
    '· Halauxifen': '',
    '· Halauxifen méthyl': '',
    '· MCPA (L)': '',
    '· MCPB (L)': '',
    '· Méthiocarb': '',
    '· Méthiocarb sulfone': '',
    '· Méthiocarb sulfoxide': '',
    '· 4-Bromophénylurée': '',
    '· Déméton-S-méthyl sulfone': '',
    '· Oxydéméton méthyl': '',
    '· Phosmet oxon': '',
    '· BTS 44595 (métabolite du prochloraz)': '',
    '· BTS 44596 (métabolite du prochloraz)': ''
    'Abamectine (B1a + B1b + 8,9-Z)': 'RF-00004655-PAR',
    'Aldicarbe (+ sulfone + sulfoxyde)': 'RF-0020-001-PPP',
    'Captane (+ THPI)': 'RF-00004681-PAR',
    'Carbendazim (+ bénomyl)': 'RF-0041-001-PPP',
    'Carbofurane (+ carbofurane-OH)': 'RF-00003374-PAR',
    'Carboxine (+ sulfone + sulfoxyde)': 'RF-00011559-PAR',
    'Clethodim (+ Séthoxydim)': 'RF-0096-001-PPP',
    'DDT(DDT 4,4 + DDT 2,4 + DDE 4,4 + DDD 4,4)': 'RF-0119-001-PPP',
    'Diclofop (+ diclofop méthyl)': 'RF-00012875-PAR',
    'Dicofol (p,p´ + o,p´)': 'RF-0130-001-PPP',
    'Dieldrine (+ aldrine)': 'RF-0021-001-PPP',
    'Disulfoton (+ sulfone + sulfoxide)': 'RF-0149-001-PPP',
    'Endosulfan (alpha + bêta + endosulfan)': 'RF-0155-001-PPP',
    'Fenamiphos (+ sulfone + sulfoxide)': 'RF-0173-001-PPP',
    'Fenchlorphos (+ oxon)': 'RF-0178-001-PPP',
    'Fenthion (+ sulf + sulfox + oxon + oxon-sulf + oxon-sulfox)': 'RF-0187-001-PPP',
    'Fenvalérate (somme des isomères + esfenvalerate)': 'RF-0690-006-PPP',
    'Fipronil (+ sulfone)': 'RF-0192-001-PPP',
    'Flonicamide (+ TFNA + TFNG)': 'RF-00004683-PAR',
    'Folpel (+ phtalimide)': 'RF-00004687-PAR',
    'Fosetyl (+ ac. phosphoreux)': 'RF-0225-001-PPP',
    'Halauxifen méthyl (+ halauxifen)': 'RF-00004666-PAR',
    'Heptachlore (+ heptachlore epoxide)': 'RF-0236-001-PPP',
    'Malathion (+ malaoxon)': 'RF-0266-001-PPP',
    'MCPA+MCPB (L)': 'RF-0271-004-PPP',
    'Méfentrifluconazole': 'RF-00009360-PAR',
    'Méthiocarb (+ sulfone + sulfoxide)': 'RF-0291-001-PPP',
    'Métobromuron (+4-Bromophénylurée)': 'RF-00014532-PAR',
    'Oxydéméton méthyl (+ déméton-S-méthyl sulf.)': 'RF-0323-001-PPP',
    'Parathion méthyl (+ paraoxon méthyl)': 'RF-0328-001-PPP',
    'Phorate (+ oxon + sulfone + sulfoxide)': 'RF-0336-001-PPP',
    'Phosmet (+ phosmet oxon)': 'RF-0338-001-PPP',
    'Pirimicarbe (+ desméthyl)': 'RF-0347-001-PPP',
    'Prochloraz (+ BTS 44595 + BTS 44596)': 'RF-00012032-PAR',
    'Prothioconazole : prothioconazole-desthio (somme des isomères)': 'RF-0868-001-PPP',
    'Quintozène (+ pentachloroaniline)': 'RF-0383-001-PPP',
    'Spinetoram (J+L)': 'RF-00013247-PAR',
    'Spirotétramat (+ enol)': 'RF-00000030-PAR',
    'Tolylfluanide (+ DMST)': 'RF-0425-001-PPP'

  };

  let reference: SSD2Id | null = inovalysReferential[label] ?? null;

  if (reference === null) {
    reference = getSSD2IdByCasNumber(casNumber);
  }

  if (reference === null && codeSandre !== undefined) {
    reference = SandreToSSD2[codeSandre] ?? null;
  }

  if (reference === null) {
    reference = getSSD2IdByLabel(label);
  }

  return reference
}

// Visible for testing
export const extractAnalyzes = (
  files: InovalysCSVFile[]
): Omit<ExportAnalysis, 'pdfFile'>[] => {

  const resultatsFile = files.find(f => f.fileName.endsWith('FICRES.csv'))
  if (resultatsFile === undefined) {
    throw new ExtractError('Aucun fichier CSV pour les résultats de trouvé.')
  }

  const sampleFile = files.find(({fileName}) => fileName.endsWith('FICECH.csv'))
  if (sampleFile === undefined) {
    throw new ExtractError("Aucun fichier CSV pour l'échantillon de trouvé.")
  }

  const dossierValidator = z.string().brand()
  const echantillonValidator = z.string().brand()

  const sampleFileValidator = z.array(z.object({
    Dossier: dossierValidator,
    Echant: echantillonValidator,
    'Réf Client': z.string(),
    Commentaire: z.string(),
    Conclusion: z.string()
  }))

  const {data: samplesData, error: samplesError} = sampleFileValidator.safeParse(sampleFile.content.filter(row => row.Dossier !== ''))
  if (samplesError) {
    throw new ExtractError(`Impossible d'extraire les données du fichier de l'échantillion: ${samplesError}`)
  }
  if (samplesData.length === 0) {
    throw new ExtractError(`Aucune donnée trouvée dans le fichier d'échantillon`)
  }

  const resultatsFileValidator = z.array(z.object({
    Dossier: dossierValidator,
    Echantillon: echantillonValidator,
    'Détermination': z.string(),
    'Code Méth': z.string(),
    'Résultat 1': z.string(),
    //FIXME attention pour le moment on a tout en double, une ligne pour la LD et une autre pour la LQ, mais ça va surement changer
    'Limite Quant. 1': z.string(),
    'Code Sandre': z.string().optional(),
    'Incertitude': z.string().optional(),
    //LMR
    'Spécification 1': z.coerce.number().optional().transform((v) => v ?? 0),
    'Numéro CAS': z.string().optional()
  }));


  const {data: resultatsData, error: resultatsError} = resultatsFileValidator.safeParse(resultatsFile.content.filter(row => row.Dossier !== '' && row.Dossier !== undefined))
  if (resultatsError) {
    throw new ExtractError(`Impossible d'extraire les données du fichier des résultats: ${resultatsError}`)
  }
  if (resultatsData.length === 0) {
    throw new ExtractError(`Aucune donnée trouvée dans le fichier de résultats`)
  }



  const samplesWithResultats = samplesData.reduce<{sample: z.infer<typeof sampleFileValidator>[number], resultats: z.infer<typeof resultatsFileValidator>}[]>((acc, sample) => {
    acc.push({sample, resultats: resultatsData.filter(({Dossier, Echantillon}) => Dossier === sample.Dossier && Echantillon === sample.Echant)})
    return acc
  }, [])


 const result:  Omit<ExportAnalysis, 'pdfFile'>[] = []
  for (const sampleWithResultat of samplesWithResultats) {

    const residues: ExportDataSubstance[] = sampleWithResultat.resultats
      .filter((r) => r['Limite Quant. 1'].startsWith('<'))
      .filter((r) => {
        if (r['Spécification 1'] > 0) {
          return true
        }
        const resultatAsNumber = frenchNumberStringValidator.safeParse(r['Résultat 1'])
        return resultatAsNumber.success;
      })
      .map((r) => {
        const reference = getSSD2Id(r['Numéro CAS'], r['Code Sandre'], r.Détermination)

        if (reference === null) {
          throw new ExtractError(
            `Impossible d'identifier le résidu ${r.Détermination}`
          );
        }

        const resultatAsNumber = frenchNumberStringValidator.safeParse(
          r['Résultat 1']
        );

        const result: ExportResultQuantifiable | ExportResultNonQuantifiable =
          resultatAsNumber.success
            ? {
                result: resultatAsNumber.data,
                result_kind: 'Q',
                lmr: r['Spécification 1']
              }
            : {
                result: null,
                lmr: null,
                result_kind: 'NQ'
              };

        return {
          reference,
          ...result
        };
      });


    result.push({
      sampleReference: sampleWithResultat.sample['Réf Client'],
      notes: sampleWithResultat.sample.Commentaire,
      residues
    })
  }

  return result

};


type InovalysCSVFile = { fileName: string; content: Record<string, string>[] };
const exportDataFromEmail: ExportDataFromEmail = (email) => {
  const csvFiles = email.attachments.filter(
    ({ filename }) => (filename ?? '').endsWith('.csv')
  );

  if (csvFiles?.length !== 3) {
    throw new ExtractError(
      `3 fichiers CSV doivent être présents, seulement ${csvFiles.length ?? 0} en PJ`
    );
  }

  const inovalysCSVFiles: InovalysCSVFile[] = csvFiles.map((file) => {
    return {
      fileName: file.filename ?? '',
      content: csvToJson(file.content.toString('latin1'), ';')
    };
  });
  const analyzes = extractAnalyzes(inovalysCSVFiles);

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

export const inovalysConf: LaboratoryConf = {
  isSender,
  exportDataFromEmail
};
