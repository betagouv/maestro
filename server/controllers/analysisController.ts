import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import AnalysisMissingError from '../../shared/errors/analysisMissingError';
import {
  AnalysisToCreate,
  CreatedAnalysis,
  PartialAnalysis,
} from '../../shared/schema/Analysis/Analysis';
import analysisRepository from '../repositories/analysisRepository';

const getAnalysis = async (request: Request, response: Response) => {
  const { sampleId } = request.params;
  const analysis = await analysisRepository.findUnique(sampleId);

  if (!analysis) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  response.send(analysis);
};

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

const updateAnalysis = async (request: Request, response: Response) => {
  const analysisId = request.params.analysisId;
  const analysisUpdate = request.body as PartialAnalysis;

  console.info('Update analysis', analysisUpdate);

  const analysis = await analysisRepository.findUnique(analysisId);

  if (!analysis) {
    throw new AnalysisMissingError(analysisId);
  }

  const updatedAnalysis = {
    ...analysis,
    ...analysisUpdate,
  };
  await analysisRepository.update(updatedAnalysis);

  response.send(updatedAnalysis);
};

export default {
  getAnalysis,
  createAnalysis,
  updateAnalysis,
};
