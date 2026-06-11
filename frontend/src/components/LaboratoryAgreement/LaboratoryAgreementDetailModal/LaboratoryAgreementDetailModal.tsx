import Button from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { ModalProps } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  agreementLabels,
  type LaboratoryAgreement,
  type LaboratoryAgreementField
} from 'maestro-shared/schema/Laboratory/LaboratoryAgreement';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import type React from 'react';
import { useEffect, useState } from 'react';
import LaboratoryAgreementButton from '../LaboratoryAgreementButton/LaboratoryAgreementButton';

type AgreementFlags = Pick<LaboratoryAgreement, LaboratoryAgreementField>;

interface Props {
  modal: {
    Component: (props: ModalProps) => React.JSX.Element;
    close: () => void;
  };
  laboratoryAgreement: LaboratoryAgreement | null;
  programmingSubPlan: ProgrammingSubPlan | null;
  laboratory: Laboratory | null;
  onSave?: (updated: LaboratoryAgreement) => Promise<void>;
}

const LaboratoryAgreementDetailModal = ({
  modal,
  laboratoryAgreement,
  programmingSubPlan,
  laboratory,
  onSave
}: Props) => {
  const [values, setValues] = useState<AgreementFlags>({
    referenceLaboratory: false,
    detectionAnalysis: false,
    confirmationAnalysis: false
  });

  useEffect(() => {
    if (laboratoryAgreement) {
      setValues({
        referenceLaboratory: laboratoryAgreement.referenceLaboratory,
        detectionAnalysis: laboratoryAgreement.detectionAnalysis,
        confirmationAnalysis: laboratoryAgreement.confirmationAnalysis
      });
    }
  }, [laboratoryAgreement]);

  const toggle = (field: keyof AgreementFlags) =>
    setValues((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <modal.Component
      title={
        laboratoryAgreement && laboratory
          ? `Agrément ${laboratory.shortName}`
          : ''
      }
      size="medium"
      iconId="fr-icon-microscope-line"
      concealingBackdrop={false}
      buttons={
        onSave
          ? [
              {
                children: 'Enregistrer',
                priority: 'primary',
                onClick: async () => {
                  if (laboratoryAgreement) {
                    await onSave({ ...laboratoryAgreement, ...values });
                  }
                }
              }
            ]
          : undefined
      }
    >
      {laboratoryAgreement && (
        <div>
          <p className={cx('fr-text--md', 'fr-mb-2w')}>
            N°
            {programmingSubPlan?.codeNat} |{' '}
            {SubstanceKindLabels[laboratoryAgreement.substanceKind]}
          </p>
          <div className={clsx(cx('fr-p-3w'), 'border')}>
            {(
              Object.entries(agreementLabels) as Array<
                [LaboratoryAgreementField, string]
              >
            ).map(([field, legend], index) => (
              <div
                key={field}
                className={clsx(
                  cx({ 'fr-mt-2w': index > 0 }),
                  'd-flex-justify-between'
                )}
              >
                <Checkbox
                  key={String(values[field])}
                  options={[
                    {
                      label: legend,
                      nativeInputProps: {
                        checked: values[field],
                        onChange: () => toggle(field)
                      }
                    }
                  ]}
                  small
                />
                <LaboratoryAgreementButton
                  field={field}
                  active={values[field]}
                  size="sm"
                  onToggle={() => toggle(field)}
                />
              </div>
            ))}
          </div>
          {onSave && (
            <Button
              className={clsx(cx('fr-mt-3v', 'fr-pl-0'), 'link-underline')}
              iconId="fr-icon-delete-line"
              priority="tertiary no outline"
              size="small"
              onClick={() =>
                setValues({
                  referenceLaboratory: false,
                  detectionAnalysis: false,
                  confirmationAnalysis: false
                })
              }
            >
              Supprimer le laboratoire
            </Button>
          )}
        </div>
      )}
    </modal.Component>
  );
};

export default LaboratoryAgreementDetailModal;
