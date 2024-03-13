import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SampleUpdate } from 'shared/schema/Sample';
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

  const [step, setStep] = useState(1);

  const StepTitles = [
    'Création du prélèvement',
    'Saisie des informations',
    'Validation',
  ];

  useEffect(() => {
    if (sample) {
      const sampleParse = SampleUpdate.safeParse(sample);
      if (sampleParse.success) {
        setStep(3);
      } else {
        setStep(2);
      }
    }
  }, [sample]);

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
      />
      {step === 1 && <SampleFormStep1 />}
      {step === 2 && sample && <SampleFormStep2 sample={sample} />}
      {step === 3 && sample && <SampleFormStep3 sample={sample} />}
    </section>
  );
};

export default SampleView;
