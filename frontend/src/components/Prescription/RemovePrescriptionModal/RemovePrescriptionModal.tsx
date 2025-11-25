import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import React, { useMemo } from 'react';
interface Props {
  prescription: Prescription;
  onRemove: () => Promise<void>;
}

const RemovePrescriptionModal = ({ prescription, onRemove }: Props) => {
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${prescription.id}`,
        isOpenedByDefault: false
      }),
    [prescription]
  );
  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await onRemove();
    removeModal.close();
  };

  return (
    <>
      <Button
        title="Supprimer"
        iconId="fr-icon-delete-line"
        priority="tertiary"
        size="small"
        className="cell-icon"
        onClick={removeModal.open}
      />
      <removeModal.Component
        title="Supprimer une programmation"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary'
          },
          {
            children: 'Supprimer',
            onClick: submit,
            doClosesModal: false
          }
        ]}
      >
        Êtes-vous sûr de vouloir supprimer cette ligne ?
        <ul>
          <li>
            <b>Catégorie de matrice</b> :{' '}
            {MatrixKindLabels[prescription.matrixKind]}
          </li>
          {prescription.matrix && (
            <li>
              <b>Matrice</b> : {MatrixLabels[prescription.matrix]}
            </li>
          )}
          <li>
            <b>Stade(s) de prélèvement</b> :{' '}
            {prescription.stages.map((stage) => StageLabels[stage]).join(', ')}
          </li>
        </ul>
      </removeModal.Component>
    </>
  );
};

export default RemovePrescriptionModal;
