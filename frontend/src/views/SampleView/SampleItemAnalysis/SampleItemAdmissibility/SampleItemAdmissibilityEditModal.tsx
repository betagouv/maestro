import type { createModal } from '@codegouvfr/react-dsfr/Modal';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import type React from 'react';
import { type FunctionComponent, useContext, useRef } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../../../services/apiClient';
import {
  type FormRefinement,
  SampleItemAdmissibilityForm
} from './SampleItemAdmissibilityForm';

type Props = {
  sampleItem: SampleItem;
  modal: ReturnType<typeof createModal>;
};
export const SampleItemAdmissibilityEditModal: FunctionComponent<Props> = ({
  modal,
  sampleItem,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const admissibilityForm = useRef<FormRefinement>(null);

  const [updateSampleItem] = apiClient.useUpdateSampleItemMutation();

  const save = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();

    if (admissibilityForm.current) {
      const form = admissibilityForm.current;
      await form.validate(
        async ({ receiptDate, isAdmissible, notesOnAdmissibility }) => {
          await updateSampleItem({
            sampleId: sampleItem.sampleId,
            itemNumber: sampleItem.itemNumber,
            copyNumber: sampleItem.copyNumber,
            sampleItemUpdate: {
              ...sampleItem,
              receiptDate,
              isAdmissible,
              notesOnAdmissibility
            }
          });
          form.reset();
        }
      );
    }
  };

  return (
    <modal.Component
      title="Modification de la réception par le laboratoire"
      concealingBackdrop={false}
      size={'large'}
      topAnchor
      buttons={[
        {
          children: 'Annuler',
          onClick: () => ({}),
          doClosesModal: true,
          priority: 'secondary'
        },
        {
          children: 'Enregistrer',
          onClick: save,
          doClosesModal: true,
          priority: 'primary'
        }
      ]}
    >
      <SampleItemAdmissibilityForm
        sampleItem={sampleItem}
        setForm={(f) => (admissibilityForm.current = f)}
      />
    </modal.Component>
  );
};
