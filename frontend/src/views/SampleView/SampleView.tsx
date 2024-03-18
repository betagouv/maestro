import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useGetSampleQuery } from 'src/services/sample.service';
import SampleFormStep1 from 'src/views/SampleView/SampleFormStep1';
import SampleFormStep2 from 'src/views/SampleView/SampleFormStep2';
import SampleFormStep3 from 'src/views/SampleView/SampleFormStep3';

const SampleView = () => {
  useDocumentTitle("Saisie d'un prélèvement");

  const { sampleId } = useParams<{ sampleId?: string }>();

  const { data: sample } = useGetSampleQuery(sampleId as string, {
    skip: !sampleId,
  });

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
      {step === 1 && <SampleFormStep1 partialSample={sample} />}
      {step === 2 && sample && <SampleFormStep2 partialSample={sample} />}
      {step === 3 && sample && <SampleFormStep3 partialSample={sample} />}
    </section>
  );
};

export default SampleView;
