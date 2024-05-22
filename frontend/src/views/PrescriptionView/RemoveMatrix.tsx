import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useMemo } from 'react';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { Stage, StageLabels } from 'shared/referential/Stage';
interface RemoveMatrixProps {
  matrix: Matrix;
  stage: Stage;
  onRemoveMatrix: (matrix: string, stage: Stage) => Promise<void>;
}

const RemoveMatrix = ({ matrix, stage, onRemoveMatrix }: RemoveMatrixProps) => {
  const removeModal = useMemo(
    () =>
      createModal({
        id: `remove-modal-${matrix}-${stage}`,
        isOpenedByDefault: false,
      }),
    [matrix, stage]
  );
  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await onRemoveMatrix(matrix, stage);
    removeModal.close();
  };

  return (
    <>
      <Button
        title="Supprimer"
        iconId="fr-icon-delete-line"
        priority="tertiary no outline"
        size="small"
        className="cell-icon"
        onClick={removeModal.open}
      />
      <removeModal.Component
        title="Supprimer une matrice"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
          },
          {
            children: 'Supprimer',
            onClick: submit,
            doClosesModal: false,
          },
        ]}
      >
        Êtes-vous sûr de vouloir supprimer cette ligne ?
        <ul>
          <li>
            <b>Matrice</b> : {MatrixLabels[matrix]}
          </li>
          <li>
            <b>Stade de prélèvement</b> : {StageLabels[stage]}
          </li>
        </ul>
      </removeModal.Component>
    </>
  );
};

export default RemoveMatrix;
