import { fr } from '@codegouvfr/react-dsfr';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Sample } from 'shared/schema/Sample/Sample';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppSelector } from 'src/hooks/useStore';
import {
  SampleMutationEndpoints,
  useGetSampleQuery,
} from 'src/services/sample.service';
import SampleStep1 from 'src/views/SampleView/SampleStep1';
import SampleStep2 from 'src/views/SampleView/SampleStep2';
import SampleStep3 from 'src/views/SampleView/SampleStep3';
import SampleStep4 from 'src/views/SampleView/SampleStep4';

const SampleView = () => {
  useDocumentTitle("Saisie d'un prélèvement");

  const { sampleId } = useParams<{ sampleId?: string }>();

  const { data: sample } = useGetSampleQuery(sampleId as string, {
    skip: !sampleId,
  });

  const isSomeMutationPending = useAppSelector((state) =>
    Object.values(state.api.mutations).some(
      (mutation) =>
        mutation?.endpointName !== undefined &&
        Object.values(SampleMutationEndpoints).includes(
          mutation?.endpointName as SampleMutationEndpoints
        ) &&
        mutation?.status === 'pending'
    )
  );
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);

  const StepTitles = [
    'Création du prélèvement',
    'Saisie des informations',
    'Saisie des échantillons',
    'Validation',
  ];

  const SampleStatusSteps: Record<SampleStatus, number> = {
    Draft: 1,
    DraftInfos: 2,
    DraftItems: 3,
    Submitted: 4,
    Sent: 4,
  };

  useEffect(() => {
    if (sample) {
      if (searchParams.get('etape')) {
        setStep(Number(searchParams.get('etape')));
      } else {
        setStep(SampleStatusSteps[sample.status]);
      }
    }
  }, [sample, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  if (sampleId && !sample) {
    return <></>;
  }

  return (
    <section className={cx('fr-py-3w')}>
      <h1>
        Prélévement {sample?.reference}
        <div
          className={cx('fr-text--sm', 'fr-text--light')}
          style={{
            color: fr.colors.decisions.text.mention.grey.default,
          }}
        >
          <SampleStatusBadge
            status={sample?.status as SampleStatus}
            className={cx('fr-mr-1w')}
          />

          {isSomeMutationPending ? (
            'Enregistrement en cours...'
          ) : (
            <>
              {sample?.status &&
                sample?.lastUpdatedAt &&
                ['Draft', 'DraftInfos', 'DraftItems'].includes(
                  sample?.status
                ) && (
                  <>
                    Enregistré le{' '}
                    {format(sample.lastUpdatedAt, 'dd/MM/yyyy à HH:mm:ss')}
                  </>
                )}
            </>
          )}
        </div>
      </h1>
      {sample?.status !== 'Sent' && (
        <>
          <Stepper
            currentStep={step}
            nextTitle={StepTitles[step]}
            stepCount={4}
            title={StepTitles[step - 1]}
          />
        </>
      )}
      {step === 1 && <SampleStep1 partialSample={sample} />}
      {step === 2 && sample && <SampleStep2 partialSample={sample} />}
      {step === 3 && sample && <SampleStep3 partialSample={sample} />}
      {step === 4 && sample && <SampleStep4 sample={sample as Sample} />}
    </section>
  );
};

export default SampleView;
