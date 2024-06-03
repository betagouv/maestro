import { constants } from 'http2';

import { HttpError } from '../../server/errors/httpError';

export default class ProgrammingPlanMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'ProgrammingPlanMissingError',
      message: `ProgrammingPlan ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND,
    });
  }
}
