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
 * analyte non mappé, échantillon introuvable...). Génère un non-acquittement
 */
export class RaiLabError extends RaiProcessingError {
  constructor(message: string, xmlDocumentId: string | null = null) {
    super(message, xmlDocumentId);
    this.name = 'RaiLabError';
  }
}

/**
 * Erreur interne Maestro (cas non implémenté, bug, analyte inconnue...). Ne déclenche JAMAIS de non-acquittement : on alerte en interne
 */
export class RaiMaestroError extends RaiProcessingError {
  constructor(message: string, xmlDocumentId: string | null = null) {
    super(message, xmlDocumentId);
    this.name = 'RaiMaestroError';
  }
}
