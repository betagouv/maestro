import { type ZodError, z } from 'zod';

/**
 * Erreur interne Maestro (référentiel incomplet, cas non implémenté, bug).
 * Ne déclenche JAMAIS de réponse au laboratoire : on alerte en interne
 */
export class ExtractError extends Error {}

/**
 * Erreur imputable au laboratoire (fichier mal formé, pièce jointe manquante,
 * référence d'échantillon inconnue). Peut déclencher une réponse à l'expéditeur
 */
export class ExtractLabError extends Error {}

export class ExtractBadFormatError extends ExtractLabError {
  constructor(error: ZodError) {
    super(z.prettifyError(error));
  }
}
