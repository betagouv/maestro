import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AuthenticatedAppRoutes } from '../AppRoutes';

export const useSamplesLink = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sampleLink = useCallback(
    (sampleId: string, step?: number) =>
      `${AuthenticatedAppRoutes.SampleRoute.link(sampleId)}${step ? `?etape=${step}` : ''}`,
    []
  );

  const samplesLink = useCallback(
    (year?: number) =>
      year ? AuthenticatedAppRoutes.SamplesByYearRoute.link(year) : undefined,
    []
  );

  const navigateToSample = (sampleId: string, step?: number) => {
    navigate(sampleLink(sampleId, step));
  };

  const navigateToSampleEdit = (sampleId: string) => {
    navigate(AuthenticatedAppRoutes.SampleAnalysisEditRoute.link(sampleId));
  };

  const navigateToSamples = () => {
    if (samplesLink()) {
      navigate(samplesLink() as string);
    }
  };

  const getSampleStepParam = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('etape');
    if (stepParam) {
      return Number(stepParam);
    }
    return;
  }, [location.search]);

  return {
    sampleLink,
    navigateToSample,
    navigateToSampleEdit,
    samplesLink,
    navigateToSamples,
    getSampleStepParam
  };
};
