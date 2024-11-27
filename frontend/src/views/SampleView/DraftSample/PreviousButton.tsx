import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import useWindowSize from 'src/hooks/useWindowSize';

interface Props {
  sampleId: string;
  onSave: () => Promise<void>;
  currentStep: number;
}

const PreviousButton = ({
  sampleId,
  onSave,
  currentStep,
}: Props): ButtonProps => {
  const { navigateToSample } = useSamplesLink();
  const { isMobile } = useWindowSize();

  return {
    ...{
      priority: 'tertiary',
      onClick: async (e) => {
        e.preventDefault();
        await onSave();
        navigateToSample(sampleId, currentStep - 1);
      },
      title: 'Retour',
      nativeButtonProps: {
        'data-testid': 'previous-button',
      },
    },
    ...(isMobile
      ? {
          children: 'Retour',
          className: cx('fr-hidden-md'),
        }
      : {
          iconId: 'fr-icon-arrow-left-line',
        }),
  };
};

export default PreviousButton;
