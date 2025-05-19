import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { isEqual } from 'lodash-es';
import AnalysisMissingError from 'maestro-shared/errors/analysisMissingError';
import SampleMissingError from 'maestro-shared/errors/sampleMissingError';
import {
  AnalysisToCreate,
  CreatedAnalysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { v4 as uuidv4 } from 'uuid';
import { analysisErrorsRepository } from '../repositories/analysisErrorsRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import { mattermostService } from '../services/mattermostService';

const getAnalysis = async (request: Request, response: Response) => {
  const { sampleId } = request.query as { sampleId: string };
  const analysis = await analysisRepository.findUnique({ sampleId });

  if (!analysis) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  response.send(analysis);
};

const createAnalysis = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const analysisToCreate = request.body as AnalysisToCreate;

  const sample = await sampleRepository.findUnique(analysisToCreate.sampleId);

  if (!sample) {
    throw new SampleMissingError(analysisToCreate.sampleId);
  }

  console.info('Create analysis for sampleId', sample.id, analysisToCreate);

  const analysis: CreatedAnalysis = {
    id: uuidv4(),
    createdAt: new Date(),
    createdBy: user.id,
    status: 'Residues',
    ...analysisToCreate
  };
  await analysisRepository.insert(analysis);

  await sampleRepository.update({
    ...sample,
    status: 'Analysis'
  });

  response.status(constants.HTTP_STATUS_CREATED).send(analysis);
};

const updateAnalysis = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const analysisId = request.params.analysisId;
  const analysisUpdate = request.body as PartialAnalysis;

  console.info('Update analysis', analysisUpdate);

  const analysis = await analysisRepository.findUnique(analysisId);

  if (!analysis) {
    throw new AnalysisMissingError(analysisId);
  }

  const sample = await sampleRepository.findUnique(analysisUpdate.sampleId);

  if (!sample) {
    throw new SampleMissingError(analysisUpdate.sampleId);
  }

  if (sample.region !== user.region) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  if (sample.status === 'InReview' && analysisUpdate.status === 'Completed') {
    const getResiduesWithoutInterpretation = (
      residues: PartialResidue[] | undefined | null
    ) =>
      residues?.map(
        ({
          analysisId,
          compliance,
          resultHigherThanArfd,
          notesOnResult,
          substanceApproved,
          substanceAuthorised,
          pollutionRisk,
          notesOnPollutionRisk,
          otherCompliance,
          ...rest
        }) => rest
      ) ?? [];

    const oldResidues = getResiduesWithoutInterpretation(analysis.residues);
    const newResidues = getResiduesWithoutInterpretation(
      analysisUpdate.residues
    );
    if (!isEqual(oldResidues, newResidues)) {
      await mattermostService.send(
        `Une analyse vient d'être corrigée par un préleveur : SampleId ${analysisUpdate.sampleId}`
      );
      await analysisErrorsRepository.insert(
        analysis.id,
        oldResidues,
        newResidues
      );
    }
  }

  const updatedAnalysis = {
    ...analysis,
    ...analysisUpdate
  };
  await analysisRepository.update(updatedAnalysis);

  if (updatedAnalysis.status === 'Completed') {
    const sample = await sampleRepository.findUnique(updatedAnalysis.sampleId);

    if (!sample) {
      throw new SampleMissingError(updatedAnalysis.sampleId);
    }

    await sampleRepository.update({
      ...sample,
      status: 'Completed'
    });
  }

  response.send(updatedAnalysis);
};

export default {
  getAnalysis,
  createAnalysis,
  updateAnalysis
};
