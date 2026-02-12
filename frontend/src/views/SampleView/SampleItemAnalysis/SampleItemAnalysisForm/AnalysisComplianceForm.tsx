import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { FunctionComponent } from 'react';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import { assert, type Equals } from 'tsafe';
import check from '../../../../assets/illustrations/check.svg';
import close from '../../../../assets/illustrations/close.svg';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import { UseForm } from '../../../../hooks/useForm';

type Props = {
  partialAnalysis: Pick<PartialAnalysis, 'compliance' | 'notesOnCompliance'>;
  form: UseForm<typeof Form>;
  onUpdate: ({
    compliance,
    notesOnCompliance
  }: Pick<PartialAnalysis, 'compliance' | 'notesOnCompliance'>) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Form = Analysis.pick({
  compliance: true,
  notesOnCompliance: true
});

export const AnalysisComplianceForm: FunctionComponent<Props> = ({
  partialAnalysis,
  onUpdate,
  form,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <div
      className={clsx(
        cx('fr-callout', 'fr-m-0'),
        partialAnalysis.compliance
          ? 'fr-callout--green-emeraude'
          : partialAnalysis.compliance === false
            ? 'fr-callout--pink-tuile'
            : undefined,
        'white-container',
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
              checked: partialAnalysis.compliance === true,
              onChange: () => onUpdate({ ...partialAnalysis, compliance: true })
            },
            illustration: <img src={check} alt="" aria-hidden />
          },
          {
            label: 'Échantillon non conforme',
            nativeInputProps: {
              checked: partialAnalysis.compliance === false,
              onChange: () =>
                onUpdate({ ...partialAnalysis, compliance: false })
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
        value={partialAnalysis.notesOnCompliance ?? ''}
        onChange={(e) =>
          onUpdate({ ...partialAnalysis, notesOnCompliance: e.target.value })
        }
        inputForm={form}
        inputKey="notesOnCompliance"
        whenValid="Note additionnelle correctement renseignée"
        label="Note additionnelle"
        hintText="Champ facultatif pour précisions supplémentaires"
        style={{ width: '100%' }}
        rows={5}
        className={clsx(cx('fr-mt-2w'))}
      />
    </div>
  );
};
