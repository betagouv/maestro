import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Sample } from 'shared/schema/Sample/Sample';

interface Props {
  sample: Sample;
}

const SampleStepSubmitted = ({ sample }: Props) => {
  return (
    <div data-testid="sample_data" className="sample-form">
      <h3 className={cx('fr-m-0')}>
        Demande d'analyse {sample.reference} envoyée
      </h3>
      TODO
    </div>
  );
};

export default SampleStepSubmitted;
