import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import clsx from 'clsx';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
  Sample
} from 'maestro-shared/schema/Sample/Sample';
import { SampleStatusSteps } from 'maestro-shared/schema/Sample/SampleStatus';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import ContextStep from 'src/views/SampleView/DraftSample/ContextStep/ContextStep';
import ItemsStep from 'src/views/SampleView/DraftSample/ItemsStep/ItemsStep';
import MatrixStep from 'src/views/SampleView/DraftSample/MatrixStep/MatrixStep';
import SendingStep from 'src/views/SampleView/DraftSample/SendingStep/SendingStep';
import { SampleStepTitles } from 'src/views/SampleView/SampleView';
import audit from '../../../assets/illustrations/audit.svg';
import { useSamplesLink } from '../../../hooks/useSamplesLink';
import '../SampleView.scss';

interface Props {
  sample?: PartialSample | PartialSampleToCreate;
}

const SampleView = ({ sample }: Props) => {
  useDocumentTitle("Saisie d'un prélèvement");
  const { getSampleStepParam } = useSamplesLink();

  const { hasUserPermission } = useAuthentication();

  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<number>();

  useEffect(() => {
    if (sample) {
      setStep(getSampleStepParam() ?? SampleStatusSteps[sample.status]);
    } else {
      setStep(1);
    }
  }, [sample, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <div
        className={clsx(
          cx('fr-pt-3w', 'fr-pt-md-4w', 'fr-pb-6w'),
          'white-container'
        )}
      >
        {hasUserPermission('updateSample') && step && (
          <div className="sample-stepper">
            <img
              src={audit}
              height="100%"
              aria-hidden
              className={cx('fr-hidden', 'fr-unhidden-md')}
              alt=""
            />
            <Stepper
              currentStep={step}
              nextTitle={SampleStepTitles(sample)[step]}
              stepCount={4}
              title={
                <div>
                  {SampleStepTitles(sample)[step - 1]}
                  {sample && isCreatedPartialSample(sample) && (
                    <span className={cx('fr-text--regular')}>
                      {' '}
                      • Prélèvement {sample.reference}
                    </span>
                  )}
                </div>
              }
            />
          </div>
        )}
        {step === 1 && <ContextStep partialSample={sample} />}
        {step === 2 && sample && <MatrixStep partialSample={sample} />}
        {step === 3 && sample && <ItemsStep partialSample={sample} />}
        {step === 4 && sample && <SendingStep sample={sample as Sample} />}
      </div>
    </section>
  );
};

export default SampleView;
