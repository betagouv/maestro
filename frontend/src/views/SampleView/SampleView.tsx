import { fr } from '@codegouvfr/react-dsfr';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  DraftStatusList,
  SampleStatus,
} from 'shared/schema/Sample/SampleStatus';
import SampleStatusBadge from 'src/components/SampleStatusBadge/SampleStatusBadge';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppSelector } from 'src/hooks/useStore';
import {
  SampleMutationEndpoints,
  useGetSampleQuery,
} from 'src/services/sample.service';
import SampleStepCreation from 'src/views/SampleView/SampleStepCreation';
import SampleStepDraftCompany from 'src/views/SampleView/SampleStepDraftCompany';
import SampleStepDraftInfos from 'src/views/SampleView/SampleStepDraftInfos';
import SampleStepDraftItems from 'src/views/SampleView/SampleStepDraftItems';
import SampleStepSubmitted from 'src/views/SampleView/SampleStepSubmitted';

const SampleView = () => {
  useDocumentTitle("Saisie d'un prélèvement");

  const { hasPermission } = useAuthentication();
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
  const [step, setStep] = useState<number>();

  const StepTitles = [
    'Création du prélèvement',
    'Lieu de prélèvement',
    'Informations',
    'Echantillons',
    'Validation',
  ];

  const SampleStatusSteps: Record<SampleStatus, number> = {
    Draft: 1,
    DraftCompany: 2,
    DraftInfos: 3,
    DraftItems: 4,
    Submitted: 5,
    Sent: 5,
  };

  useEffect(() => {
    if (hasPermission('updateSample')) {
      if (sample) {
        if (searchParams.get('etape')) {
          setStep(Number(searchParams.get('etape')));
        } else {
          setStep(SampleStatusSteps[sample.status]);
        }
      } else if (!sampleId) {
        setStep(1);
      }
    } else {
      setStep(StepTitles.length);
    }
  }, [sample, searchParams, hasPermission('updateSample')]); // eslint-disable-line react-hooks/exhaustive-deps

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
                DraftStatusList.includes(sample?.status) && (
                  <>
                    Enregistré le{' '}
                    {format(sample.lastUpdatedAt, 'dd/MM/yyyy à HH:mm:ss')}
                  </>
                )}
            </>
          )}
        </div>
      </h1>
      {hasPermission('updateSample') && sample?.status !== 'Sent' && step && (
        <>
          <Stepper
            currentStep={step}
            nextTitle={StepTitles[step]}
            stepCount={5}
            title={StepTitles[step - 1]}
          />
        </>
      )}
      {step === 1 && <SampleStepCreation partialSample={sample} />}
      {step === 2 && sample && (
        <SampleStepDraftCompany partialSample={sample} />
      )}
      {step === 3 && sample && <SampleStepDraftInfos partialSample={sample} />}
      {step === 4 && sample && <SampleStepDraftItems partialSample={sample} />}
      {step === 5 && sample && <SampleStepSubmitted sample={sample} />}
    </section>
  );
};

export default SampleView;
