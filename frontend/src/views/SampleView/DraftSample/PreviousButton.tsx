import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from 'src/hooks/useStore';
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
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  return {
    ...{
      priority: 'tertiary',
      onClick: async (e) => {
        e.preventDefault();
        await onSave();
        navigate(
          `/prelevements/${programmingPlan?.year}/${sampleId}?etape=${
            currentStep - 1
          }`,
          {
            replace: true,
          }
        );
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
