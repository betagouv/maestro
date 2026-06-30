export class RaiProcessingError extends Error {
  readonly xmlDocumentId: string | null;

  constructor(message: string, xmlDocumentId: string | null = null) {
    super(message);
    this.name = 'RaiProcessingError';
    this.xmlDocumentId = xmlDocumentId;
  }
}

/**
 * Erreur imputable au laboratoire (champ obligatoire manquant, unité invalide,
 * analyte non mappé, échantillon introuvable…). Éligible au non-acquittement
 * automatique : le motif est porté par le message.
 */
export class RaiLabError extends RaiProcessingError {
  constructor(message: string, xmlDocumentId: string | null = null) {
    super(message, xmlDocumentId);
    this.name = 'RaiLabError';
  }
}

/**
 * Erreur interne Maestro (cas non implémenté, bug, incohérence en base, DB
 * indisponible). Ne déclenche JAMAIS de non-acquittement : on alerte en interne
 * et le fichier est rejoué.
 */
export class RaiMaestroError extends RaiProcessingError {
  constructor(message: string, xmlDocumentId: string | null = null) {
    super(message, xmlDocumentId);
    this.name = 'RaiMaestroError';
  }
}
