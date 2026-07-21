import { constants } from 'node:http2';

import { HttpError } from './httpError';

export default class ProgrammingSubPlanMissingError
  extends HttpError
  implements HttpError
{
  constructor(id: string) {
    super({
      name: 'ProgrammingSubPlanMissingError',
      message: `ProgrammingSubPlan ${id} missing`,
      status: constants.HTTP_STATUS_NOT_FOUND
    });
  }
}
