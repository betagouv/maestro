import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { RaiProcessingError } from './sachaErrors';
import { validateRaiDaoaFields } from './sachaRAIValidation';
import type { SachaResultats } from './sachaValidator';
import { validateAndDecodeSachaXml } from './validateSachaXml';

const decodeValidRai = (): SachaResultats => {
  const file = path.join(import.meta.dirname, './example-rai-daoa-valid.xml');
  const json = validateAndDecodeSachaXml(readFileSync(file).toString());
  if (!json.Resultats) {
    throw new Error('Le fichier de test ne contient pas de Resultats');
  }
  return json.Resultats;
};

const firstResultat = (rai: SachaResultats) => {
  const analyse =
    rai.DialogueResultatType.DialoguePlanAnalyseType?.[0]
      ?.DialogueAnalyseType?.[0];
  const resultat = analyse?.DialogueResultatEchantillonAnalyse?.[0];
  if (!analyse || !resultat) {
    throw new Error('Structure de test inattendue');
  }
  return { analyse, resultat };
};

describe('validateRaiDaoaFields', () => {
  test('accepte un fichier DAOA conforme', () => {
    expect(() => validateRaiDaoaFields(decodeValidRai())).not.toThrow();
  });

  test('rejette un commémoratif obligatoire manquant', () => {
    const rai = decodeValidRai();
    const { analyse } = firstResultat(rai);
    analyse.DialogueCommemoratif = analyse.DialogueCommemoratif?.filter(
      (c) => c.Sigle !== 'METHD_PRCS'
    );

    expect(() => validateRaiDaoaFields(rai)).toThrow(RaiProcessingError);
    expect(() => validateRaiDaoaFields(rai)).toThrow(/METHD_PRCS/);
  });

  test('rejette une analyse sans résultat', () => {
    const rai = decodeValidRai();
    const { analyse } = firstResultat(rai);
    analyse.DialogueResultatEchantillonAnalyse = [];

    expect(() => validateRaiDaoaFields(rai)).toThrow(/Résultat manquant/);
  });

  test('rejette un IndicateurAnalyseConfirmation manquant', () => {
    const rai = decodeValidRai();
    const { resultat } = firstResultat(rai);
    resultat.IndicateurAnalyseConfirmation = undefined;

    expect(() => validateRaiDaoaFields(rai)).toThrow(
      /IndicateurAnalyseConfirmation/
    );
  });

  test('rejette une SigleUnite différente de MG_KG_PR', () => {
    const rai = decodeValidRai();
    const { resultat } = firstResultat(rai);
    resultat.SigleUnite = 'MG_L';

    expect(() => validateRaiDaoaFields(rai)).toThrow(/SigleUnite invalide/);
  });

  test('rejette un résultat quantitatif manquant', () => {
    const rai = decodeValidRai();
    const { resultat } = firstResultat(rai);
    resultat.ValeurResultatQuantitatif = undefined;

    expect(() => validateRaiDaoaFields(rai)).toThrow(
      /Résultat quantitatif manquant/
    );
  });

  test('rejette une IncertitudePourcentage différente de 50', () => {
    const rai = decodeValidRai();
    const { resultat } = firstResultat(rai);
    resultat.IncertitudePourcentage = 49;

    expect(() => validateRaiDaoaFields(rai)).toThrow(
      /IncertitudePourcentage invalide/
    );
  });

  test('accepte une IncertitudePourcentage absente', () => {
    const rai = decodeValidRai();
    const { resultat } = firstResultat(rai);
    resultat.IncertitudePourcentage = undefined;

    expect(() => validateRaiDaoaFields(rai)).not.toThrow();
  });
});
