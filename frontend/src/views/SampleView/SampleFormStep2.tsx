import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { DraftSampleStep1 } from 'shared/schema/Sample';
import { useForm } from 'src/hooks/useForm';

interface Props {
  onValid: () => void;
}

const SampleFormStep2 = ({ onValid }: Props) => {
  const Form = DraftSampleStep1.pick({});

  const form = useForm(Form, {});

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate();
    if (form.isValid()) {
      console.log('valid');
      onValid();
    }
  };

  return (
    <form data-testid="draft_sample_2_form">
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <Button data-testid="submit-button" onClick={submit}>
            Valider
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SampleFormStep2;
