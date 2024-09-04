import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';

interface Props {
  isOpen: boolean;
  isSubmitted?: boolean;
}

const DraftSavedAlert = ({ isOpen, isSubmitted }: Props) => {
  return isOpen ? (
    <Alert
      severity={'success'}
      small
      description={
        <>
          <div className={cx('fr-ml-2w')}>
            Votre saisie a bien été enregistrée en tant que prélèvement
            {isSubmitted ? ' à envoyer' : ' en brouillon'}.
          </div>
          <Button
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            linkProps={{
              to: `/prelevements`,
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

export default DraftSavedAlert;
