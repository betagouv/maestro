import { constants } from 'http2';
import { HttpError } from './httpError';

export default class PdfGenerationError extends HttpError implements HttpError {
  constructor() {
    super({
      name: 'PdfGenerationError',
      message: `Une erreur est survenue lors de la génération du document, veuillez consulter le support`,
      status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR
    });
  }
}
