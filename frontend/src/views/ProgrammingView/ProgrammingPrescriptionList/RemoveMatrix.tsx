import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import {
  MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { Stage, StageLabels } from 'maestro-shared/referential/Stage';
import React, { useMemo } from 'react';
interface RemoveMatrixProps {
  matrixKind: MatrixKind;
  stages: Stage[];
  onRemove: () => Promise<void>;
}

const RemoveMatrix = ({ matrixKind, stages, onRemove }: RemoveMatrixProps) => {
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${matrixKind}-${stages}`,
        isOpenedByDefault: false
      }),
    [matrixKind, stages]
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
        title="Supprimer une matrice"
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
            <b>Matrice</b> : {MatrixKindLabels[matrixKind]}
          </li>
          <li>
            <b>Stade(s) de prélèvement</b> :{' '}
            {stages.map((stage) => StageLabels[stage]).join(', ')}
          </li>
        </ul>
      </removeModal.Component>
    </>
  );
};

export default RemoveMatrix;
