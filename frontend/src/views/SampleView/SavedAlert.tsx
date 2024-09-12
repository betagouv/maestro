import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';

interface Props {
  isOpen: boolean;
  isDraft?: boolean;
}

const SavedAlert = ({ isOpen, isDraft }: Props) => {
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

export default SavedAlert;
