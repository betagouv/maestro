import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import { useState } from 'react';
import { SampleToCreate } from 'shared/schema/Sample';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useCreateSampleMutation } from 'src/services/sample.service';
import SampleFormStep1 from 'src/views/SampleView/SampleFormStep1';
import SampleFormStep2 from 'src/views/SampleView/SampleFormStep2';

const SampleView = () => {
  useDocumentTitle("Saisie d'un prélèvement");

  const [step, setStep] = useState(1);

  const [createSample] = useCreateSampleMutation();

  const StepTitles = [
    'Création du prélèvement',
    'Saisie des informations',
    'Validation',
  ];

  const validStep1 = async (draftSample: SampleToCreate) => {
    await createSample(draftSample);
    setStep(2);
  };

  return (
    <section className={cx('fr-py-3w')}>
      <h1>Prélévement</h1>
      <Stepper
        currentStep={step}
        nextTitle={StepTitles[step]}
        stepCount={3}
        title={StepTitles[step - 1]}
      />
      {step === 1 && <SampleFormStep1 onValid={validStep1} />}
      {step === 2 && <SampleFormStep2 onValid={() => setStep(3)} />}
    </section>
  );
};

export default SampleView;
