import { Request, Response } from 'express';
import { constants } from 'http2';
import { laboratoryRepository } from '../repositories/laboratoryRepository';

const getLaboratory = async (request: Request, response: Response) => {
  console.info('Get laboratory');

  const laboratory = await laboratoryRepository.findUnique(
    request.params.laboratoryId
  );

  if (!laboratory) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  response.status(constants.HTTP_STATUS_OK).send(laboratory);
};

const findLaboratories = async (_request: Request, response: Response) => {
  console.info('Find laboratories');

  const laboratories = await laboratoryRepository.findMany();

  response.status(constants.HTTP_STATUS_OK).send(laboratories);
};

export default {
  getLaboratory,
  findLaboratories
};
