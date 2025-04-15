import Button from '@codegouvfr/react-dsfr/Button';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { SampleStatusSteps } from 'maestro-shared/schema/Sample/SampleStatus';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import useWindowSize from '../../../hooks/useWindowSize';

interface Props {
  partialSample?: PartialSample | PartialSampleToCreate;
  currentStep: number;
}

const NextButton = ({ partialSample, currentStep }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const { isMobile } = useWindowSize();

  if (
    !partialSample ||
    (SampleStatusSteps[partialSample.status] ?? currentStep) <= currentStep
  ) {
    return <></>;
  }

  return (
    <Button
      title="Continuer"
      children={isMobile ? 'Suite' : undefined}
      priority="tertiary"
      className="float-right"
      onClick={(e) => {
        e.preventDefault();
        navigateToSample(partialSample.id, currentStep + 1);
      }}
      iconId={isMobile ? undefined : 'fr-icon-arrow-right-line'}
    />
  );
};

export default NextButton;
