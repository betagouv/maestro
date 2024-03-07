import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { useState } from 'react';
import { DraftSampleStep1 } from 'shared/schema/Sample';
import {
  SampleContextLabels,
  SampleContextList,
} from 'shared/schema/SampleContext';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';

interface Props {
  onValid: () => void;
}

const SampleFormStep1 = ({ onValid }: Props) => {
  const [resytalId, setResytalId] = useState('');
  const [context, setContext] = useState('');

  const Form = DraftSampleStep1.pick({
    resytalId: true,
    context: true,
  });

  const form = useForm(Form, {
    resytalId,
    context,
  });

  type FormShape = typeof Form.shape;

  const sampleContextOptions = [
    {
      label: 'Sélectionner un contexte',
      value: '',
      disabled: true,
    },
    ...SampleContextList.map((context) => ({
      label: SampleContextLabels[context],
      value: context,
    })),
  ];

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate();
    if (form.isValid()) {
      onValid();
    }
  };

  return (
    <form data-testid="draft_sample_1_form">
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div
          className={cx(
            'fr-col-12',
            'fr-col-sm-4',
            'fr-col-offset-sm-8--right'
          )}
        >
          <AppTextInput<FormShape>
            type="text"
            value={resytalId}
            onChange={(e) => setResytalId(e.target.value)}
            inputForm={form}
            inputKey="resytalId"
            whenValid="Identifiant Resytal correctement renseigné."
            data-testid="resytalId-input"
            label="Identifiant Resytal (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-4')}>
          <AppSelect
            defaultValue=""
            options={sampleContextOptions}
            onChange={(e) => setContext(e.target.value)}
            inputForm={form}
            inputKey="context"
            whenValid="Contexte correctement renseigné."
            data-testid="context-select"
            label="Contexte (obligatoire)"
            required
          />
        </div>
        <div className={cx('fr-col-12')}>
          <Button data-testid="submit-button" onClick={submit}>
            Valider
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SampleFormStep1;
