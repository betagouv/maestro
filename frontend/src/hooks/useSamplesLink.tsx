import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from 'src/hooks/useStore';

export const useSamplesLink = () => {
  const navigate = useNavigate();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  const sampleLink = useMemo(
    () => (sampleId: string, step?: number) => {
      if (!programmingPlan) {
        return '/';
      } else {
        return `/prelevements/${programmingPlan.year}/${sampleId}${
          step ? `?etape=${step}` : ''
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

  return { sampleLink, navigateToSample, samplesLink, navigateToSamples };
};
