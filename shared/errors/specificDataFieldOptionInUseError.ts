import { constants } from 'node:http2';
import { HttpError } from './httpError';

export default class SpecificDataFieldOptionInUseError
  extends HttpError
  implements HttpError
{
  constructor() {
    super({
      name: 'SpecificDataFieldOptionInUseError',
      message:
        'Cette option est utilisée par des prélèvements : elle ne peut pas être supprimée.',
      status: constants.HTTP_STATUS_CONFLICT
    });
  }
}
