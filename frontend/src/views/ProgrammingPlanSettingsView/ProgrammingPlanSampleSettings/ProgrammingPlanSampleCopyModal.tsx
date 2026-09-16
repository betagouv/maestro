import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import { ProgrammingPlanSampleCopySetting } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import {
  SampleItemRecipientKind,
  SampleItemRecipientKindLabels
} from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { useEffect, useState } from 'react';
import { useForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';

type Props = {
  modal: ReturnType<typeof createModal>;
  copyNumber: number;
  copy: ProgrammingPlanSampleCopySetting;
  onSave: (copy: ProgrammingPlanSampleCopySetting) => void;
};

export const ProgrammingPlanSampleCopyModal = ({
  modal,
  copyNumber,
  copy,
  onSave,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [formData, setFormData] = useState(copy);

  const form = useForm(ProgrammingPlanSampleCopySetting, formData);

  const isOpen = useIsModalOpen(modal, { onConceal: form.reset });

  useEffect(() => {
    if (isOpen) {
      setFormData(copy);
    }
  }, [isOpen, copy]);

  const toggleRecipientKind = (
    recipientKind: SampleItemRecipientKind,
    checked: boolean
  ) =>
    setFormData({
      ...formData,
      recipientKinds: SampleItemRecipientKind.options.filter((kind) =>
        kind === recipientKind
          ? checked
          : formData.recipientKinds.includes(kind)
      )
    });

  const save = () =>
    form.validate(async (validCopy) => {
      onSave(validCopy);
      modal.close();
    });

  return (
    <modal.Component
      title={`Exemplaire ${copyNumber}`}
      iconId="fr-icon-microscope-line"
      concealingBackdrop={false}
      topAnchor
      buttons={[
        {
          children: 'Enregistrer',
          onClick: save,
          doClosesModal: false,
          priority: 'primary'
        }
      ]}
    >
      <ToggleSwitch
        label="Obligatoire"
        labelPosition="left"
        showCheckedHint={false}
        checked={formData.required}
        onChange={(required) => setFormData({ ...formData, required })}
        className={cx('fr-mb-2w')}
      />
      <div className={clsx('border', cx('fr-p-3w'))}>
        <Checkbox
          legend="Destinataire(s) :"
          hintText="Si plusieurs destinataires sont sélectionnés, le préleveur devra le spécifier au moment de la saisie du prélèvement."
          state={form.messageType('recipientKinds')}
          stateRelatedMessage={form.message('recipientKinds')}
          options={SampleItemRecipientKind.options.map((recipientKind) => ({
            label: SampleItemRecipientKindLabels[recipientKind],
            nativeInputProps: {
              checked: formData.recipientKinds.includes(recipientKind),
              onChange: (e) =>
                toggleRecipientKind(recipientKind, e.target.checked)
            }
          }))}
          className={cx('fr-mb-0')}
        />
      </div>
    </modal.Component>
  );
};
