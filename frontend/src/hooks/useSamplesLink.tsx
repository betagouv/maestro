import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAppSelector } from 'src/hooks/useStore';
import { AuthenticatedAppRoutes } from '../AppRoutes';

export const useSamplesLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const sampleLink = useMemo(
    () => (sampleId: string, step?: number) =>
      `${AuthenticatedAppRoutes.SampleRoute.link(sampleId)}${step ? `?etape=${step}` : ''}`,
    []
  );

  const samplesLink = useMemo(
    () =>
      programmingPlan
        ? AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)
        : undefined,
    [programmingPlan]
  );

  const navigateToSample = (sampleId: string, step?: number) => {
    navigate(sampleLink(sampleId, step));
  };

  const navigateToSamples = () => {
    if (samplesLink) {
      navigate(samplesLink);
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
    samplesLink,
    navigateToSamples,
    getSampleStepParam
  };
};
