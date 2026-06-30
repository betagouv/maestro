import { RaiProcessingError } from './sachaErrors';
import type { SachaResultats } from './sachaValidator';

// Commémoratifs analyse obligatoires d'après la fiche de plan DAOA.
const REQUIRED_COMMEMORATIFS = [
  'ACCRDTTN',
  'METHD_PRCS',
  'DANALYS',
  'LIMDET',
  'LIMQUANT'
] as const;

const EXPECTED_UNITE = 'MG_KG_PR';
const EXPECTED_INCERTITUDE = 50;

/**
 * Validation métier des résultats DAOA, au-delà de la conformité XSD vérifiée par
 * le validateur Zod (où tout est `.optional()`). Vérifie, par analyse, la présence
 * des commémoratifs et champs imposés par la fiche de plan.
 *
 * Les manquements sont imputables au laboratoire (famille `RaiLabError`).
 * TODO étape 4 : remplacer `RaiProcessingError` par `RaiLabError` et émettre le
 * non-acquittement automatique porteur du motif.
 */
export const validateRaiDaoaFields = (
  rai: SachaResultats,
  xmlDocumentId: string | null = null
): void => {
  const fail = (message: string): never => {
    throw new RaiProcessingError(message, xmlDocumentId);
  };

  for (const planAnalyse of rai.DialogueResultatType.DialoguePlanAnalyseType ??
    []) {
    for (const analyse of planAnalyse.DialogueAnalyseType ?? []) {
      const { SigleAnalyte, SigleMethodeSpecifique } = analyse.DialogueAnalyse;
      const label = `analyte ${SigleAnalyte} / méthode ${SigleMethodeSpecifique}`;

      const commemoratifs = analyse.DialogueCommemoratif ?? [];
      for (const sigle of REQUIRED_COMMEMORATIFS) {
        const commemoratif = commemoratifs.find((c) => c.Sigle === sigle);
        const value = commemoratif?.TexteValeur ?? commemoratif?.SigleValeur;
        if (!value) {
          fail(`Commémoratif obligatoire manquant (${sigle}) pour ${label}`);
        }
      }

      const resultats = analyse.DialogueResultatEchantillonAnalyse ?? [];
      if (resultats.length === 0) {
        fail(`Résultat manquant pour ${label}`);
      }

      for (const resultat of resultats) {
        if (resultat.IndicateurAnalyseConfirmation === undefined) {
          fail(`IndicateurAnalyseConfirmation manquant pour ${label}`);
        }

        if (!resultat.SigleUnite) {
          fail(`SigleUnite manquant pour ${label}`);
        } else if (resultat.SigleUnite !== EXPECTED_UNITE) {
          fail(
            `SigleUnite invalide (${resultat.SigleUnite}, attendu ${EXPECTED_UNITE}) pour ${label}`
          );
        }

        if (
          !resultat.OperateurResultatQuantitatif ||
          resultat.ValeurResultatQuantitatif === undefined
        ) {
          fail(`Résultat quantitatif manquant pour ${label}`);
        }

        if (
          resultat.IncertitudePourcentage !== undefined &&
          resultat.IncertitudePourcentage !== EXPECTED_INCERTITUDE
        ) {
          fail(
            `IncertitudePourcentage invalide (${resultat.IncertitudePourcentage}, attendu ${EXPECTED_INCERTITUDE}) pour ${label}`
          );
        }
      }
    }
  }
};
