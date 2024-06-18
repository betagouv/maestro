import { ButtonProps } from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useNavigate } from 'react-router-dom';

interface Props {
  sampleId: string;
  onSave: () => Promise<void>;
  currentStep: number;
  isSmallMedia: boolean;
}

const PreviousButton = ({
  sampleId,
  onSave,
  currentStep,
  isSmallMedia,
}: Props): ButtonProps => {
  const navigate = useNavigate();

  return {
    ...{
      priority: 'tertiary',
      onClick: async (e) => {
        e.preventDefault();
        await onSave();
        navigate(`/prelevements/${sampleId}?etape=${currentStep - 1}`, {
          replace: true,
        });
      },
      nativeButtonProps: {
        'data-testid': 'previous-button',
      },
    },
    ...(isSmallMedia
      ? {
          children: 'Retour',
          className: cx('fr-hidden-md'),
        }
      : {
          title: 'Retour',
          iconId: 'fr-icon-arrow-left-line',
          className: cx('fr-hidden', 'fr-unhidden-md'),
        }),
  };
};

export default PreviousButton;
