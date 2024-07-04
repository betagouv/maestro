import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import {
  AnalysisToCreate,
  CreatedAnalysis,
} from '../../shared/schema/Analysis/Analysis';
import analysisRepository from '../repositories/analysisRepository';

const createAnalysis = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const analysisToCreate = request.body as AnalysisToCreate;

  console.info('Create analysis', analysisToCreate);

  const analysis: CreatedAnalysis = {
    id: uuidv4(),
    createdAt: new Date(),
    createdBy: user.id,
    ...analysisToCreate,
  };
  await analysisRepository.insert(analysis);

  response.status(constants.HTTP_STATUS_CREATED).send(analysis);
};

export default {
  createAnalysis,
};
