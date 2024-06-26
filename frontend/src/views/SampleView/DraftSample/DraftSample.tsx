import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Stepper from '@codegouvfr/react-dsfr/Stepper';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import { SampleStatus } from 'shared/schema/Sample/SampleStatus';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import SampleStepCreation from 'src/views/SampleView/DraftSample/SampleStepCreation/SampleStepCreation';
import SampleStepDraftItems from 'src/views/SampleView/DraftSample/SampleStepDraftItems/SampleStepDraftItems';
import SampleStepDraftMatrix from 'src/views/SampleView/DraftSample/SampleStepDraftMatrix/SampleStepDraftMatrix';
import SampleStepSubmitted from 'src/views/SampleView/DraftSample/SampleStepSubmitted/SampleStepSubmitted';
import { SampleStepTitles } from 'src/views/SampleView/SampleView';
import audit from '../../../assets/illustrations/audit.svg';
import '../SampleView.scss';

interface Props {
  sample?: PartialSample | Sample;
}

const SampleView = ({ sample }: Props) => {
  useDocumentTitle("Saisie d'un prélèvement");

  const { hasPermission } = useAuthentication();

  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<number>();

  const SampleStatusSteps: Partial<Record<SampleStatus, number>> = {
    Draft: 1,
    DraftMatrix: 2,
    DraftItems: 3,
    Submitted: 4,
  };

  useEffect(() => {
    if (sample) {
      if (searchParams.get('etape')) {
        setStep(Number(searchParams.get('etape')));
      } else {
        setStep(SampleStatusSteps[sample.status]);
      }
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
        {hasPermission('updateSample') && step && (
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
              nextTitle={SampleStepTitles[step]}
              stepCount={4}
              title={SampleStepTitles[step - 1]}
            />
          </div>
        )}
        {step === 1 && <SampleStepCreation partialSample={sample} />}
        {step === 2 && sample && (
          <SampleStepDraftMatrix partialSample={sample} />
        )}
        {step === 3 && sample && (
          <SampleStepDraftItems partialSample={sample} />
        )}
        {step === 4 && sample && (
          <SampleStepSubmitted sample={sample as Sample} />
        )}
      </div>
    </section>
  );
};

export default SampleView;
