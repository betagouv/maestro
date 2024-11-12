import React, { useEffect } from 'react';
import { ContextList } from 'shared/schema/ProgrammingPlan/Context';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppSelector } from 'src/hooks/useStore';
import { useLazyFindPrescriptionsQuery } from 'src/services/prescription.service';
import {
  useCreateOrUpdateSampleMutation,
  useLazyFindSamplesQuery,
  useLazyGetSampleQuery,
} from 'src/services/sample.service';

export const useOnLine = () => {
  const { isAuthenticated } = useAuthentication();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  const { pendingSamples } = useAppSelector((state) => state.samples);
  const [createOrUpdateSample] = useCreateOrUpdateSampleMutation();

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

        //Load prescriptions and last samples from the server to made them available offline in order to create new samples
        if (programmingPlan) {
          await Promise.all(
            ContextList.map(async (context) =>
              findPrescriptions({
                programmingPlanId: programmingPlan.id,
                context,
              }).unwrap()
            )
          );

          const samples = await findSamples({
            programmingPlanId: programmingPlan?.id as string,
            page: 1,
            perPage: 5,
          }).unwrap();

          await Promise.all(
            samples.map((sample) => getSample(sample.id).unwrap())
          );
        }
      })();
    }
  }, [isOnline, isAuthenticated, pendingSamples]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isOnline,
  };
};
