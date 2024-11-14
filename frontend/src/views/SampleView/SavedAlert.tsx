import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useAppSelector } from 'src/hooks/useStore';

interface Props {
  isOpen: boolean;
  isDraft?: boolean;
}

const SavedAlert = ({ isOpen, isDraft }: Props) => {
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);

  return isOpen ? (
    <Alert
      severity={'success'}
      small
      description={
        <>
          <div className={cx('fr-ml-2w')}>
            Votre saisie a bien été enregistrée
            {isDraft && ' en tant que prélèvement en brouillon'}.
          </div>
          <Button
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            linkProps={{
              to: `/prelevements/${programmingPlan?.year}`,
            }}
            priority="tertiary no outline"
          >
            Tous les prélèvements
          </Button>
        </>
      }
    ></Alert>
  ) : (
    <></>
  );
};

export default SavedAlert;
