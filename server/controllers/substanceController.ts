import { Request, Response } from 'express';
import { constants } from 'http2';
import { FindSubstanceOptions } from '../../shared/schema/Substance/FindSubstanceOptions';
import substanceRepository from '../repositories/substanceRepository';

const searchSubstances = async (request: Request, response: Response) => {
  const findOptions = request.query as FindSubstanceOptions;

  console.info('Find substances');

  const substances = await substanceRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(substances);
};

export default {
  searchSubstances
};
