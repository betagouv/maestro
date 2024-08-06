import React, { useEffect } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppSelector } from 'src/hooks/useStore';
import { useLazyFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useLazyFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import {
  useCreateOrUpdateSampleMutation,
  useLazyFindSamplesQuery,
  useLazyGetSampleQuery,
} from 'src/services/sample.service';

export const useOnLine = () => {
  const { isAuthenticated } = useAuthentication();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  const { pendingSamples } = useAppSelector((state) => state.samples);
  const [createOrUpdateSample] = useCreateOrUpdateSampleMutation();

  const [findProgrammingPlans] = useLazyFindProgrammingPlansQuery();
  const [findPrescriptions] = useLazyFindPrescriptionsQuery();
  const [getSample] = useLazyGetSampleQuery();
  const [findSamples] = useLazyFindSamplesQuery();

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
          Object.values(pendingSamples).map((sample) =>
            createOrUpdateSample(sample)
          )
        );

        //Load programming plans and prescriptions from the server to made them available offline in order to create new samples
        const programmingPlans = await findProgrammingPlans({
          status: 'Validated',
        }).unwrap();
        await Promise.all(
          programmingPlans.map(async (programmingPlan) =>
            findPrescriptions({
              programmingPlanId: programmingPlan.id,
            }).unwrap()
          )
        );

        //Load last samples from the server to made them available offline
        const samples = await findSamples({
          page: 1,
          perPage: 5,
        }).unwrap();
        await Promise.all(
          samples.map((sample) => getSample(sample.id).unwrap())
        );
      })();
    }
  }, [isOnline, isAuthenticated, pendingSamples]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isOnline,
  };
};
