import { Request, Response } from 'express';
import { constants } from 'http2';
import { FindSubstanceAnalysisOptions } from '../../shared/schema/Substance/FindSubstanceAnalysisOptions';
import substanceRepository from '../repositories/substanceRepository';

const findSubstanceAnalysis = async (request: Request, response: Response) => {
  console.info('Find substances');
  const queryFindOptions = request.query as FindSubstanceAnalysisOptions;

  const substanceAnalysis = await substanceRepository.findMany(
    queryFindOptions
  );

  response.status(constants.HTTP_STATUS_OK).send(substanceAnalysis);
};

export default {
  findSubstanceAnalysis,
};
