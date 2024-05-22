import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { useState } from 'react';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { MatrixList } from 'shared/referential/Matrix/MatrixList';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList,
} from 'shared/referential/MatrixKind';
import { Stage, StageLabels, StageList } from 'shared/referential/Stage';
import { Sample } from 'shared/schema/Sample/Sample';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { useForm } from 'src/hooks/useForm';
interface AddMatrixProps {
  excludedList: { matrix: Matrix; stage: Stage }[];
  onAddMatrix: (matrix: Matrix, stage: Stage) => Promise<void>;
}

const addModal = createModal({
  id: 'add-modal',
  isOpenedByDefault: false,
});

const AddMatrix = ({ excludedList, onAddMatrix }: AddMatrixProps) => {
  useIsModalOpen(addModal, {
    onConceal: () => {
      setMatrix(undefined);
      setStage(undefined);
      form.reset();
    },
  });

  const [matrixKind, setMatrixKind] = useState<MatrixKind>();
  const [matrix, setMatrix] = useState<Matrix>();
  const [stage, setStage] = useState<Stage>();

  const Form = Sample.pick({
    matrixKind: true,
    matrix: true,
    stage: true,
  });

  const FormRefinement = Form.refine(
    ({ matrix, stage }) =>
      !excludedList.find(
        (excluded) => excluded.matrix === matrix && excluded.stage === stage
      ),
    {
      path: ['existingMatrix'],
      message: 'Cette matrice a déjà été ajoutée.',
    }
  );

  const form = useForm(FormRefinement, {
    matrixKind,
    matrix,
    stage,
    existingMatrix: false,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      FormRefinement.safeParse({ matrix, stage });

      await onAddMatrix(matrix!, stage!);
      addModal.close();
    });
  };

  return (
    <>
      <Button
        title="Ajouter"
        iconId="fr-icon-add-circle-line"
        priority="tertiary no outline"
        className="cell-icon"
        onClick={addModal.open}
        data-testid="add-matrix-button"
      />
      <addModal.Component
        title="Ajouter une matrice"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
          },
          {
            children: 'Ajouter',
            onClick: submit,
            doClosesModal: false,
          },
        ]}
      >
        <form data-testid="add_matrix_form">
          <AppSelect<FormShape>
            value={matrixKind ?? ''}
            options={selectOptionsFromList(MatrixKindList, {
              labels: MatrixKindLabels,
            })}
            onChange={(e) => {
              setMatrix(undefined);
              setMatrixKind(e.target.value as MatrixKind);
            }}
            inputForm={form}
            inputKey="matrixKind"
            whenValid="Catégorie de matrice correctement renseignée."
            data-testid="matrixkind-select"
            label="Catégorie de matrice (obligatoire)"
            required
          />
          <AppSelect<FormShape>
            value={matrix ?? ''}
            options={
              matrixKind
                ? selectOptionsFromList(MatrixList[matrixKind], {
                    labels: MatrixLabels,
                  })
                : []
            }
            onChange={(e) => setMatrix(e.target.value as Matrix)}
            inputForm={form}
            inputKey="matrix"
            whenValid="Matrice correctement renseignée."
            data-testid="matrix-select"
            label="Matrice (obligatoire)"
            required
          />
          <AppSelect<FormShape>
            value={stage ?? ''}
            options={selectOptionsFromList(StageList, {
              labels: StageLabels,
            })}
            onChange={(e) => setStage(e.target.value as Stage)}
            inputForm={form}
            inputKey="stage"
            whenValid="Stade de prélèvement correctement renseigné."
            data-testid="stage-select"
            label="Stade de prélèvement (obligatoire)"
            required
          />
        </form>
        {form.hasIssue('existingMatrix') && (
          <Alert
            severity="error"
            description={form.message('existingMatrix') as string}
            small
            className={cx('fr-mt-4w')}
          />
        )}
      </addModal.Component>
    </>
  );
};

export default AddMatrix;
