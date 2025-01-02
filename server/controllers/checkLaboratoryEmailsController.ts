import { Request, Response } from 'express';
import { constants } from 'http2';

export const checkLaboratoryEmails = async (
  _request: Request,
  response: Response
): Promise<void> => {
  console.info('Cheking emails...');

  //TODO

  response.status(constants.HTTP_STATUS_OK).send('OK');
};
