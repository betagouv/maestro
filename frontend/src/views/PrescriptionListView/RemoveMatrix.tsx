import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import React, { useMemo } from 'react';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Stage, StageLabels } from 'shared/referential/Stage';
interface RemoveMatrixProps {
  matrix: Matrix;
  stages: Stage[];
  onRemove: () => Promise<void>;
}

const RemoveMatrix = ({ matrix, stages, onRemove }: RemoveMatrixProps) => {
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${matrix}-${stages}`,
        isOpenedByDefault: false
      }),
    [matrix, stages]
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
            <b>Matrice</b> : {MatrixLabels[matrix]}
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
