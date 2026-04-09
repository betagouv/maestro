import Button from '@codegouvfr/react-dsfr/Button';
import type {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { SampleSteps } from 'maestro-shared/schema/Sample/SampleStep';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import useWindowSize from '../../../hooks/useWindowSize';

interface Props {
  partialSample?: PartialSample | PartialSampleToCreate;
  currentStep: number;
}

const NextButton = ({ partialSample, currentStep }: Props) => {
  const { navigateToSample } = useSamplesLink();
  const { isMobile } = useWindowSize();

  if (!partialSample || SampleSteps[partialSample.step] <= currentStep) {
    return null;
  }

  return (
    <Button
      title="Continuer"
      priority="tertiary"
      className="float-right"
      onClick={(e) => {
        e.preventDefault();
        navigateToSample(partialSample.id, currentStep + 1);
      }}
      iconId={isMobile ? undefined : 'fr-icon-arrow-right-line'}
    >
      {isMobile ? 'Suite' : undefined}
    </Button>
  );
};

export default NextButton;
