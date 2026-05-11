export class RaiProcessingError extends Error {
  constructor(
    message: string,
    public readonly xmlDocumentId: string | null = null
  ) {
    super(message);
    this.name = 'RaiProcessingError';
  }
}
