import { constants } from 'node:http2';
import type { Request, Response } from 'express';
import { checkEmails } from '../services/imapService';
import config from '../utils/config';

export const checkLaboratoryEmails = async (
  _request: Request,
  response: Response
): Promise<void> => {
  if (config.application.isReviewApp) {
    console.info('Checking emails feature is disabled for Review App.');
  } else {
    console.info('Checking emails...');

    try {
      await checkEmails();
    } catch (e) {
      console.error('Impossible de lire la boite mail', e);
    }
  }

  response.status(constants.HTTP_STATUS_OK).send('OK');
};
