import { constants } from 'node:http2';
import { isEqual, isNil } from 'lodash-es';
import AnalysisMissingError from 'maestro-shared/errors/analysisMissingError';
import type { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import type { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { hasSamplePermission } from 'maestro-shared/schema/Sample/Sample';
import { v4 as uuidv4 } from 'uuid';
import { getAndCheckSample } from '../middlewares/checks/sampleCheck';
import { analysisErrorsRepository } from '../repositories/analysisErrorsRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { mattermostService } from '../services/mattermostService';

export const analysisRouter = {
  '/analysis': {
    get: async (request) => {
      const sampleItemKey = request.query;
      const analysis = await analysisRepository.findUnique(sampleItemKey);

      if (!analysis) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      return { response: analysis, status: constants.HTTP_STATUS_OK };
    },
    post: async ({ user, userRole, body: analysisToCreate }) => {
      const sample = await getAndCheckSample(
        analysisToCreate.sampleId,
        user,
        userRole
      );

      if (!hasSamplePermission(user, userRole, sample)['performAnalysis']) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      console.info('Create analysis for sampleId', sample.id, analysisToCreate);

      const analysis: PartialAnalysis = {
        id: uuidv4(),
        createdAt: new Date(),
        createdBy: user.id,
        status: 'Analysis',
        compliance: null,
        notesOnCompliance: null,
        ...analysisToCreate
      };
      await analysisRepository.insert(analysis);

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: analysis
      };
    }
  },
  '/analysis/:analysisId': {
    put: async ({ user, userRole, body: analysisUpdate }, { analysisId }) => {
      console.info('Update analysis', analysisUpdate);

      const analysis = await analysisRepository.findUnique(analysisId);

      if (!analysis) {
        throw new AnalysisMissingError(analysisId);
      }

      const sample = await getAndCheckSample(analysis.sampleId, user, userRole);

      if (!hasSamplePermission(user, userRole, sample)['performAnalysis']) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      if (
        sample.status === 'InReview' &&
        analysisUpdate.status === 'Completed'
      ) {
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
            `Une analyse vient d'être corrigée par un préleveur : SampleId ${analysis.sampleId}`
          );
          await analysisErrorsRepository.upsert(
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

      if (sample.programmingPlanKind === 'PPV') {
        await sampleRepository.update({
          ...sample,
          compliance: isNil(updatedAnalysis.compliance)
            ? undefined
            : updatedAnalysis.compliance
              ? ('Compliant' as const)
              : ('NonCompliant' as const)
        });
      } else {
        await sampleRepository.evaluateSampleCompliance(sample.id);
      }

      return { response: updatedAnalysis, status: constants.HTTP_STATUS_OK };
    }
  }
} as const satisfies ProtectedSubRouter;
