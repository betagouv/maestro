import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from 'src/hooks/useStore';

export const useSamplesLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const sampleLink = useMemo(
    () => (sampleId: string, step?: number) => {
      if (!programmingPlan) {
        return '/';
      } else {
        return `/prelevements/${programmingPlan.year}/${sampleId}${
          step ? `/etape/${step}` : ''
        }`;
      }
    },
    [programmingPlan]
  );

  const samplesLink = useMemo(
    () => `/prelevements/${programmingPlan?.year}`,
    [programmingPlan]
  );

  const navigateToSample = (sampleId: string, step?: number) => {
    navigate(sampleLink(sampleId, step));
  };

  const navigateToSamples = () => {
    navigate(samplesLink);
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
