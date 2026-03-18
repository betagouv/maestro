import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  SampleChecked,
  SampleComplianceData
} from 'maestro-shared/schema/Sample/Sample';
import {
  SampleCompliance,
  SampleComplianceByProgrammingPlanKind,
  SampleComplianceLabels
} from 'maestro-shared/schema/Sample/SampleCompliance';
import { useState } from 'react';
import check from 'src/assets/illustrations/check.svg';
import close from 'src/assets/illustrations/close.svg';
import warning from 'src/assets/illustrations/warning.svg';
import { z } from 'zod';
import AppRadioButtons from '../../../components/_app/AppRadioButtons/AppRadioButtons';
import { selectOptionsFromList } from '../../../components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from '../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from '../../../hooks/useForm';

interface Props {
  sample: SampleChecked;
  onChangeCompliance: (value: SampleComplianceData) => Promise<void>;
}

const SampleComplianceForm = ({ sample, onChangeCompliance }: Props) => {
  const [compliance, setCompliance] = useState(sample.compliance);
  const [notesOnCompliance, setNotesOnCompliance] = useState(
    sample.notesOnCompliance
  );

  const save = async () => {
    await form.validate(async () =>
      onChangeCompliance({
        compliance,
        notesOnCompliance
      })
    );
  };

  const Form = z.object({
    compliance: SampleCompliance,
    notesOnCompliance: z.string().nullish()
  });

  const form = useForm(Form, {
    compliance,
    notesOnCompliance
  });

  const sampleComplianceOptions = selectOptionsFromList(
    SampleComplianceByProgrammingPlanKind[sample.programmingPlanKind],
    {
      labels: SampleComplianceLabels,
      withDefault: false
    }
  );

  const ComplianceIllustrations: Record<SampleCompliance, string> = {
    Compliant: check,
    NonCompliant: close,
    NonCompliantAndHarmful: warning
  };

  return (
    <div className="white-container">
      <div className={cx('fr-my-5w', 'fr-mx-8w')}>
        <h3>
          <span className={cx('fr-icon-survey-line', 'fr-mr-3v')} />
          Conformité globale du prélèvement
        </h3>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppRadioButtons
              legend="Conformité globale du prélèvement"
              options={
                sampleComplianceOptions?.map(({ label, value }) => ({
                  key: `legalContext-option-${value}`,
                  label,
                  nativeInputProps: {
                    checked: compliance === value,
                    onChange: () => setCompliance(value as SampleCompliance)
                  },
                  illustration: (
                    <img
                      src={ComplianceIllustrations[value as SampleCompliance]}
                      alt=""
                      aria-hidden
                    />
                  )
                })) ?? []
              }
              colSm={4}
              inputForm={form}
              inputKey="compliance"
              whenValid="Conformité globale du prélèvement renseignée"
              required
            />
          </div>
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput
              defaultValue={notesOnCompliance ?? ''}
              onChange={(e) => setNotesOnCompliance(e.target.value)}
              inputForm={form}
              inputKey="notesOnCompliance"
              whenValid="Note correctement renseignée."
              label="Note additionnelle"
              rows={1}
            />
          </div>
          <div className={clsx(cx('fr-col-12'), 'd-flex-justify-center')}>
            <Button
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
              onClick={save}
            >
              Finaliser l'interprétation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleComplianceForm;
