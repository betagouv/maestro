import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useGetSampleQuery } from 'src/services/sample.service';
import SampleStep1 from 'src/views/SampleView/SampleStep1';
import SampleStep2 from 'src/views/SampleView/SampleStep2';
import SampleStep3 from 'src/views/SampleView/SampleStep3';

const SampleView = () => {
  useDocumentTitle("Saisie d'un prélèvement");

  const { sampleId } = useParams<{ sampleId?: string }>();

  console.log('sampleId', sampleId);

  const { data: sample } = useGetSampleQuery(sampleId as string, {
    skip: !sampleId,
  });

  console.log('sample', sample);

  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);

  const StepTitles = [
    'Création du prélèvement',
    'Saisie des informations',
    'Validation',
  ];

  useEffect(() => {
    if (sample) {
      if (searchParams.get('etape')) {
        setStep(Number(searchParams.get('etape')));
      } else {
        if (sample?.status === 'Submitted' || sample?.status === 'Sent') {
          setStep(3);
        } else {
          setStep(2);
        }
      }
    }
  }, [sample, searchParams]);

  if (sampleId && !sample) {
    return <></>;
  }

  return (
    <section className={cx('fr-py-3w')}>
      <h1>Prélévement {sample?.reference}</h1>

      {sample?.status !== 'Sent' && (
        <>
          <Stepper
            currentStep={step}
            nextTitle={StepTitles[step]}
            stepCount={3}
            title={StepTitles[step - 1]}
            className={cx(sample && step > 1 && 'fr-mb-1w')}
          />

          {sample && step > 1 && (
            <div className={cx('fr-pb-1w', 'fr-text--sm')}>
              <Link to={`/prelevements/${sample.id}?etape=${step - 1}`}>
                Retour à l'étape précédente
              </Link>
            </div>
          )}
        </>
      )}
      {step === 1 && <SampleStep1 partialSample={sample} />}
      {step === 2 && sample && <SampleStep2 partialSample={sample} />}
      {step === 3 && sample && <SampleStep3 partialSample={sample} />}
    </section>
  );
};

export default SampleView;
