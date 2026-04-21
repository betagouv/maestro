import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import { usePartialSample } from '../../hooks/usePartialSample';

interface Props {
  isOpen: boolean;
  isDraft?: boolean;
  sample: PartialSample | PartialSampleToCreate;
}

const SavedAlert = ({ isOpen, isDraft, sample }: Props) => {
  const { programmingPlan } = usePartialSample(sample);
  const { samplesLink } = useSamplesLink();

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
          {programmingPlan && (
            <Button
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
              linkProps={{
                to: samplesLink(programmingPlan.year) as string
              }}
              priority="tertiary no outline"
            >
              Tous les prélèvements
            </Button>
          )}
        </>
      }
    ></Alert>
  ) : null;
};

export default SavedAlert;
