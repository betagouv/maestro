import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { FunctionComponent, useState } from 'react';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { assert, type Equals } from 'tsafe';
import check from '../../../../../assets/illustrations/check.svg';
import close from '../../../../../assets/illustrations/close.svg';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import { useForm } from '../../../../hooks/useForm';

type Props = {
  partialAnalysis: Pick<PartialAnalysis, 'compliance' | 'notesOnCompliance'>;
  onUpdate: ({
    compliance,
    notesOnCompliance
  }: Pick<Analysis, 'compliance' | 'notesOnCompliance'>) => Promise<void>;
};

const Form = Analysis.pick({
  compliance: true,
  notesOnCompliance: true
});

export const AnalysisComplianceForm: FunctionComponent<Props> = ({
  partialAnalysis,
  onUpdate,
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

  return (
    <div
      className={clsx(
        cx('fr-grid-row'),
        cx('fr-callout'),
        compliance
          ? 'fr-callout--green-emeraude'
          : compliance === false
            ? 'fr-callout--pink-tuile'
            : undefined,
        'bg-white',
        'border',
        'border-bottom'
      )}
    >
      <h4>Conformité globale</h4>
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
      <AppTextAreaInput
        value={notesOnCompliance ?? ''}
        onChange={(e) => setNotesOnCompliance(e.target.value)}
        inputForm={form}
        inputKey="notesOnCompliance"
        whenValid="Note additionnelle correctement renseignée"
        label="Note additionnelle"
        hintText="Champ facultatif pour précisions supplémentaires"
        rows={5}
      />
    </div>
  );
};
