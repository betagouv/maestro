import { Request, Response } from 'express';
import { constants } from 'http2';
import laboratoryRepository from '../repositories/laboratoryRepository';

const findLaboratories = async (request: Request, response: Response) => {
  console.info('Find laboratories');

  const laboratories = await laboratoryRepository.findMany();

  response.status(constants.HTTP_STATUS_OK).send(laboratories);
};

export default {
  findLaboratories,
};
