import { toArray } from 'maestro-shared/utils/utils';
import React, { useContext, useEffect, useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppSelector } from 'src/hooks/useStore';
import { ApiClientContext } from '../services/apiClient';
import { useAnalytics } from './useAnalytics';

export const useOnLine = () => {
  const apiClient = useContext(ApiClientContext);
  const { isAuthenticated } = useAuthentication();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { trackEvent } = useAnalytics();

  //FIXME à revoir plus généralement avec la gestion de la data en offline
  const { data: yearProgrammingPlans } = apiClient.useFindProgrammingPlansQuery(
    {
      year: Number(new Date().getFullYear())
    },
    {
      skip: !isAuthenticated
    }
  );

  const programmingPlan = useMemo(
    () => yearProgrammingPlans?.[0],
    [yearProgrammingPlans]
  );

  const { pendingSamples } = useAppSelector((state) => state.samples);

  const [createOrUpdateSample] = apiClient.useCreateOrUpdateSampleMutation();
  const [findPrescriptions] = apiClient.useLazyFindPrescriptionsQuery();
  const [getSample] = apiClient.useLazyGetSampleQuery();
  const [findSamples] = apiClient.useLazyFindSamplesQuery();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && isAuthenticated) {
      (async () => {
        //Synchronize pending samples with the server
        await Promise.all(
          Object.values(pendingSamples).map(async (sample) => {
            const createdSample = await createOrUpdateSample(sample).unwrap();
            trackEvent('sample', 'push_offline', createdSample.id);
          })
        );

        //Load prescriptions and last samples from the server to made them available offline in order to create new samples
        if (programmingPlan) {
          await Promise.all(
            programmingPlan.contexts.map(async (context) =>
              findPrescriptions({
                programmingPlanId: programmingPlan.id,
                contexts: [context]
              }).unwrap()
            )
          );

          const samples = await findSamples({
            programmingPlanIds: toArray(programmingPlan?.id),
            page: 1,
            perPage: 5
          }).unwrap();

          await Promise.all(
            samples.map((sample) => getSample({ sampleId: sample.id }).unwrap())
          );
        }
      })();
    }
  }, [isOnline, isAuthenticated, pendingSamples]);

  return {
    isOnline
  };
};
