import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import React, { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import check from '../../../../../assets/illustrations/check.svg';
import close from '../../../../../assets/illustrations/close.svg';
import AppRadioButtons from '../../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppTextInput from '../../../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../../../hooks/useForm';

export type Props = {
  partialAnalysis: Pick<PartialAnalysis, 'compliance' | 'notesOnCompliance'>;
  onSave: ({
    compliance,
    notesOnCompliance
  }: Pick<Analysis, 'compliance' | 'notesOnCompliance'>) => Promise<void>;
  onBack: () => Promise<void>;
};

export const Form = Analysis.pick({
  compliance: true,
  notesOnCompliance: true
});

export const AnalysisComplianceForm: FunctionComponent<Props> = ({
  partialAnalysis,
  onSave,
  onBack,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [compliance, setCompliance] = useState(partialAnalysis.compliance);
  const [notesOnCompliance, setNotesOnCompliance] = useState(
    partialAnalysis.notesOnCompliance
  );

  const form = useForm(Form, {
    compliance,
    notesOnCompliance
  });

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async (validInput) => {
      await onSave(validInput);
    });
  };
  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12')}>
        <AppRadioButtons
          legend="Conformité globale de l'échantillon"
          options={[
            {
              label: 'Échantillon conforme',
              nativeInputProps: {
                checked: compliance === true,
                onChange: () => setCompliance(true)
              },
              illustration: <img src={check} alt="" aria-hidden />
            },
            {
              label: 'Échantillon non conforme',
              nativeInputProps: {
                checked: compliance === false,
                onChange: () => setCompliance(false)
              },
              illustration: <img src={close} alt="" aria-hidden />
            }
          ]}
          colSm={6}
          inputForm={form}
          inputKey="compliance"
          whenValid="Conformité de l'échantillon correctement renseignée"
          required
        />
      </div>
      <div className={cx('fr-col-12')}>
        <AppTextInput
          value={notesOnCompliance ?? ''}
          onChange={(e) => setNotesOnCompliance(e.target.value)}
          inputForm={form}
          inputKey="notesOnCompliance"
          whenValid="Note additionnelle correctement renseignée"
          label="Note additionnelle"
          hintText="Champ facultatif pour précisions supplémentaires"
        />
      </div>
      <hr />
      <hr />
      <div className={cx('fr-col-12')}>
        <ButtonsGroup
          inlineLayoutWhen="sm and up"
          alignment="between"
          buttons={[
            {
              priority: 'tertiary',
              onClick: async (e) => {
                e.preventDefault();
                await onBack();
              },
              title: 'Retour',
              iconId: 'fr-icon-arrow-left-line'
            },
            {
              children: "Valider l'interprétation",
              iconId: 'fr-icon-check-line',
              onClick: onSubmit
            }
          ]}
        />
      </div>
    </div>
  );
};
