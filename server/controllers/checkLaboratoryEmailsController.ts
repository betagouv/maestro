import { constants } from 'http2';
import {Request, Response} from 'express';
import { checkEmails } from '../services/imapService';

export const checkLaboratoryEmails =  async (_request: Request, response: Response): Promise<void> => {


  console.info('Checking emails...');

  //Pas d'await pour ne pas bloquer le thread inutilement
  checkEmails()

  response.status(constants.HTTP_STATUS_OK).send('OK');
};
