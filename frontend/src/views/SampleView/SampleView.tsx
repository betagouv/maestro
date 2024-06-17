import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useAppSelector } from 'src/hooks/useStore';
import {
  SampleMutationEndpoints,
  useGetSampleQuery,
} from 'src/services/sample.service';
import SampleStepCreation from 'src/views/SampleView/SampleStepCreation';
import SampleStepDraftItems from 'src/views/SampleView/SampleStepDraftItems';
import SampleStepDraftMatrix from 'src/views/SampleView/SampleStepDraftMatrix';
import SampleStepSubmitted from 'src/views/SampleView/SampleStepSubmitted';
import newSample from '../../assets/illustrations/new-sample.png';
import './SampleView.scss';

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
    'Cadre du prélèvement',
    'Matrice contrôlée',
    'Echantillons',
    'Récapitulatif',
    "Demande d'analyse enregistrée",
  ];

  const SampleStatusSteps: Record<SampleStatus, number> = {
    Draft: 1,
    DraftCompany: 2,
    DraftMatrix: 3,
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
    <section
      className={clsx(
        cx('fr-pt-3w', 'fr-pt-md-4w', 'fr-pb-6w'),
        'white-container'
      )}
    >
      {/*<div*/}
      {/*  className={cx('fr-text--sm', 'fr-text--light')}*/}
      {/*  style={{*/}
      {/*    color: fr.colors.decisions.text.mention.grey.default,*/}
      {/*  }}*/}
      {/*>*/}
      {/*  {isSomeMutationPending ? (*/}
      {/*    'Enregistrement en cours...'*/}
      {/*  ) : (*/}
      {/*    <>*/}
      {/*      {sample?.status &&*/}
      {/*        sample?.lastUpdatedAt &&*/}
      {/*        DraftStatusList.includes(sample?.status) && (*/}
      {/*          <>*/}
      {/*            Enregistré le{' '}*/}
      {/*            {format(sample.lastUpdatedAt, 'dd/MM/yyyy à HH:mm:ss')}*/}
      {/*          </>*/}
      {/*        )}*/}
      {/*    </>*/}
      {/*  )}*/}
      {/*</div>*/}
      {hasPermission('updateSample') && sample?.status !== 'Sent' && step && (
        <div className="sample-stepper">
          <img
            src={newSample}
            height="100%"
            aria-hidden={true}
            className={cx('fr-hidden', 'fr-unhidden-md')}
          />
          <Stepper
            currentStep={step}
            nextTitle={StepTitles[step]}
            stepCount={5}
            title={StepTitles[step - 1]}
          />
        </div>
      )}
      {step === 1 && <SampleStepCreation partialSample={sample} />}
      {step === 2 && sample && <SampleStepDraftMatrix partialSample={sample} />}
      {step === 3 && sample && <SampleStepDraftItems partialSample={sample} />}
      {step === 4 && sample && <SampleStepSubmitted sample={sample} />}
    </section>
  );
};

export default SampleView;
