export class RaiProcessingError extends Error {
  readonly xmlDocumentId: string | null;

  constructor(message: string, xmlDocumentId: string | null = null) {
    super(message);
    this.name = 'RaiProcessingError';
    this.xmlDocumentId = xmlDocumentId;
  }
}
