import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { PartialSample, SampleUpdate } from 'shared/schema/Sample';

interface Props {
  sample: PartialSample;
}

const SampleFormStep3 = ({ sample }: Props) => {
  const Form = SampleUpdate;

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {};

  return (
    <form data-testid="draft_sample_3_form">
      <div className={cx('fr-col-12')}>
        <ButtonsGroup
          inlineLayoutWhen="md and up"
          buttons={[
            {
              children: 'Valider le prélèvement',
              onClick: submit,
            },
          ]}
        />
      </div>
    </form>
  );
};

export default SampleFormStep3;
