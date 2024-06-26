import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { format, parse } from 'date-fns';
import React, { useState } from 'react';
import { Sample } from 'shared/schema/Sample/Sample';
import { isAdmissibleStatus } from 'shared/schema/Sample/SampleStatus';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import z from 'zod';
import check from '../../../assets/illustrations/check.svg';
import warning from '../../../assets/illustrations/warning.svg';

interface Props {
  sample: Sample;
}
const SampleTracking = ({ sample }: Props) => {
  const [updateSample] = useUpdateSampleMutation();

  const [receivedAt, setReceivedAt] = useState(
    format(sample.receivedAt ?? new Date(), 'yyyy-MM-dd')
  );
  const [isAdmissible, setIsAdmissible] = useState(
    isAdmissibleStatus(sample.status)
  );
  const [notesOnAdmissibility, setNotesOnAdmissibility] = useState(
    sample.notesOnAdmissibility
  );

  const Form = Sample.pick({
    receivedAt: true,
    notesOnAdmissibility: true,
  }).merge(
    z.object({
      isAdmissible: z.boolean({
        required_error: 'Veuillez renseigner la recevabilité du prélèvement.',
      }),
    })
  );

  const form = useForm(Form, {
    receivedAt,
    isAdmissible,
    notesOnAdmissibility,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await updateSample({
        ...sample,
        receivedAt: parse(receivedAt, 'yyyy-MM-dd', new Date()),
        status: isAdmissible ? 'Analysis' : 'NotAdmissible',
        notesOnAdmissibility,
      });
    });
  };

  return (
    <div>
      <h3>
        Statut du prélèvement
        <div className={cx('fr-text--lg', 'fr-text--regular')}>
          Renseignez ci-dessous le suivi d’analyse par le laboratoire
        </div>
      </h3>
      <form
        className={clsx(
          cx('fr-callout', 'fr-callout--pink-tuile'),
          'sample-callout'
        )}
      >
        <h4 className={cx('fr-mb-0')}>
          <div className={cx('fr-label--error', 'fr-text--sm')}>ETAPE 1</div>
          Accusé de réception du laboratoire
          <div className={cx('fr-text--md', 'fr-text--regular')}>
            Complétez les champs suivant à réception de la notification par le
            laboratoire
          </div>
        </h4>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppTextInput<FormShape>
              type="date"
              defaultValue={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              inputForm={form}
              inputKey="receivedAt"
              whenValid="Date de notification correctement renseignée."
              label="Date de notification"
              hintText="Format attendu › JJ/MM/AAAA"
              disabled={sample.status !== 'Sent'}
              required
            />
          </div>
        </div>
        <AppRadioButtons<FormShape>
          legend="Échantillon"
          options={[
            {
              label: 'Recevable',
              nativeInputProps: {
                checked: isAdmissible,
                onChange: () => setIsAdmissible(true),
              },
              illustration: <img src={check} alt="" aria-hidden />,
            },
            {
              label: 'Non recevable',
              nativeInputProps: {
                checked: isAdmissible === false,
                onChange: () => {
                  setIsAdmissible(false);
                  setNotesOnAdmissibility('');
                },
              },
              illustration: <img src={warning} alt="" aria-hidden />,
            },
          ]}
          colSm={6}
          inputForm={form}
          inputKey="isAdmissible"
          whenValid="Recevabilité correctement renseignée."
          disabled={sample.status !== 'Sent'}
          required
        />
        {isAdmissible === false && (
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <AppTextAreaInput<FormShape>
                rows={1}
                defaultValue={notesOnAdmissibility ?? ''}
                onChange={(e) => setNotesOnAdmissibility(e.target.value)}
                inputForm={form}
                inputKey="notesOnAdmissibility"
                whenValid="Motif de non-recevabilité correctement renseigné."
                data-testid="notes-input"
                label="Motif de non-recevabilité"
                hintText="Champ facultatif pour précisions supplémentaires"
                disabled={sample.status !== 'Sent'}
              />
            </div>
          </div>
        )}
        {sample.status === 'Sent' && (
          <Button
            type="submit"
            iconId="fr-icon-arrow-down-line"
            iconPosition="right"
            className="fr-m-0"
            onClick={submit}
          >
            Confirmer
          </Button>
        )}
      </form>
      <form
        className={clsx(
          cx('fr-callout', 'fr-callout--pink-tuile', 'fr-mt-5w'),
          'sample-callout'
        )}
      >
        <h4 className={cx('fr-mb-0')}>
          <div className={cx('fr-label--disabled', 'fr-text--sm')}>ETAPE 2</div>
          Saisie des résultats d’analyse
          <div className={cx('fr-text--md', 'fr-text--regular')}>
            En attente de l’accusé de réception
          </div>
        </h4>
      </form>
    </div>
  );
};

export default SampleTracking;
