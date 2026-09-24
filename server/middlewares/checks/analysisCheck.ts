import { constants } from 'node:http2';
import AnalysisMissingError from 'maestro-shared/errors/analysisMissingError';
import { HttpError } from 'maestro-shared/errors/httpError';
import type { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import {
  hasSamplePermission,
  type PartialSample,
  type SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import type { UserBase } from 'maestro-shared/schema/User/User';
import type { UserRole } from 'maestro-shared/schema/User/UserRole';
import { analysisRepository } from '../../repositories/analysisRepository';
import { programmingSubPlanRepository } from '../../repositories/programmingSubPlanRepository';
import { getAndCheckSample } from './sampleCheck';

export const getAndCheckAnalysisSample = async (
  analysisId: string,
  user: UserBase,
  userRole: UserRole,
  requirePerformAnalysis: boolean
): Promise<{
  analysis: PartialAnalysis;
  sample: PartialSample | SampleChecked;
}> => {
  const analysis = await analysisRepository.findUnique(analysisId);

  if (!analysis) {
    throw new AnalysisMissingError(analysisId);
  }

  const sample: PartialSample | SampleChecked = await getAndCheckSample(
    analysis.sampleId,
    user,
    userRole
  );

  if (requirePerformAnalysis) {
    const subPlan = await programmingSubPlanRepository.findUnique(
      sample.programmingSubPlanId
    );
    if (
      !hasSamplePermission(
        user,
        userRole,
        sample,
        subPlan?.analysisPermissionRole
      )['performAnalysis']
    ) {
      throw new HttpError({
        status: constants.HTTP_STATUS_FORBIDDEN,
        name: 'AnalysisPermissionError',
        message: `Vous n'avez pas les droits sur cette analyse`
      });
    }
  }

  return { analysis, sample };
};
