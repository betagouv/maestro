import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import React, { FunctionComponent, useContext, useRef } from 'react';
import { assert, type Equals } from 'tsafe';
import { ApiClientContext } from '../../../../services/apiClient';
import {
  FormRefinement,
  SampleAdmissibilityForm
} from './SampleAdmissibilityForm';

type Props = {
  sample: Sample;
  modal: ReturnType<typeof createModal>;
};
export const SampleAdmissibilityEditModal: FunctionComponent<Props> = ({
  modal,
  sample,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const admissibilityForm = useRef<FormRefinement>(null);

  const [updateSample] = apiClient.useUpdateSampleMutation();

  const save = async (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();

    if (admissibilityForm.current) {
      const form = admissibilityForm.current;
      await form.validate(
        async ({ receivedAt, isAdmissible, notesOnAdmissibility }) => {
          await updateSample({
            ...sample,
            receivedAt,
            status:
              isAdmissible === false
                ? 'NotAdmissible'
                : sample.status === 'NotAdmissible'
                  ? 'Analysis'
                  : sample.status,
            notesOnAdmissibility: notesOnAdmissibility
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
      <SampleAdmissibilityForm
        sample={sample}
        withSubmitButton={false}
        setForm={(f) => (admissibilityForm.current = f)}
      />
    </modal.Component>
  );
};
