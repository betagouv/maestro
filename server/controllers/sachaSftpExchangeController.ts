import type { Request, Response } from 'express';
import { HttpStatus } from '../constants/httpStatus';
import { exchangeWithSachaSftp } from '../services/ediSacha/sftpService';
import config from '../utils/config';

export const sachaSftpExchange = async (
  _request: Request,
  response: Response
): Promise<void> => {
  if (config.sigal.sftp.exchangeEnabled) {
    await exchangeWithSachaSftp();
  } else {
    console.info('SACHA SFTP exchange is disabled.');
  }

  response.status(HttpStatus.OK).send('OK');
};
