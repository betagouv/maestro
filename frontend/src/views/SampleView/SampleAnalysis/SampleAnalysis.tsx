import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import clsx from 'clsx';
import { useState } from 'react';
import { Sample } from 'shared/schema/Sample/Sample';
import AnalysisDocumentStep from 'src/views/SampleView/SampleAnalysis/AnalysisDocumentStep';
import AnalysisResiduesStep from 'src/views/SampleView/SampleAnalysis/AnalysisResiduesStep';

interface Props {
  sample: Sample;
}

const SampleAnalysis = ({ sample }: Props) => {
  const [step, setStep] = useState<number>(1);

  return (
    <div
      className={clsx(
        cx('fr-callout', 'fr-callout--pink-tuile', 'fr-mt-5w'),
        'sample-callout'
      )}
    >
      <h4 className={cx('fr-mb-0')}>
        <div className={cx('fr-label--error', 'fr-text--sm')}>ETAPE 2</div>
        Saisie des résultats d’analyse
        <div className={cx('fr-text--md', 'fr-text--regular')}>
          Renseignez les résultats du rapport d’analyse
        </div>
      </h4>
      <Stepper
        currentStep={1}
        nextTitle="Résidus identifiés"
        stepCount={3}
        title="Rapport d’analyse"
        className={cx('fr-mb-0')}
      />
      <hr />
      {step === 1 && <AnalysisDocumentStep sampleId={sample.id} />}
      {step === 2 && <AnalysisResiduesStep />}
    </div>
  );
};

export default SampleAnalysis;
